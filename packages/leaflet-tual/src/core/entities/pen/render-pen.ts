import type L from 'leaflet'
import type { PenItem, Tokens } from '../../types/index.js'
import { geoToScreen } from '../../shared/geometry/geo.js'
import { resolveColor, resolveDash, resolveWidth } from '../../shared/theme/theme.js'
import { drawHandle } from '../../shared/drawing/canvas-utils.js'
import { getItemZoomScale } from '../../shared/geometry/zoom.js'
import { getPenSegments } from './pen-geometry.js'

export function renderPenOnCanvas(
  ctx: CanvasRenderingContext2D,
  map: L.Map,
  pen: PenItem,
  scheme: 'light' | 'dark',
  options: {
    isSelected?: boolean
    tokens?: Partial<Tokens>
  } = {},
) {
  if (pen.points.length === 0) return

  const segments = getPenSegments(pen.points, pen.closed).map((segment) => ({
    from: geoToScreen(map, segment.from),
    control1: geoToScreen(map, segment.control1),
    control2: geoToScreen(map, segment.control2),
    to: geoToScreen(map, segment.to),
  }))

  const scale = getItemZoomScale(map, pen)
  const color = resolveColor(pen.style?.color ?? 'ink', scheme, options.tokens)
  const baseLineWidth = resolveWidth(pen.style?.width ?? 'm')
  const lineWidth = Math.max(0.5, baseLineWidth * scale)
  const dash = resolveDash(pen.style?.dash ?? 'solid').map((d) => d * scale)

  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.setLineDash(dash)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (segments.length > 0) {
    ctx.beginPath()
    ctx.moveTo(segments[0].from.x, segments[0].from.y)
    for (const segment of segments) {
      ctx.bezierCurveTo(
        segment.control1.x,
        segment.control1.y,
        segment.control2.x,
        segment.control2.y,
        segment.to.x,
        segment.to.y,
      )
    }
    if (pen.closed) ctx.closePath()
    ctx.stroke()
  }

  if (options.isSelected) {
    const handleColor = resolveColor('blue', scheme, options.tokens)
    const handleSize = Math.max(4, 8 * scale)

    // Control handles make the curve editable-looking while selected.
    ctx.save()
    ctx.globalAlpha = 0.55
    ctx.lineWidth = Math.max(0.5, 1 * scale)
    ctx.setLineDash([3 * scale, 3 * scale])
    for (const point of pen.points) {
      const anchor = geoToScreen(map, point.at)
      for (const handle of [point.in, point.out]) {
        if (!handle) continue
        const control = geoToScreen(map, handle)
        ctx.beginPath()
        ctx.moveTo(anchor.x, anchor.y)
        ctx.lineTo(control.x, control.y)
        ctx.stroke()
        drawHandle(ctx, control, handleColor, handleSize)
      }
    }
    ctx.restore()

    for (const point of pen.points) {
      drawHandle(ctx, geoToScreen(map, point.at), handleColor, handleSize)
    }
  }

  ctx.restore()
}
