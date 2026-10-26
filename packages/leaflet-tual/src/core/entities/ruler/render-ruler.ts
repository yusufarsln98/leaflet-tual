import type L from 'leaflet'
import type { RulerItem, Tokens } from '../../types/index.js'
import {
  distance,
  formatDistance,
  geoToScreen,
} from '../../shared/geometry/geo.js'
import {
  resolveColor,
  resolveDash,
  resolveWidth,
} from '../../shared/theme/theme.js'
import { drawHandle, drawLabelPill } from '../../shared/drawing/canvas-utils.js'
import { getItemZoomScale } from '../../shared/geometry/zoom.js'

export function renderRulerOnCanvas(
  ctx: CanvasRenderingContext2D,
  map: L.Map,
  ruler: RulerItem,
  _scheme: 'light' | 'dark',
  options: {
    isSelected?: boolean
    tokens?: Partial<Tokens>
  } = {},
) {
  const start = geoToScreen(map, ruler.from)
  const end = geoToScreen(map, ruler.to)
  const dist = Math.hypot(end.x - start.x, end.y - start.y)
  if (dist < 1) return

  const scale = getItemZoomScale(map, ruler)
  const color = resolveColor(ruler.style?.color ?? 'ink', 'light', options.tokens)
  const baseLineWidth = resolveWidth(ruler.style?.width ?? 'm')
  const lineWidth = Math.max(0.5, baseLineWidth * scale)
  const dash = resolveDash(ruler.style?.dash ?? 'solid').map((d) => d * scale)

  ctx.save()
  ctx.globalAlpha = ruler.style?.opacity ?? 1
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.setLineDash(dash)
  ctx.lineCap = 'round'

  // Main segment
  ctx.beginPath()
  ctx.moveTo(start.x, start.y)
  ctx.lineTo(end.x, end.y)
  ctx.stroke()

  // Perpendicular end ticks
  const angle = Math.atan2(end.y - start.y, end.x - start.x)
  const tickLength = Math.max(2, lineWidth * 3.5)
  const perpAngle = angle + Math.PI / 2

  ctx.setLineDash([])
  const drawTick = (p: { x: number; y: number }) => {
    ctx.beginPath()
    ctx.moveTo(
      p.x + Math.cos(perpAngle) * tickLength,
      p.y + Math.sin(perpAngle) * tickLength,
    )
    ctx.lineTo(
      p.x - Math.cos(perpAngle) * tickLength,
      p.y - Math.sin(perpAngle) * tickLength,
    )
    ctx.stroke()
  }

  drawTick(start)
  drawTick(end)

  // Distance label
  const realMeters = distance(ruler.from, ruler.to)
  const text = ruler.label ?? formatDistance(realMeters, ruler.unit ?? 'metric')
  const center = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 }

  drawLabelPill(ctx, center, text, {
    textColor: '#1D1D1B',
    bgColor: '#FFFFFF',
    borderColor: '#E3E1DD',
    fontSize: 10 * scale,
    paddingX: 4 * scale,
    paddingY: 2 * scale,
  })

  if (options.isSelected) {
    const handleColor = resolveColor('blue', 'light', options.tokens)
    const handleSize = Math.max(4, 8 * scale)
    drawHandle(ctx, start, handleColor, handleSize)
    drawHandle(ctx, end, handleColor, handleSize)
  }

  ctx.restore()
}
