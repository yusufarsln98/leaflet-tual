import type L from 'leaflet'
import type {
  TualAnnotationTheme,
  RulerItem,
  ScreenPoint,
} from '../../types/index.js'
import {
  calculateGeodesicDistance,
  distanceToSegment,
  formatRealWorldDistance,
  geoToScreen,
} from '../../shared/geo.js'
import {
  drawTualHandle,
  drawTualLabelPill,
} from '../../shared/tual-render.js'

export type RulerHandleType = 'start' | 'end'

export interface ProjectedRuler {
  start: ScreenPoint
  end: ScreenPoint
  mid: ScreenPoint
  lengthPx: number
  angle: number
}

export function projectRuler(
  map: L.Map,
  ruler: Pick<RulerItem, 'start' | 'end'>,
): ProjectedRuler {
  const start = geoToScreen(map, ruler.start)
  const end = geoToScreen(map, ruler.end)
  const mid = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 }
  const lengthPx = Math.hypot(end.x - start.x, end.y - start.y)
  const angle = Math.atan2(end.y - start.y, end.x - start.x)
  return { start, end, mid, lengthPx, angle }
}

export function renderRulerOnCanvas(
  ctx: CanvasRenderingContext2D,
  projected: ProjectedRuler,
  ruler: Pick<
    RulerItem,
    'start' | 'end' | 'color' | 'strokeWidth' | 'dashed' | 'label' | 'unit'
  >,
  options: {
    isSelected?: boolean
    isPreview?: boolean
    theme?: TualAnnotationTheme
  } = {},
) {
  const { start, end, mid, lengthPx, angle } = projected
  if (lengthPx < 2) return

  const theme = options.theme
  ctx.save()

  if (options.isPreview) {
    ctx.globalAlpha = 0.9
  }

  // Selection Glow
  if (options.isSelected) {
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.strokeStyle = theme?.selectionGlowColor ?? 'rgba(0, 0, 0, 0.2)'
    ctx.lineWidth = ruler.strokeWidth + (theme?.selectionGlowWidth ?? 6)
    ctx.lineCap = 'round'
    ctx.stroke()
    ctx.restore()
  }

  // Shadow
  ctx.save()
  ctx.shadowColor = theme?.shadowColor ?? 'rgba(0, 0, 0, 0.2)'
  ctx.shadowBlur = theme?.shadowBlur ?? 3
  ctx.shadowOffsetY = theme?.shadowOffsetY ?? 1.5

  // Main measurement line
  ctx.beginPath()
  ctx.moveTo(start.x, start.y)
  ctx.lineTo(end.x, end.y)
  ctx.strokeStyle = ruler.color
  ctx.lineWidth = ruler.strokeWidth
  ctx.lineCap = 'round'
  if (ruler.dashed) {
    ctx.setLineDash([ruler.strokeWidth * 3, ruler.strokeWidth * 2])
  } else {
    ctx.setLineDash([])
  }
  ctx.stroke()

  // Perpendicular end tick marks (T-caps)
  const perp = angle + Math.PI / 2
  const tickLen = Math.max(7, ruler.strokeWidth * 3.2)
  const dx = Math.cos(perp) * tickLen
  const dy = Math.sin(perp) * tickLen

  ctx.beginPath()
  ctx.setLineDash([])
  // Start cap
  ctx.moveTo(start.x - dx, start.y - dy)
  ctx.lineTo(start.x + dx, start.y + dy)
  // End cap
  ctx.moveTo(end.x - dx, end.y - dy)
  ctx.lineTo(end.x + dx, end.y + dy)
  ctx.stroke()
  ctx.restore()

  // Real world distance label badge
  const distMeters = calculateGeodesicDistance(ruler.start, ruler.end)
  const displayLabel = ruler.label
    ? ruler.label
    : formatRealWorldDistance(distMeters, ruler.unit)

  if (displayLabel) {
    const fitToShape = theme?.fitLabelsToShape !== false
    const maxW =
      theme?.labelMaxTextWidth ??
      (fitToShape ? Math.max(50, Math.min(300, lengthPx * 1.5)) : Infinity)
    drawTualLabelPill(
      ctx,
      displayLabel,
      Math.round(mid.x),
      Math.round(mid.y),
      ruler.color,
      maxW,
      theme,
    )
  }

  // Drag handles when selected
  if (options.isSelected) {
    const handleRadius = theme?.handleRadius ?? 5
    const fill = theme?.handleFillColor ?? '#ffffff'
    const endpointColor = theme?.endpointHandleColor ?? '#4f4f4f'
    const strokeWidth = theme?.handleStrokeWidth ?? 2

    drawTualHandle(ctx, start, endpointColor, fill, handleRadius, strokeWidth)
    drawTualHandle(ctx, end, endpointColor, fill, handleRadius, strokeWidth)
  }

  ctx.restore()
}

export function hitTestRulerHandle(
  point: ScreenPoint,
  projected: ProjectedRuler,
  tolerance = 11,
): RulerHandleType | null {
  if (Math.hypot(point.x - projected.end.x, point.y - projected.end.y) <= tolerance) {
    return 'end'
  }
  if (Math.hypot(point.x - projected.start.x, point.y - projected.start.y) <= tolerance) {
    return 'start'
  }
  return null
}

export function hitTestRuler(
  point: ScreenPoint,
  projected: ProjectedRuler,
  ruler: RulerItem,
  tolerance = 9,
): boolean {
  const hitThreshold = Math.max(tolerance, ruler.strokeWidth / 2 + 6)
  return distanceToSegment(point, projected.start, projected.end) <= hitThreshold
}

