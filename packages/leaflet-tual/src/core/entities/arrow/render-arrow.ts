import type L from 'leaflet'
import type { ArrowItem, ArrowRenderTheme, ScreenPoint } from '../../types/index.js'
import {
  computeDefaultControlGeoPoint,
  distanceToQuadraticBezier,
  distanceToSegment,
  geoToScreen,
  getQuadraticBezierPoint,
  getQuadraticEndAngle,
} from '../../shared/geo.js'
import { drawCanvasHandle, drawCanvasLabelPill } from '../../shared/canvas-render.js'
import { drawArrowHead, traceArrowPath } from './arrow-geometry.js'

export type ArrowHandleType = 'start' | 'end' | 'control'

export interface ProjectedArrow {
  start: ScreenPoint
  end: ScreenPoint
  control: ScreenPoint
}

export function projectArrow(map: L.Map, arrow: ArrowItem): ProjectedArrow {
  const start = geoToScreen(map, arrow.start)
  const end = geoToScreen(map, arrow.end)
  const needsOffsetControl =
    arrow.arrowStyle === 'curved' || arrow.arrowStyle === 's-curve'
  const controlGeo = arrow.controlPoint
    ? arrow.controlPoint
    : needsOffsetControl
      ? computeDefaultControlGeoPoint(arrow.start, arrow.end)
      : {
          lat: (arrow.start.lat + arrow.end.lat) / 2,
          lng: (arrow.start.lng + arrow.end.lng) / 2,
        }
  const control = geoToScreen(map, controlGeo)
  return { start, end, control }
}

export function renderArrowOnCanvas(
  ctx: CanvasRenderingContext2D,
  projected: ProjectedArrow,
  arrow: Pick<
    ArrowItem,
    'arrowStyle' | 'color' | 'strokeWidth' | 'dashed' | 'headStyle' | 'label'
  >,
  options: {
    isSelected?: boolean
    isPreview?: boolean
    theme?: ArrowRenderTheme
  } = {},
) {
  const { start, end, control } = projected
  const dist = Math.hypot(end.x - start.x, end.y - start.y)
  if (dist < 2) return

  const theme = options.theme
  const headSize = Math.max(12, arrow.strokeWidth * 3.8)

  let endAngle = Math.atan2(end.y - start.y, end.x - start.x)
  let startAngle = Math.atan2(start.y - end.y, start.x - end.x)

  if (arrow.arrowStyle === 'curved') {
    endAngle = getQuadraticEndAngle(start, control, end)
    startAngle = getQuadraticEndAngle(end, control, start)
  } else if (arrow.arrowStyle === 'elbow') {
    const dx = end.x - control.x
    const dy = end.y - start.y
    endAngle = Math.abs(dx) > 1 ? Math.atan2(0, dx) : Math.atan2(dy, 0)
    const sdx = start.x - control.x
    startAngle = Math.abs(sdx) > 1 ? Math.atan2(0, sdx) : Math.atan2(-dy, 0)
  } else if (arrow.arrowStyle === 's-curve') {
    const dx = end.x - start.x
    endAngle = getQuadraticEndAngle(start, { x: start.x + dx * 0.5, y: end.y }, end)
  }

  ctx.save()
  if (options.isPreview) ctx.globalAlpha = 0.85

  if (options.isSelected) {
    ctx.save()
    ctx.beginPath()
    traceArrowPath(ctx, projected, arrow.arrowStyle)
    ctx.strokeStyle = theme?.selectionGlowColor ?? 'rgba(0, 0, 0, 0.2)'
    ctx.lineWidth = arrow.strokeWidth + (theme?.selectionGlowWidth ?? 6)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
    ctx.restore()
  }

  ctx.save()
  ctx.shadowColor = theme?.shadowColor ?? 'rgba(0, 0, 0, 0.2)'
  ctx.shadowBlur = theme?.shadowBlur ?? 3
  ctx.shadowOffsetY = theme?.shadowOffsetY ?? 1.5

  ctx.beginPath()
  traceArrowPath(ctx, projected, arrow.arrowStyle)
  ctx.strokeStyle = arrow.color
  ctx.lineWidth = arrow.strokeWidth
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  const isDashed = Boolean(arrow.dashed || (arrow.arrowStyle as string) === 'dashed')
  ctx.setLineDash(isDashed ? [arrow.strokeWidth * 3, arrow.strokeWidth * 2] : [])
  ctx.stroke()

  const headStyle = arrow.headStyle ?? (arrow.arrowStyle === 'bi' ? 'both' : 'triangle')
  if (headStyle !== 'none') {
    drawArrowHead(ctx, end, endAngle, headSize, arrow.color, headStyle !== 'open')
    if (headStyle === 'both') {
      drawArrowHead(ctx, start, startAngle, headSize, arrow.color, true)
    }
  }
  ctx.restore()

  if (arrow.label) {
    const minArrowSize = typeof theme?.labelMinShapeSize === 'number' ? theme.labelMinShapeSize : 24
    if (minArrowSize <= 0 || dist >= minArrowSize) {
      const rawMid =
        arrow.arrowStyle === 'curved'
          ? getQuadraticBezierPoint(start, control, end, 0.5)
          : arrow.arrowStyle === 'elbow'
            ? { x: control.x, y: (start.y + end.y) / 2 }
            : { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 }
      const fitToShape = theme?.fitLabelsToShape !== false
      const maxW = theme?.labelMaxTextWidth ?? (fitToShape ? Math.max(48, Math.min(280, dist * 1.6)) : Infinity)
      drawCanvasLabelPill(ctx, arrow.label, Math.round(rawMid.x), Math.round(rawMid.y), arrow.color, maxW, theme)
    }
  }

  if (options.isSelected) {
    const handleRadius = theme?.handleRadius ?? 5
    const fill = theme?.handleFillColor ?? '#ffffff'
    const endpointColor = theme?.endpointHandleColor ?? '#4f4f4f'
    const controlColor = theme?.controlHandleColor ?? '#767676'
    const strokeWidth = theme?.handleStrokeWidth ?? 2

    if (arrow.arrowStyle === 'curved' || arrow.arrowStyle === 'elbow') {
      ctx.save()
      ctx.beginPath()
      ctx.setLineDash(theme?.guideLineDash ? [...theme.guideLineDash] : [4, 4])
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(control.x, control.y)
      ctx.lineTo(end.x, end.y)
      ctx.strokeStyle = theme?.guideLineColor ?? 'rgba(100, 100, 100, 0.6)'
      ctx.lineWidth = theme?.guideLineWidth ?? 1.2
      ctx.stroke()
      ctx.restore()
      drawCanvasHandle(ctx, control, controlColor, fill, handleRadius + 0.5, strokeWidth)
    }
    drawCanvasHandle(ctx, start, endpointColor, fill, handleRadius, strokeWidth)
    drawCanvasHandle(ctx, end, endpointColor, fill, handleRadius, strokeWidth)
  }

  ctx.restore()
}

