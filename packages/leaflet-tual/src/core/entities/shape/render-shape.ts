import type L from 'leaflet'
import type {
  TualAnnotationTheme,
  ScreenPoint,
  ShapeItem,
} from '../../types/index.js'
import { geoToScreen } from '../../shared/geo.js'
import { drawTualHandle, drawTualLabelPill } from '../../shared/tual-render.js'
import { tracePolygonShape } from './trace-shape.js'

export type ShapeHandleType = 'start' | 'end'

export interface ProjectedShape {
  start: ScreenPoint
  end: ScreenPoint
  minX: number
  minY: number
  maxX: number
  maxY: number
  width: number
  height: number
  cx: number
  cy: number
}

export function projectShape(map: L.Map, shape: ShapeItem): ProjectedShape {
  const start = geoToScreen(map, shape.start)
  const end = geoToScreen(map, shape.end)
  const minX = Math.min(start.x, end.x)
  const minY = Math.min(start.y, end.y)
  const maxX = Math.max(start.x, end.x)
  const maxY = Math.max(start.y, end.y)
  const width = Math.max(4, maxX - minX)
  const height = Math.max(4, maxY - minY)
  return {
    start,
    end,
    minX,
    minY,
    maxX,
    maxY,
    width,
    height,
    cx: minX + width / 2,
    cy: minY + height / 2,
  }
}

export function renderShapeOnCanvas(
  ctx: CanvasRenderingContext2D,
  projected: ProjectedShape,
  shape: Pick<
    ShapeItem,
    'shape' | 'color' | 'fillColor' | 'filled' | 'strokeWidth' | 'dashed' | 'label'
  >,
  options: {
    isSelected?: boolean
    isPreview?: boolean
    theme?: TualAnnotationTheme
  } = {},
) {
  if (projected.width < 4 && projected.height < 4) return

  const theme = options.theme
  ctx.save()
  if (options.isPreview) ctx.globalAlpha = 0.85

  if (options.isSelected) {
    ctx.save()
    ctx.beginPath()
    tracePolygonShape(ctx, projected, shape.shape, theme)
    ctx.strokeStyle = theme?.selectionGlowColor ?? 'rgba(0, 0, 0, 0.2)'
    ctx.lineWidth = shape.strokeWidth + (theme?.selectionGlowWidth ?? 6)
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
  tracePolygonShape(ctx, projected, shape.shape, theme)

  if (shape.filled) {
    const defaultFillOpacity = theme?.shapeDefaultFillOpacity ?? 0.16
    const fillHex = Math.round(Math.min(1, Math.max(0, defaultFillOpacity)) * 255)
      .toString(16)
      .padStart(2, '0')
    ctx.fillStyle = shape.fillColor ?? `${shape.color}${fillHex}`
    ctx.fill()
  }

  ctx.strokeStyle = shape.color
  ctx.lineWidth = shape.strokeWidth
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.setLineDash(shape.dashed ? [shape.strokeWidth * 3, shape.strokeWidth * 2] : [])
  ctx.stroke()
  ctx.restore()

  if (shape.label) {
    const minShapeSize = typeof theme?.labelMinShapeSize === 'number' ? theme.labelMinShapeSize : 18
    if (
      minShapeSize <= 0 ||
      (Math.max(projected.width, projected.height) >= minShapeSize &&
        projected.width >= 8 &&
        projected.height >= 8)
    ) {
      const rawLabelY = shape.shape === 'actor' ? projected.maxY + 14 : projected.cy
      const fitToShape = theme?.fitLabelsToShape !== false
      const maxW =
        theme?.labelMaxTextWidth ??
        (fitToShape ? Math.max(48, Math.min(280, projected.width * 2.2)) : Infinity)
      drawTualLabelPill(ctx, shape.label, Math.round(projected.cx), Math.round(rawLabelY), shape.color, maxW, theme)
    }
  }

  if (options.isSelected) {
    const handleRadius = theme?.handleRadius ?? 5
    const fill = theme?.handleFillColor ?? '#ffffff'
    const endpointColor = theme?.endpointHandleColor ?? '#4f4f4f'
    const strokeWidth = theme?.handleStrokeWidth ?? 2

    ctx.save()
    ctx.setLineDash(theme?.guideLineDash ? [...theme.guideLineDash] : [4, 4])
    ctx.strokeStyle = theme?.guideLineColor ?? 'rgba(100, 100, 100, 0.6)'
    ctx.lineWidth = theme?.guideLineWidth ?? 1.2
    ctx.strokeRect(projected.minX, projected.minY, projected.width, projected.height)
    ctx.restore()

    drawTualHandle(ctx, projected.start, endpointColor, fill, handleRadius, strokeWidth)
    drawTualHandle(ctx, projected.end, endpointColor, fill, handleRadius, strokeWidth)
  }

  ctx.restore()
}

export function hitTestShapeHandle(
  point: ScreenPoint,
  projected: ProjectedShape,
  tolerance = 11,
): ShapeHandleType | null {
  if (Math.hypot(point.x - projected.end.x, point.y - projected.end.y) <= tolerance) return 'end'
  if (Math.hypot(point.x - projected.start.x, point.y - projected.start.y) <= tolerance) return 'start'
  return null
}

export function hitTestShape(
  point: ScreenPoint,
  projected: ProjectedShape,
  tolerance = 8,
): boolean {
  return (
    point.x >= projected.minX - tolerance &&
    point.x <= projected.maxX + tolerance &&
    point.y >= projected.minY - tolerance &&
    point.y <= projected.maxY + tolerance
  )
}
