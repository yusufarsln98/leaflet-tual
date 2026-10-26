import type L from 'leaflet'
import type { RulerItem, Tokens } from '../../types/index.js'
import {
  distance,
  formatDistance,
  geoToScreen,
} from '../../shared/geo.js'
import {
  resolveColor,
  resolveDash,
  resolveWidth,
} from '../../shared/theme.js'
import { drawHandle, drawLabelPill } from '../../shared/canvas-utils.js'
import { getItemZoomScale } from '../../shared/zoom.js'

export function renderRulerOnCanvas(
  ctx: CanvasRenderingContext2D,
  map: L.Map,
  ruler: RulerItem,
  scheme: 'light' | 'dark',
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
  const color = resolveColor(ruler.style?.color ?? 'ink', scheme, options.tokens)
  const baseLineWidth = resolveWidth(ruler.style?.width ?? 'm')
  const lineWidth = Math.max(0.5, baseLineWidth * scale)
  const dash = resolveDash(ruler.style?.dash ?? 'solid').map((d) => d * scale)

  ctx.save()
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
    textColor: scheme === 'dark' ? '#ECEAE6' : '#1D1D1B',
    bgColor: scheme === 'dark' ? '#1E1E1E' : '#FFFFFF',
    borderColor: scheme === 'dark' ? '#333333' : '#E3E1DD',
    fontSize: 10 * scale,
    paddingX: 4 * scale,
    paddingY: 2 * scale,
  })

  if (options.isSelected) {
    const handleColor = resolveColor('blue', scheme, options.tokens)
    const handleSize = Math.max(4, 8 * scale)
    drawHandle(ctx, start, handleColor, handleSize)
    drawHandle(ctx, end, handleColor, handleSize)
  }

  ctx.restore()
}
