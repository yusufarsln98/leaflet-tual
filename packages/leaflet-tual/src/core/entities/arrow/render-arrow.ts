import type L from 'leaflet'
import type { ArrowItem, ScreenPoint, Tokens } from '../../types/index.js'
import {
  defaultVia,
  geoToScreen,
  getCubicBezierPoint,
  getQuadraticBezierPoint,
} from '../../shared/geo.js'
import {
  resolveColor,
  resolveDash,
  resolveSize,
  resolveWeight,
  resolveWidth,
} from '../../shared/theme.js'
import { drawHandle, drawLabelPill } from '../../shared/canvas-utils.js'
import { getItemZoomScale } from '../../shared/zoom.js'
import { drawArrowHead } from './arrow-geometry.js'

function trimQuadBezier(
  p0: ScreenPoint,
  p1: ScreenPoint,
  p2: ScreenPoint,
  t0: number,
  t1: number,
): { q0: ScreenPoint; q1: ScreenPoint; q2: ScreenPoint } {
  const q0 = {
    x: (1 - t0) * (1 - t0) * p0.x + 2 * (1 - t0) * t0 * p1.x + t0 * t0 * p2.x,
    y: (1 - t0) * (1 - t0) * p0.y + 2 * (1 - t0) * t0 * p1.y + t0 * t0 * p2.y,
  }
  const q1 = {
    x: (1 - t0) * (1 - t1) * p0.x + (t0 + t1 - 2 * t0 * t1) * p1.x + t0 * t1 * p2.x,
    y: (1 - t0) * (1 - t1) * p0.y + (t0 + t1 - 2 * t0 * t1) * p1.y + t0 * t1 * p2.y,
  }
  const q2 = {
    x: (1 - t1) * (1 - t1) * p0.x + 2 * (1 - t1) * t1 * p1.x + t1 * t1 * p2.x,
    y: (1 - t1) * (1 - t1) * p0.y + 2 * (1 - t1) * t1 * p1.y + t1 * t1 * p2.y,
  }
  return { q0, q1, q2 }
}

function trimCubicBezier(
  p0: ScreenPoint,
  p1: ScreenPoint,
  p2: ScreenPoint,
  p3: ScreenPoint,
  t0: number,
  t1: number,
): { q0: ScreenPoint; q1: ScreenPoint; q2: ScreenPoint; q3: ScreenPoint } {
  const a = { x: (1 - t1) * p0.x + t1 * p1.x, y: (1 - t1) * p0.y + t1 * p1.y }
  const b = { x: (1 - t1) * p1.x + t1 * p2.x, y: (1 - t1) * p1.y + t1 * p2.y }
  const c = { x: (1 - t1) * p2.x + t1 * p3.x, y: (1 - t1) * p2.y + t1 * p3.y }
  const d = { x: (1 - t1) * a.x + t1 * b.x, y: (1 - t1) * a.y + t1 * b.y }
  const e = { x: (1 - t1) * b.x + t1 * c.x, y: (1 - t1) * b.y + t1 * c.y }
  const f = { x: (1 - t1) * d.x + t1 * e.x, y: (1 - t1) * d.y + t1 * e.y }

  if (t0 <= 0.0001) {
    return { q0: p0, q1: a, q2: d, q3: f }
  }

  const u = t0 / t1
  const a2 = { x: (1 - u) * p0.x + u * a.x, y: (1 - u) * p0.y + u * a.y }
  const b2 = { x: (1 - u) * a.x + u * d.x, y: (1 - u) * a.y + u * d.y }
  const c2 = { x: (1 - u) * d.x + u * f.x, y: (1 - u) * d.y + u * f.y }
  const d2 = { x: (1 - u) * a2.x + u * b2.x, y: (1 - u) * a2.y + u * b2.y }
  const e2 = { x: (1 - u) * b2.x + u * c2.x, y: (1 - u) * b2.y + u * c2.y }
  const f2 = { x: (1 - u) * d2.x + u * e2.x, y: (1 - u) * d2.y + u * e2.y }

  return { q0: f2, q1: e2, q2: c2, q3: f }
}

export function renderArrowOnCanvas(
  ctx: CanvasRenderingContext2D,
  map: L.Map,
  arrow: ArrowItem,
  scheme: 'light' | 'dark',
  options: {
    isSelected?: boolean
    isEditing?: boolean
    tokens?: Partial<Tokens>
  } = {},
) {
  const start = geoToScreen(map, arrow.from)
  const end = geoToScreen(map, arrow.to)
  const dist = Math.hypot(end.x - start.x, end.y - start.y)
  if (dist < 1) return

  const scale = getItemZoomScale(map, arrow)
  const color = resolveColor(arrow.style?.strokeColor ?? arrow.style?.color ?? 'ink', scheme, options.tokens)
  const baseLineWidth = resolveWidth(arrow.style?.width ?? 'm')
  const lineWidth = Math.max(0.5, baseLineWidth * scale)
  const dash = resolveDash(arrow.style?.dash ?? 'solid').map((d) => d * scale)
  const heads = arrow.heads ?? { start: 'none', end: 'triangle' }
  const headBase = arrow.style?.width === 'l' ? 18 : arrow.style?.width === 's' ? 10 : 14
  const headSize = Math.max(2, headBase * scale)

  ctx.save()
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
      textColor: scheme === 'dark' ? '#ECEAE6' : '#1D1D1B',
      bgColor: scheme === 'dark' ? '#1E1E1E' : '#FFFFFF',
      borderColor: scheme === 'dark' ? '#333333' : '#E3E1DD',
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
    const handleColor = resolveColor('blue', scheme, options.tokens)
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