export function hitTestArrowHandle(
  point: ScreenPoint,
  projected: ProjectedArrow,
  arrow: ArrowItem,
  tolerance = 11,
): ArrowHandleType | null {
  if (Math.hypot(point.x - projected.end.x, point.y - projected.end.y) <= tolerance) return 'end'
  if (Math.hypot(point.x - projected.start.x, point.y - projected.start.y) <= tolerance) return 'start'
  if (
    (arrow.arrowStyle === 'curved' || arrow.arrowStyle === 'elbow') &&
    Math.hypot(point.x - projected.control.x, point.y - projected.control.y) <= tolerance
  ) {
    return 'control'
  }
  return null
}

export function hitTestArrow(
  point: ScreenPoint,
  projected: ProjectedArrow,
  arrow: ArrowItem,
  tolerance = 9,
): boolean {
  const hitThreshold = Math.max(tolerance, arrow.strokeWidth / 2 + 6)
  if (arrow.arrowStyle === 'curved') {
    return distanceToQuadraticBezier(point, projected.start, projected.control, projected.end) <= hitThreshold
  }
  if (arrow.arrowStyle === 'elbow') {
    const c1 = { x: projected.control.x, y: projected.start.y }
    const c2 = { x: projected.control.x, y: projected.end.y }
    return (
      distanceToSegment(point, projected.start, c1) <= hitThreshold ||
      distanceToSegment(point, c1, c2) <= hitThreshold ||
      distanceToSegment(point, c2, projected.end) <= hitThreshold
    )
  }
  return distanceToSegment(point, projected.start, projected.end) <= hitThreshold
}
