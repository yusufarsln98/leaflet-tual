import type L from 'leaflet'
import type { ShapeItem } from '../../types/index.js'
import { geoToScreen } from '../../shared/geometry/geo.js'
import { resolveColor, resolveItemStyle } from '../../shared/theme/index.js'
import { drawHandle, drawLabelPill } from '../../shared/drawing/canvas-utils.js'
import { getShapeLabelY } from '../../shared/drawing/shape-label.js'
import { getItemZoomScale } from '../../shared/geometry/zoom.js'
import { getShapeScreenHandles } from './shape-handles.js'
import { type ShapeBounds, traceShapePath } from './trace-shape.js'

export function renderShapeOnCanvas(
  ctx: CanvasRenderingContext2D,
  map: L.Map,
  shape: ShapeItem,
  options: {
    isSelected?: boolean
    isHovered?: boolean
    isEditing?: boolean
  } = {},
) {
  const scale = getItemZoomScale(map, shape)
  const center = geoToScreen(map, shape.at)
  const width = Math.max(1, (shape.width ?? 96) * scale)
  const height = Math.max(1, (shape.height ?? 96) * scale)
  const cx = center.x
  const cy = center.y
  const minX = cx - width / 2
  const maxX = cx + width / 2
  const minY = cy - height / 2
  const maxY = cy + height / 2

  const bounds: ShapeBounds = { minX, minY, maxX, maxY, width, height, cx, cy }
  const visual = resolveItemStyle(shape)
  const isHoveredOnly = Boolean(options.isHovered && !options.isSelected)
  const baseStroke = visual.strokeWidth > 0 ? Math.max(0.5, visual.strokeWidth * scale) : 0
  const lineWidth = isHoveredOnly && baseStroke > 0 ? baseStroke + 0.75 * scale : baseStroke

  ctx.save()
  ctx.globalAlpha = visual.opacity
  ctx.strokeStyle = visual.strokeColor
  ctx.lineWidth = lineWidth
  ctx.setLineDash(visual.dashArray.map((d) => d * scale))
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (isHoveredOnly) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.14)'
    ctx.shadowBlur = 8 * scale
    ctx.shadowOffsetY = 1.5 * scale
  }

  ctx.beginPath()
  traceShapePath(ctx, shape.kind, bounds, visual.radius * scale)

  if (visual.fill === 'solid') {
    ctx.fillStyle = visual.fillColor
    ctx.fill()
  } else if (visual.fill === 'tint') {
    ctx.save()
    ctx.globalAlpha = visual.opacity * (isHoveredOnly ? 0.36 : 0.25)
    ctx.fillStyle = visual.fillColor
    ctx.fill()
    ctx.restore()
  } else if (isHoveredOnly) {
    ctx.save()
    ctx.globalAlpha = visual.opacity * 0.08
    ctx.fillStyle = visual.strokeColor
    ctx.fill()
    ctx.restore()
  }

  if (lineWidth > 0) ctx.stroke()
  if (isHoveredOnly) {
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0
  }

  if (shape.label && !options.isEditing) {
    const labelY = getShapeLabelY(shape.labelPosition ?? 'center', minY, maxY, cy)
    drawLabelPill(ctx, { x: cx, y: labelY }, shape.label, {
      textColor: visual.text.color,
      bgColor: '#FFFFFF',
      borderColor: '#E3E1DD',
      fontSize: visual.text.fontSize * scale,
      fontWeight: visual.text.fontWeight,
      fontStyle: visual.text.fontStyle,
      underline: visual.text.textDecoration === 'underline',
      paddingX: Math.max(3, 4 * scale),
      paddingY: Math.max(1.5, 2 * scale),
    })
  }

  if (options.isSelected) {
    const handleColor = resolveColor('blue')

    ctx.save()
    ctx.strokeStyle = handleColor
    ctx.lineWidth = Math.max(0.5, scale)
    ctx.setLineDash([4 * scale, 4 * scale])
    ctx.strokeRect(minX, minY, width, height)
    ctx.restore()

    const handleSize = Math.max(4, 8 * scale)
    for (const h of getShapeScreenHandles(map, shape)) {
      drawHandle(ctx, h, handleColor, handleSize)
    }
  }

  ctx.restore()
}

