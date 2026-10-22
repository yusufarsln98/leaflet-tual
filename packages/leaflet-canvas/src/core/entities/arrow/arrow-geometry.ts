import type { ArrowItem, ScreenPoint } from '../../types/index.js'
import type { ProjectedArrow } from './render-arrow.js'

export function drawArrowHead(
  ctx: CanvasRenderingContext2D,
  tip: ScreenPoint,
  angle: number,
  size: number,
  color: string,
  filled = true,
) {
  const spread = Math.PI / 6.5
  const x1 = tip.x - size * Math.cos(angle - spread)
  const y1 = tip.y - size * Math.sin(angle - spread)
  const x2 = tip.x - size * Math.cos(angle + spread)
  const y2 = tip.y - size * Math.sin(angle + spread)

  ctx.save()
  ctx.setLineDash([])
  ctx.beginPath()
  ctx.moveTo(tip.x, tip.y)
  ctx.lineTo(x1, y1)
  if (filled) {
    ctx.lineTo(x2, y2)
    ctx.closePath()
    ctx.fillStyle = color
    ctx.fill()
  } else {
    ctx.moveTo(tip.x, tip.y)
    ctx.lineTo(x2, y2)
    ctx.strokeStyle = color
    ctx.lineWidth = Math.max(2, size / 4.5)
    ctx.lineCap = 'round'
    ctx.stroke()
  }
  ctx.restore()
}

export function traceArrowPath(
  ctx: CanvasRenderingContext2D,
  projected: ProjectedArrow,
  arrowStyle: ArrowItem['arrowStyle'],
) {
  const { start, end, control } = projected
  ctx.moveTo(start.x, start.y)
  if (arrowStyle === 'curved') {
    ctx.quadraticCurveTo(control.x, control.y, end.x, end.y)
  } else if (arrowStyle === 'elbow') {
    ctx.lineTo(control.x, start.y)
    ctx.lineTo(control.x, end.y)
    ctx.lineTo(end.x, end.y)
  } else if (arrowStyle === 's-curve') {
    const dx = end.x - start.x
    const dy = end.y - start.y
    ctx.bezierCurveTo(start.x + dx * 0.5, start.y, start.x + dx * 0.5, start.y + dy, end.x, end.y)
  } else {
    ctx.lineTo(end.x, end.y)
  }
}

