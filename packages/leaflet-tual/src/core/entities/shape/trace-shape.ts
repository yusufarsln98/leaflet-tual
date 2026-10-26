import type { ShapeKind } from '../../types/index.js'

export interface ShapeBounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
  width: number
  height: number
  cx: number
  cy: number
}

export function traceShapePath(
  ctx: CanvasRenderingContext2D,
  kind: ShapeKind,
  b: ShapeBounds,
  radius = 8,
) {
  const { minX, minY, maxX, maxY, width, height, cx, cy } = b

  if (kind === 'square') {
    const r = Math.min(radius, width / 2, height / 2)
    if (r > 0 && typeof ctx.roundRect === 'function') {
      ctx.roundRect(minX, minY, width, height, r)
    } else {
      ctx.rect(minX, minY, width, height)
    }
    return
  }

  if (kind === 'circle') {
    ctx.ellipse(cx, cy, width / 2, height / 2, 0, 0, Math.PI * 2)
    return
  }

  if (kind === 'triangle') {
    ctx.moveTo(cx, minY)
    ctx.lineTo(maxX, maxY)
    ctx.lineTo(minX, maxY)
    ctx.closePath()
    return
  }

  if (kind === 'diamond') {
    ctx.moveTo(cx, minY)
    ctx.lineTo(maxX, cy)
    ctx.lineTo(cx, maxY)
    ctx.lineTo(minX, cy)
    ctx.closePath()
    return
  }

  if (kind === 'hexagon') {
    const rx = width / 2
    const ry = height / 2
    for (let i = 0; i < 6; i += 1) {
      const angle = (Math.PI / 3) * i - Math.PI / 6
      const px = cx + rx * Math.cos(angle)
      const py = cy + ry * Math.sin(angle)
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.closePath()
    return
  }

  if (kind === 'star') {
    const spikes = 5
    const outerRx = width / 2
    const outerRy = height / 2
    const innerRx = outerRx * 0.42
    const innerRy = outerRy * 0.42
    for (let i = 0; i < spikes * 2; i += 1) {
      const rx = i % 2 === 0 ? outerRx : innerRx
      const ry = i % 2 === 0 ? outerRy : innerRy
      const angle = (i * Math.PI) / spikes - Math.PI / 2
      const px = cx + rx * Math.cos(angle)
      const py = cy + ry * Math.sin(angle)
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.closePath()
    return
  }

  if (kind === 'marker') {
    const rx = width / 2
    const ry = height * 0.36
    const headCy = minY + ry
    ctx.moveTo(cx, maxY)
    ctx.bezierCurveTo(
      minX + width * 0.05,
      minY + height * 0.7,
      minX,
      minY + height * 0.5,
      minX,
      headCy,
    )
    ctx.ellipse(cx, headCy, rx, ry, 0, Math.PI, 0, false)
    ctx.bezierCurveTo(
      maxX,
      minY + height * 0.5,
      maxX - width * 0.05,
      minY + height * 0.7,
      cx,
      maxY,
    )
    ctx.closePath()

    const innerRx = rx * 0.35
    const innerRy = ry * 0.35
    if (innerRx >= 2.5 && innerRy >= 2.5) {
      ctx.moveTo(cx + innerRx, headCy)
      ctx.ellipse(cx, headCy, innerRx, innerRy, 0, Math.PI * 2, 0, true)
      ctx.closePath()
    }
    return
  }

  if (kind === 'actor') {
    const headRadius = Math.min(width, height) * 0.16
    const headCy = minY + headRadius + height * 0.04
    const neckY = headCy + headRadius
    const hipY = minY + height * 0.64
    const armY = minY + height * 0.42
    const armSpan = width * 0.36
    const legSpan = width * 0.32

    ctx.arc(cx, headCy, headRadius, 0, Math.PI * 2)
    ctx.closePath()
    ctx.moveTo(cx, neckY)
    ctx.lineTo(cx, hipY)
    ctx.moveTo(cx - armSpan, armY)
    ctx.lineTo(cx + armSpan, armY)
    ctx.moveTo(cx, hipY)
    ctx.lineTo(cx - legSpan, maxY)
    ctx.moveTo(cx, hipY)
    ctx.lineTo(cx + legSpan, maxY)
  }
}
