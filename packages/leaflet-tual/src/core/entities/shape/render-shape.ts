import type L from 'leaflet'
import type { ShapeItem, Tokens } from '../../types/index.js'
import { geoToScreen } from '../../shared/geo.js'
import {
  resolveColor,
  resolveDash,
  resolveSize,
  resolveWeight,
  resolveWidth,
} from '../../shared/theme.js'
import { drawHandle, drawLabelPill } from '../../shared/canvas-utils.js'
import { getShapeLabelY } from '../../shared/shape-label.js'
import { getItemZoomScale } from '../../shared/zoom.js'
import { type ShapeBounds, traceShapePath } from './trace-shape.js'

export function renderShapeOnCanvas(
  ctx: CanvasRenderingContext2D,
  map: L.Map,
  shape: ShapeItem,
  scheme: 'light' | 'dark',
  options: {
    isSelected?: boolean
    isEditing?: boolean
    tokens?: Partial<Tokens>
  } = {},
) {
  const p1 = geoToScreen(map, shape.from)
  const p2 = geoToScreen(map, shape.to)

  const minX = Math.min(p1.x, p2.x)
  const maxX = Math.max(p1.x, p2.x)
  const minY = Math.min(p1.y, p2.y)
  const maxY = Math.max(p1.y, p2.y)
  const rawWidth = maxX - minX
  const rawHeight = maxY - minY

  const width = Math.max(0.1, rawWidth)
  const height = Math.max(0.1, rawHeight)
  const cx = minX + width / 2
  const cy = minY + height / 2

  const bounds: ShapeBounds = { minX, minY, maxX, maxY, width, height, cx, cy }

  const scale = getItemZoomScale(map, shape)

  const strokeColor = resolveColor(shape.style?.strokeColor ?? shape.style?.color ?? 'ink', scheme, options.tokens)
  const fillColor = resolveColor(shape.style?.fillColor ?? shape.style?.color ?? 'ink', scheme, options.tokens)
  const baseLineWidth = resolveWidth(shape.style?.width ?? 'm')
  const lineWidth = shape.style?.dash === 'none' || shape.style?.width === 0 ? 0 : Math.max(0.5, baseLineWidth * scale)
  const dash = resolveDash(shape.style?.dash ?? 'solid').map((d) => d * scale)
  const fill = shape.style?.fill ?? 'solid'
  const radius = (shape.style?.radius ?? 8) * scale

  ctx.save()
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
    ctx.globalAlpha = 0.25
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
      textColor: scheme === 'dark' ? '#ECEAE6' : '#1D1D1B',
      bgColor: scheme === 'dark' ? '#1E1E1E' : '#FFFFFF',
      borderColor: scheme === 'dark' ? '#333333' : '#E3E1DD',
      fontSize: baseFontSize * scale,
      fontWeight: resolveWeight(shape.style?.weight),
      fontStyle: shape.style?.fontStyle,
      paddingX: Math.max(3, 4 * scale),
      paddingY: Math.max(1.5, 2 * scale),
    })
  }

  if (options.isSelected) {
    const handleColor = resolveColor('blue', scheme, options.tokens)

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
