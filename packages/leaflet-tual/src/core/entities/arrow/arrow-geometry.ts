import type { Head, ScreenPoint } from '../../types/index.js'

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
