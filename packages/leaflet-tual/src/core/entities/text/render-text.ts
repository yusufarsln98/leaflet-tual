import type L from 'leaflet'
import type { TextItem, Tokens } from '../../types/index.js'
import { geoToScreen } from '../../shared/geometry/geo.js'
import {
  resolveColor,
  resolveSize,
  resolveWeight,
} from '../../shared/theme/theme.js'
import { drawHandle } from '../../shared/drawing/canvas-utils.js'
import { getItemZoomScale } from '../../shared/geometry/zoom.js'

export function renderTextOnCanvas(
  ctx: CanvasRenderingContext2D,
  map: L.Map,
  textItem: TextItem,
  _scheme: 'light' | 'dark',
  options: {
    isSelected?: boolean
    isEditing?: boolean
    tokens?: Partial<Tokens>
  } = {},
) {
  if (!textItem.text || options.isEditing) return

  const p = geoToScreen(map, textItem.at)
  const scale = getItemZoomScale(map, textItem)
  const color = resolveColor(textItem.style?.color ?? 'ink', 'light', options.tokens)
  const baseFontSize = resolveSize(textItem.style?.size ?? 'm', textItem.style?.fontSize)
  const fontSize = Math.max(1, baseFontSize * scale)
  const weight = resolveWeight(textItem.style?.weight)
  const italic = textItem.style?.fontStyle === 'italic' ? 'italic ' : ''
  const isUnderline = Boolean(
    textItem.style?.underline || textItem.style?.textDecoration === 'underline',
  )
  const align = textItem.style?.align ?? 'left'

  ctx.save()
  ctx.fillStyle = color
  ctx.font = `${italic}${weight} ${fontSize}px system-ui, -apple-system, sans-serif`
  ctx.textAlign = align
  ctx.textBaseline = 'top'

  const lines = textItem.text.split('\n')
  const lineHeight = fontSize * 1.25

  for (let i = 0; i < lines.length; i += 1) {
    const lineY = p.y + i * lineHeight
    ctx.fillText(lines[i], p.x, lineY)

    if (isUnderline && lines[i].trim()) {
      const w = ctx.measureText(lines[i]).width
      let startX = p.x
      if (align === 'center') startX = p.x - w / 2
      else if (align === 'right') startX = p.x - w

      const underlineY = lineY + fontSize + Math.max(1, fontSize * 0.1)
      ctx.beginPath()
      ctx.moveTo(startX, underlineY)
      ctx.lineTo(startX + w, underlineY)
      ctx.strokeStyle = color
      ctx.lineWidth = Math.max(1, fontSize * 0.08)
      ctx.stroke()
    }
  }

  if (options.isSelected) {
    const handleColor = resolveColor('blue', 'light', options.tokens)
    drawHandle(ctx, p, handleColor, Math.max(4, 8 * scale))
  }

  ctx.restore()
}

