import type L from 'leaflet'
import type { ArrowItem, ScreenPoint } from '../../types/index.js'
import {
  defaultVia,
  geoToScreen,
  getCubicBezierPoint,
  getQuadraticBezierPoint,
} from '../../shared/geometry/geo.js'
import {
  resolveColor,
  resolveDash,
  resolveSize,
  resolveWeight,
  resolveWidth,
} from '../../shared/theme/theme.js'
import { drawHandle, drawLabelPill } from '../../shared/drawing/canvas-utils.js'
import { getItemZoomScale } from '../../shared/geometry/zoom.js'
import { drawArrowHead, trimCubicBezier, trimQuadBezier } from './arrow-geometry.js'

export function renderArrowOnCanvas(
  ctx: CanvasRenderingContext2D,
  map: L.Map,
  arrow: ArrowItem,
  options: {
    isSelected?: boolean
    isEditing?: boolean
  } = {},
) {
  const start = geoToScreen(map, arrow.from)
  const end = geoToScreen(map, arrow.to)
  const dist = Math.hypot(end.x - start.x, end.y - start.y)
  if (dist < 1) return

  const scale = getItemZoomScale(map, arrow)
  const color = resolveColor(arrow.style?.strokeColor ?? arrow.style?.color ?? 'ink')
  const baseLineWidth = resolveWidth(arrow.style?.width ?? 'm')
  const lineWidth = Math.max(0.5, baseLineWidth * scale)
  const dash = resolveDash(arrow.style?.dash ?? 'solid').map((d) => d * scale)
  const heads = arrow.heads ?? { start: 'none', end: 'triangle' }
  const headBase = arrow.style?.width === 'l' ? 18 : arrow.style?.width === 's' ? 10 : 14
  const headSize = Math.max(2, headBase * scale)

  ctx.save()
  ctx.globalAlpha = arrow.style?.opacity ?? 1
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.setLineDash(dash)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  let startAngle = Math.atan2(start.y - end.y, start.x - end.x)
  let endAngle = Math.atan2(end.y - start.y, end.x - start.x)
  let labelCenter: ScreenPoint = {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2,
  }

  const startOffset = heads.start === 'triangle' ? headSize * 0.72 - 1.5 : 0
  const endOffset = heads.end === 'triangle' ? headSize * 0.72 - 1.5 : 0

  let viaScreen: ScreenPoint | null = null

  ctx.beginPath()

  if (arrow.kind === 'linear') {
    if (dist > startOffset + endOffset) {
      const angle = Math.atan2(end.y - start.y, end.x - start.x)
      const sx = start.x + Math.cos(angle) * startOffset
      const sy = start.y + Math.sin(angle) * startOffset
      const ex = end.x - Math.cos(angle) * endOffset
      const ey = end.y - Math.sin(angle) * endOffset
      ctx.moveTo(sx, sy)
      ctx.lineTo(ex, ey)
      ctx.stroke()
    }
  } else if (arrow.kind === 'curved') {
    const viaGeo = arrow.via ?? defaultVia(arrow.from, arrow.to)
    viaScreen = geoToScreen(map, viaGeo)
    startAngle = Math.atan2(start.y - viaScreen.y, start.x - viaScreen.x)
    endAngle = Math.atan2(end.y - viaScreen.y, end.x - viaScreen.x)
    labelCenter = getQuadraticBezierPoint(start, viaScreen, end, 0.5)

    const approxLen =
      Math.hypot(viaScreen.x - start.x, viaScreen.y - start.y) +
      Math.hypot(end.x - viaScreen.x, end.y - viaScreen.y)

    const t0 = startOffset > 0 && approxLen > 0 ? Math.min(0.45, startOffset / approxLen) : 0
    const t1 = endOffset > 0 && approxLen > 0 ? Math.max(0.55, 1 - endOffset / approxLen) : 1

    if (t0 < t1) {
      const { q0, q1, q2 } = trimQuadBezier(start, viaScreen, end, t0, t1)
      ctx.moveTo(q0.x, q0.y)
      ctx.quadraticCurveTo(q1.x, q1.y, q2.x, q2.y)
      ctx.stroke()
    }
  } else if (arrow.kind === 'elbow') {
    const corner: ScreenPoint = { x: end.x, y: start.y }
    startAngle = Math.atan2(start.y - corner.y, start.x - corner.x)
    endAngle = Math.atan2(end.y - corner.y, end.x - corner.x)
    labelCenter = { x: (corner.x + end.x) / 2, y: (corner.y + end.y) / 2 }

    const segStartLen = Math.hypot(corner.x - start.x, corner.y - start.y)
    const clampedStartOffset = Math.min(startOffset, Math.max(0, segStartLen - 2))
    const segEndLen = Math.hypot(end.x - corner.x, end.y - corner.y)
    const clampedEndOffset = Math.min(endOffset, Math.max(0, segEndLen - 2))

    const sx = start.x - Math.cos(startAngle) * clampedStartOffset
    const sy = start.y - Math.sin(startAngle) * clampedStartOffset
    const ex = end.x - Math.cos(endAngle) * clampedEndOffset
    const ey = end.y - Math.sin(endAngle) * clampedEndOffset

    ctx.moveTo(sx, sy)
    ctx.lineTo(corner.x, corner.y)
    ctx.lineTo(ex, ey)
    ctx.stroke()
  } else if (arrow.kind === 's-curve') {
    const c1: ScreenPoint = { x: start.x + (end.x - start.x) * 0.5, y: start.y }
    const c2: ScreenPoint = { x: start.x + (end.x - start.x) * 0.5, y: end.y }
    startAngle = Math.atan2(start.y - c1.y, start.x - c1.x)
    endAngle = Math.atan2(end.y - c2.y, end.x - c2.x)
    labelCenter = getCubicBezierPoint(start, c1, c2, end, 0.5)

    const approxLen =
      Math.hypot(c1.x - start.x, c1.y - start.y) +
      Math.hypot(c2.x - c1.x, c2.y - c1.y) +
      Math.hypot(end.x - c2.x, end.y - c2.y)

    const t0 = startOffset > 0 && approxLen > 0 ? Math.min(0.45, startOffset / approxLen) : 0
    const t1 = endOffset > 0 && approxLen > 0 ? Math.max(0.55, 1 - endOffset / approxLen) : 1

    if (t0 < t1) {
      const { q0, q1, q2, q3 } = trimCubicBezier(start, c1, c2, end, t0, t1)
      ctx.moveTo(q0.x, q0.y)
      ctx.bezierCurveTo(q1.x, q1.y, q2.x, q2.y, q3.x, q3.y)
      ctx.stroke()
    }
  }

  // Draw arrowheads
  if (heads.start && heads.start !== 'none') {
    drawArrowHead(ctx, start, startAngle, heads.start, color, headSize, lineWidth)
  }
  if (heads.end && heads.end !== 'none') {
    drawArrowHead(ctx, end, endAngle, heads.end, color, headSize, lineWidth)
  }

  // Draw label
  if (arrow.label && !options.isEditing) {
    const baseFontSize = arrow.style?.fontSize ?? (arrow.style?.size ? resolveSize(arrow.style.size) : 12)
    drawLabelPill(ctx, labelCenter, arrow.label, {
      textColor: '#1D1D1B',
      bgColor: '#FFFFFF',
      borderColor: '#E3E1DD',
      fontSize: baseFontSize * scale,
      fontWeight: resolveWeight(arrow.style?.weight),
      fontStyle: arrow.style?.fontStyle,
      underline: Boolean(arrow.style?.underline || arrow.style?.textDecoration === 'underline'),
      paddingX: Math.max(3, 4 * scale),
      paddingY: Math.max(1.5, 2 * scale),
    })
  }

  // Draw selection handles
  if (options.isSelected) {
    const handleColor = resolveColor('blue')
    const handleSize = Math.max(4, 8 * scale)

    // Curved arrows get a dashed guide from start → control point → end.
    if (viaScreen) {
      ctx.save()
      ctx.strokeStyle = handleColor
      ctx.lineWidth = Math.max(0.5, 1 * scale)
      ctx.setLineDash([4 * scale, 4 * scale])
      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(viaScreen.x, viaScreen.y)
      ctx.lineTo(end.x, end.y)
      ctx.stroke()
      ctx.restore()
    }

    drawHandle(ctx, start, handleColor, handleSize)
    drawHandle(ctx, end, handleColor, handleSize)
    if (viaScreen) {
      drawHandle(ctx, viaScreen, handleColor, handleSize)
    }
  }

  ctx.restore()
}
