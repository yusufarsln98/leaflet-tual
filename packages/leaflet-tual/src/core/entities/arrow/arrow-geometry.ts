import type { Head, ScreenPoint } from '../../types/index.js'

export function trimQuadBezier(
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

export function trimCubicBezier(
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

export function drawArrowHead(
  ctx: CanvasRenderingContext2D,
  tip: ScreenPoint,
  angle: number,
  headStyle: Head = 'triangle',
  color = '#1D1D1B',
  size = 14,
  lineWidth?: number,
) {
  if (headStyle === 'none') return

  ctx.save()
  ctx.translate(tip.x, tip.y)
  ctx.rotate(angle)

  if (headStyle === 'triangle') {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(-size * 1.15, -size * 0.4)
    ctx.lineTo(-size * 0.72, 0)
    ctx.lineTo(-size * 1.15, size * 0.4)
    ctx.closePath()
    ctx.fill()
  } else if (headStyle === 'open') {
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth ?? Math.max(1.5, size * 0.16)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(-size * 0.85, -size * 0.45)
    ctx.lineTo(0, 0)
    ctx.lineTo(-size * 0.85, size * 0.45)
    ctx.stroke()
  }

  ctx.restore()
}
