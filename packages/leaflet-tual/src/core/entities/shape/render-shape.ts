import type L from 'leaflet'
import type { GeoPoint, ScreenPoint, ShapeItem, Tokens } from '../../types/index.js'
import { geoToScreen } from '../../shared/geometry/geo.js'
import {
  resolveColor,
  resolveDash,
  resolveSize,
  resolveWeight,
  resolveWidth,
} from '../../shared/theme/theme.js'
import { drawHandle, drawLabelPill } from '../../shared/drawing/canvas-utils.js'
import { getShapeLabelY } from '../../shared/drawing/shape-label.js'
import { getItemZoomScale } from '../../shared/geometry/zoom.js'
import { type ShapeBounds, traceShapePath } from './trace-shape.js'

export function renderShapeOnCanvas(
  ctx: CanvasRenderingContext2D,
  map: L.Map,
  shape: ShapeItem,
  _scheme: 'light' | 'dark',
  options: {
    isSelected?: boolean
    isEditing?: boolean
    tokens?: Partial<Tokens>
  } = {},
) {
  let center: ScreenPoint
  let rawWidth: number
  let rawHeight: number
  const scale = getItemZoomScale(map, shape)

  if (shape.at) {
    center = geoToScreen(map, shape.at)
    rawWidth = Math.max(1, (shape.width ?? 96) * scale)
    rawHeight = Math.max(1, (shape.height ?? 96) * scale)
  } else {
    const legacy = shape as unknown as { from?: GeoPoint; to?: GeoPoint }
    if (legacy.from && legacy.to) {
      const p1 = geoToScreen(map, legacy.from)
      const p2 = geoToScreen(map, legacy.to)
      const minX = Math.min(p1.x, p2.x)
      const maxX = Math.max(p1.x, p2.x)
      const minY = Math.min(p1.y, p2.y)
      const maxY = Math.max(p1.y, p2.y)
      rawWidth = Math.max(1, maxX - minX)
      rawHeight = Math.max(1, maxY - minY)
      center = { x: minX + rawWidth / 2, y: minY + rawHeight / 2 }
    } else {
      return
    }
  }

  const minX = center.x - rawWidth / 2
  const maxX = center.x + rawWidth / 2
  const minY = center.y - rawHeight / 2
  const maxY = center.y + rawHeight / 2
  const cx = center.x
  const cy = center.y
  const width = rawWidth
  const height = rawHeight

  const bounds: ShapeBounds = { minX, minY, maxX, maxY, width, height, cx, cy }

  const strokeColor = resolveColor(shape.style?.strokeColor ?? shape.style?.color ?? 'blue', 'light', options.tokens)
  const fillColor = resolveColor(shape.style?.fillColor ?? shape.style?.color ?? 'blue', 'light', options.tokens)
  const baseLineWidth = resolveWidth(shape.style?.width ?? 'm')
  const lineWidth = shape.style?.dash === 'none' || shape.style?.width === 0 ? 0 : Math.max(0.5, baseLineWidth * scale)
  const dash = resolveDash(shape.style?.dash ?? 'solid').map((d) => d * scale)
  const fill = shape.style?.fill ?? 'solid'
  const radius = (shape.style?.radius ?? 8) * scale
  const itemOpacity = shape.style?.opacity ?? 1

  ctx.save()
  ctx.globalAlpha = itemOpacity
  ctx.strokeStyle = strokeColor
  ctx.lineWidth = lineWidth
  ctx.setLineDash(dash)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  ctx.beginPath()
  traceShapePath(ctx, shape.kind, bounds, radius)

  if (fill === 'solid') {
    ctx.fillStyle = fillColor
    ctx.fill()
  } else if (fill === 'tint') {
    ctx.save()
    ctx.globalAlpha = itemOpacity * 0.25
    ctx.fillStyle = fillColor
    ctx.fill()
    ctx.restore()
  }

  if (shape.style?.dash !== 'none' && lineWidth > 0) {
    ctx.stroke()
  }

  if (shape.label && !options.isEditing) {
    const position = shape.labelPosition ?? 'center'
    const labelY = getShapeLabelY(position, minY, maxY, cy)
    const baseFontSize = shape.style?.fontSize ?? (shape.style?.size ? resolveSize(shape.style.size) : 12)
    drawLabelPill(ctx, { x: cx, y: labelY }, shape.label, {
      textColor: '#1D1D1B',
      bgColor: '#FFFFFF',
      borderColor: '#E3E1DD',
      fontSize: baseFontSize * scale,
      fontWeight: resolveWeight(shape.style?.weight),
      fontStyle: shape.style?.fontStyle,
      underline: Boolean(shape.style?.underline || shape.style?.textDecoration === 'underline'),
      paddingX: Math.max(3, 4 * scale),
      paddingY: Math.max(1.5, 2 * scale),
    })
  }

  if (options.isSelected) {
    const handleColor = resolveColor('blue', 'light', options.tokens)

    // Selection frame between the resize handles.
    ctx.save()
    ctx.strokeStyle = handleColor
    ctx.lineWidth = Math.max(0.5, 1 * scale)
    ctx.setLineDash([4 * scale, 4 * scale])
    ctx.strokeRect(minX, minY, rawWidth, rawHeight)
    ctx.restore()

    const handleSize = Math.max(4, 8 * scale)
    drawHandle(ctx, { x: minX, y: minY }, handleColor, handleSize)
    drawHandle(ctx, { x: maxX, y: minY }, handleColor, handleSize)
    drawHandle(ctx, { x: maxX, y: maxY }, handleColor, handleSize)
    drawHandle(ctx, { x: minX, y: maxY }, handleColor, handleSize)
    drawHandle(ctx, { x: cx, y: minY }, handleColor, handleSize)
    drawHandle(ctx, { x: cx, y: maxY }, handleColor, handleSize)
    drawHandle(ctx, { x: minX, y: cy }, handleColor, handleSize)
    drawHandle(ctx, { x: maxX, y: cy }, handleColor, handleSize)
  }

  ctx.restore()
}
