import type L from 'leaflet'
import type { FreedrawItem, ScreenPoint, Tokens } from '../../types/index.js'
import { geoToScreen } from '../../shared/geometry/geo.js'
import { resolveColor, resolveDash, resolveWidth } from '../../shared/theme/theme.js'
import { drawHandle } from '../../shared/drawing/canvas-utils.js'
import { getItemZoomScale } from '../../shared/geometry/zoom.js'

export function renderFreedrawOnCanvas(
  ctx: CanvasRenderingContext2D,
  map: L.Map,
  freedraw: FreedrawItem,
  scheme: 'light' | 'dark',
  options: {
    isSelected?: boolean
    tokens?: Partial<Tokens>
  } = {},
) {
  if (freedraw.points.length < 2) return

  const screenPoints: ScreenPoint[] = freedraw.points.map((p) => geoToScreen(map, p))
  const scale = getItemZoomScale(map, freedraw)
  const color = resolveColor(freedraw.style?.color ?? 'ink', scheme, options.tokens)
  const baseLineWidth = resolveWidth(freedraw.style?.width ?? 'm')
  const lineWidth = Math.max(0.5, baseLineWidth * scale)
  const dash = resolveDash(freedraw.style?.dash ?? 'solid').map((d) => d * scale)

  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.setLineDash(dash)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  ctx.beginPath()
  ctx.moveTo(screenPoints[0].x, screenPoints[0].y)

  if (screenPoints.length === 2) {
    ctx.lineTo(screenPoints[1].x, screenPoints[1].y)
  } else {
    for (let i = 1; i < screenPoints.length - 1; i += 1) {
      const pCurrent = screenPoints[i]
      const pNext = screenPoints[i + 1]
      const midX = (pCurrent.x + pNext.x) / 2
      const midY = (pCurrent.y + pNext.y) / 2
      ctx.quadraticCurveTo(pCurrent.x, pCurrent.y, midX, midY)
    }
    const last = screenPoints[screenPoints.length - 1]
    ctx.lineTo(last.x, last.y)
  }

  ctx.stroke()

  if (options.isSelected) {
    const handleColor = resolveColor('blue', scheme, options.tokens)
    const handleSize = Math.max(4, 8 * scale)
    drawHandle(ctx, screenPoints[0], handleColor, handleSize)
    drawHandle(ctx, screenPoints[screenPoints.length - 1], handleColor, handleSize)
  }

  ctx.restore()
}
