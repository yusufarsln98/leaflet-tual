import type L from 'leaflet'
import type { AreaItem } from '../../../entities/index.js'
import type { TranslationTokens } from '../../../shared/i18n/types.js'
import {
  formatArea,
  geoToScreen,
  polygonArea,
} from '../../../shared/geometry/geo.js'
import {
  resolveColor,
  resolveDash,
  resolveWidth,
} from '../../../shared/theme/index.js'
import { drawHandle, drawLabelPill } from '../../../shared/drawing/canvas/canvas-utils.js'
import { getItemZoomScale } from '../../../shared/geometry/zoom.js'

export function renderAreaOnCanvas(
  ctx: CanvasRenderingContext2D,
  map: L.Map,
  area: AreaItem,
  options: {
    isSelected?: boolean
    isHovered?: boolean
    translations?: Partial<TranslationTokens>
  } = {},
) {
  if (area.points.length < 2) return

  const screenPts = area.points.map((p) => geoToScreen(map, p))
  const scale = getItemZoomScale(map, area)
  const color = resolveColor(area.style?.color ?? 'ink')
  const baseLineWidth = resolveWidth(area.style?.width ?? 'm')
  const isHoveredOnly = Boolean(options.isHovered && !options.isSelected)
  const lineWidth = Math.max(0.5, (baseLineWidth + (isHoveredOnly ? 0.75 : 0)) * scale)
  const dash = resolveDash(area.style?.dash ?? 'dashed').map((d) => d * scale)

  ctx.save()
  ctx.globalAlpha = area.style?.opacity ?? 1

  // 1. Polygon Fill & Stroke
  if (screenPts.length >= 3) {
    ctx.beginPath()
    ctx.moveTo(screenPts[0].x, screenPts[0].y)
    for (let i = 1; i < screenPts.length; i += 1) {
      ctx.lineTo(screenPts[i].x, screenPts[i].y)
    }
    ctx.closePath()

    // Fill with tint or style
    const fillAlpha =
      area.style?.fill === 'solid' ? 0.35 : area.style?.fill === 'none' ? 0 : 0.12
    if (fillAlpha > 0) {
      ctx.save()
      ctx.fillStyle = color
      ctx.globalAlpha = (area.style?.opacity ?? 1) * fillAlpha
      ctx.fill()
      ctx.restore()
    }

    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.setLineDash(dash)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
  } else if (screenPts.length === 2) {
    ctx.beginPath()
    ctx.moveTo(screenPts[0].x, screenPts[0].y)
    ctx.lineTo(screenPts[1].x, screenPts[1].y)
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.setLineDash(dash)
    ctx.stroke()
  }

  // 2. Vertex dots
  ctx.setLineDash([])
  const vertexRadius = Math.max(2, 3 * scale)
  for (const pt of screenPts) {
    ctx.beginPath()
    ctx.arc(pt.x, pt.y, vertexRadius, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
  }

  // 3. Area badge label pill at centroid
  if (screenPts.length >= 3) {
    const realArea = polygonArea(area.points)
    const text =
      area.label ?? formatArea(realArea, area.unit ?? 'metric', options.translations)

    let sumX = 0
    let sumY = 0
    for (const pt of screenPts) {
      sumX += pt.x
      sumY += pt.y
    }
    const center = { x: sumX / screenPts.length, y: sumY / screenPts.length }

    drawLabelPill(ctx, center, text, {
      textColor: '#1D1D1B',
      bgColor: '#FFFFFF',
      borderColor: '#E3E1DD',
      fontSize: 10 * scale,
      paddingX: 5 * scale,
      paddingY: 2.5 * scale,
    })
  }

  // 4. Selected vertex handles
  if (options.isSelected) {
    const handleColor = resolveColor('blue')
    const handleSize = Math.max(4, 8 * scale)
    for (const pt of screenPts) {
      drawHandle(ctx, pt, handleColor, handleSize)
    }
  }

  ctx.restore()
}
