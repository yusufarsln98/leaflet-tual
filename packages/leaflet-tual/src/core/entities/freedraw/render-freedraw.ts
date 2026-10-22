import type L from 'leaflet'
import type {
  CanvasAnnotationTheme,
  FreeDrawItem,
  ScreenPoint,
} from '../../types/index.js'
import { distanceToSegment, geoToScreen } from '../../shared/geo.js'

export function projectFreeDraw(
  map: L.Map,
  item: Pick<FreeDrawItem, 'points'>,
): ScreenPoint[] {
  return item.points.map((pt) => geoToScreen(map, pt))
}

function traceSmoothPolyline(
  ctx: CanvasRenderingContext2D,
  points: ScreenPoint[],
) {
  if (points.length === 0) return
  ctx.moveTo(points[0].x, points[0].y)

  if (points.length === 1) {
    ctx.lineTo(points[0].x + 0.5, points[0].y + 0.5)
    return
  }

  if (points.length === 2) {
    ctx.lineTo(points[1].x, points[1].y)
    return
  }

  for (let i = 1; i < points.length - 1; i += 1) {
    const midX = (points[i].x + points[i + 1].x) / 2
    const midY = (points[i].y + points[i + 1].y) / 2
    ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY)
  }

  const last = points[points.length - 1]
  ctx.lineTo(last.x, last.y)
}

export function renderFreeDrawOnCanvas(
  ctx: CanvasRenderingContext2D,
  screenPoints: ScreenPoint[],
  item: Pick<FreeDrawItem, 'color' | 'strokeWidth' | 'dashed'>,
  options: {
    isSelected?: boolean
    isPreview?: boolean
    theme?: CanvasAnnotationTheme
  } = {},
) {
  if (screenPoints.length === 0) return

  const theme = options.theme
  ctx.save()

  if (options.isPreview) {
    ctx.globalAlpha = 0.9
  }

  if (options.isSelected) {
    ctx.save()
    ctx.beginPath()
    traceSmoothPolyline(ctx, screenPoints)
    ctx.strokeStyle = theme?.selectionGlowColor ?? 'rgba(0, 0, 0, 0.2)'
    ctx.lineWidth = item.strokeWidth + (theme?.selectionGlowWidth ?? 6)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
    ctx.restore()
  }

  ctx.save()
  ctx.shadowColor = theme?.shadowColor ?? 'rgba(0, 0, 0, 0.2)'
  ctx.shadowBlur = theme?.shadowBlur ?? 3
  ctx.shadowOffsetY = theme?.shadowOffsetY ?? 1

  ctx.beginPath()
  traceSmoothPolyline(ctx, screenPoints)
  ctx.strokeStyle = item.color
  ctx.lineWidth = item.strokeWidth
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  if (item.dashed) {
    ctx.setLineDash([item.strokeWidth * 3, item.strokeWidth * 2])
  } else {
    ctx.setLineDash([])
  }
  ctx.stroke()
  ctx.restore()

  ctx.restore()
}

export function hitTestFreeDraw(
  point: ScreenPoint,
  screenPoints: ScreenPoint[],
  item: FreeDrawItem,
  tolerance = 9,
): boolean {
  if (screenPoints.length === 0) return false
  const threshold = Math.max(tolerance, item.strokeWidth / 2 + 6)
  if (screenPoints.length === 1) {
    return (
      Math.hypot(point.x - screenPoints[0].x, point.y - screenPoints[0].y) <=
      threshold
    )
  }

  // Fast bounding box check before segment iteration
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (let i = 0; i < screenPoints.length; i += 1) {
    const p = screenPoints[i]
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
  }
  if (
    point.x < minX - threshold ||
    point.x > maxX + threshold ||
    point.y < minY - threshold ||
    point.y > maxY + threshold
  ) {
    return false
  }

  for (let i = 0; i < screenPoints.length - 1; i += 1) {
    if (
      distanceToSegment(point, screenPoints[i], screenPoints[i + 1]) <=
      threshold
    ) {
      return true
    }
  }
  return false
}

