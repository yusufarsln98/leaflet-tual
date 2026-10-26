import type L from 'leaflet'
import type { TextItem, Tokens } from '../../types/index.js'
import { geoToScreen } from '../../shared/geo.js'
import {
  resolveColor,
  resolveSize,
  resolveWeight,
} from '../../shared/theme.js'
import { drawHandle } from '../../shared/canvas-utils.js'
import { getItemZoomScale } from '../../shared/zoom.js'

export function renderTextOnCanvas(
  ctx: CanvasRenderingContext2D,
  map: L.Map,
  textItem: TextItem,
  scheme: 'light' | 'dark',
  options: {
    isSelected?: boolean
    isEditing?: boolean
    tokens?: Partial<Tokens>
  } = {},
) {
  if (!textItem.text || options.isEditing) return

  const p = geoToScreen(map, textItem.at)
  const scale = getItemZoomScale(map, textItem)
  const color = resolveColor(textItem.style?.color ?? 'ink', scheme, options.tokens)
  const baseFontSize = resolveSize(textItem.style?.size ?? 'm', textItem.style?.fontSize)
  const fontSize = Math.max(1, baseFontSize * scale)
  const weight = resolveWeight(textItem.style?.weight)
  const italic = textItem.style?.fontStyle === 'italic' ? 'italic ' : ''
  const align = textItem.style?.align ?? 'left'

  ctx.save()
  ctx.fillStyle = color
  ctx.font = `${italic}${weight} ${fontSize}px system-ui, -apple-system, sans-serif`
  ctx.textAlign = align
  ctx.textBaseline = 'top'

  const lines = textItem.text.split('\n')
  const lineHeight = fontSize * 1.25

  for (let i = 0; i < lines.length; i += 1) {
    ctx.fillText(lines[i], p.x, p.y + i * lineHeight)
  }

  if (options.isSelected) {
    const handleColor = resolveColor('blue', scheme, options.tokens)
    drawHandle(ctx, p, handleColor, Math.max(4, 8 * scale))
  }

  ctx.restore()
}

