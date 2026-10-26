import type L from 'leaflet'
import type { NoteItem, Tokens } from '../../types/index.js'
import { geoToScreen } from '../../shared/geo.js'
import {
  resolveColor,
  resolveDash,
  resolveNoteColors,
  resolveSize,
  resolveWeight,
  resolveWidth,
} from '../../shared/theme.js'
import { drawHandle } from '../../shared/canvas-utils.js'
import { getItemZoomScale } from '../../shared/zoom.js'

export function renderNoteOnCanvas(
  ctx: CanvasRenderingContext2D,
  map: L.Map,
  note: NoteItem,
  scheme: 'light' | 'dark',
  options: {
    isSelected?: boolean
    isEditing?: boolean
    tokens?: Partial<Tokens>
  } = {},
) {
  let x: number
  let y: number
  let cardW: number
  let cardH: number

  if (note.from && note.to) {
    const p1 = geoToScreen(map, note.from)
    const p2 = geoToScreen(map, note.to)
    x = Math.min(p1.x, p2.x)
    y = Math.min(p1.y, p2.y)
    cardW = Math.max(1, Math.abs(p2.x - p1.x))
    cardH = Math.max(1, Math.abs(p2.y - p1.y))
  } else if (note.at) {
    const p = geoToScreen(map, note.at)
    cardW = note.width ?? 180
    cardH = note.height ?? 120
    x = p.x - cardW / 2
    y = p.y - cardH / 2
  } else {
    return
  }

  const scale = getItemZoomScale(map, note)

  const noteColors = resolveNoteColors(
    note.style?.color ?? 'yellow',
    scheme,
    note.style?.textColor,
    note.style?.fillColor,
  )
  const baseFontSize = resolveSize(note.style?.size ?? 'm', note.style?.fontSize)
  const fontSize = Math.max(1, baseFontSize * scale)
  const weight = resolveWeight(note.style?.weight)
  const italic = note.style?.fontStyle === 'italic' ? 'italic ' : ''
  const radius = Math.max(1, (note.style?.radius ?? 8) * scale)
  const borderDash = note.style?.dash ?? 'solid'
  const borderWidth =
    borderDash === 'none' ? 0 : Math.max(0.5, resolveWidth(note.style?.width ?? 's') * scale)
  const borderColor = resolveColor(
    note.style?.strokeColor ?? note.style?.color ?? 'ink',
    scheme,
    options.tokens,
  )

  ctx.save()

  // Shadow
  if (scale >= 0.25) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)'
    ctx.shadowBlur = 8 * scale
    ctx.shadowOffsetY = 3 * scale
  }

  ctx.fillStyle = noteColors.bg
  ctx.beginPath()
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, cardW, cardH, radius)
  } else {
    ctx.rect(x, y, cardW, cardH)
  }
  ctx.fill()
  ctx.shadowColor = 'transparent'

  if (borderWidth > 0) {
    ctx.strokeStyle = borderColor
    ctx.lineWidth = borderWidth
    ctx.setLineDash(resolveDash(borderDash).map((d) => d * scale))
    ctx.beginPath()
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, cardW, cardH, radius)
    } else {
      ctx.rect(x, y, cardW, cardH)
    }
    ctx.stroke()
    ctx.setLineDash([])
  }

  // Text content
  if (note.text && !options.isEditing) {
    ctx.font = `${italic}${weight} ${fontSize}px system-ui, sans-serif`
    ctx.fillStyle = noteColors.text
    ctx.textAlign = (note.style?.align as CanvasTextAlign) ?? 'left'
    ctx.textBaseline = 'top'

    const pad = Math.max(2, 10 * scale)
    const textX = note.style?.align === 'center' ? x + cardW / 2 : note.style?.align === 'right' ? x + cardW - pad : x + pad
    let textY = y + pad
    const maxWidth = cardW - pad * 2
    const lineHeight = Math.round(fontSize * 1.35)

    if (note.title) {
      ctx.font = `600 ${fontSize}px system-ui, sans-serif`
      ctx.fillText(note.title, textX, textY)
      textY += lineHeight * 1.1
      ctx.font = `${italic}${weight} ${fontSize}px system-ui, sans-serif`
    }

    const words = note.text.split(' ')
    let line = ''
    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word
      if (ctx.measureText(testLine).width > maxWidth && line !== '') {
        ctx.fillText(line, textX, textY)
        line = word
        textY += lineHeight
        if (textY > y + cardH - pad - lineHeight) break
      } else {
        line = testLine
      }
    }
    if (line && textY <= y + cardH - pad) {
      ctx.fillText(line, textX, textY)
    }
  }

  if (options.isSelected) {
    const handleColor = resolveColor('blue', scheme, options.tokens)
    ctx.strokeStyle = handleColor
    ctx.lineWidth = Math.max(0.5, 1 * scale)
    ctx.setLineDash([4 * scale, 4 * scale])
    ctx.strokeRect(x, y, cardW, cardH)

    const handleSize = Math.max(4, 8 * scale)
    drawHandle(ctx, { x, y }, handleColor, handleSize)
    drawHandle(ctx, { x: x + cardW, y }, handleColor, handleSize)
    drawHandle(ctx, { x: x + cardW, y: y + cardH }, handleColor)
    drawHandle(ctx, { x, y: y + cardH }, handleColor)
  }

  ctx.restore()
}
