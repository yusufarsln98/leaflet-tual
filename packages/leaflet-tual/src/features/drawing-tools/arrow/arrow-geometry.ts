import type { Head } from '../../../entities/index.js'
import type { ScreenPoint } from '../../../shared/types/index.js'

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
