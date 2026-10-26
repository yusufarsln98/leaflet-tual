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

  const scale = getItemZoomScale(map, note)

  if (note.from && note.to) {
    const p1 = geoToScreen(map, note.from)
    const p2 = geoToScreen(map, note.to)
    const rawW = Math.max(1, Math.abs(p2.x - p1.x))
    const rawH = Math.max(1, Math.abs(p2.y - p1.y))
    const side = Math.max(rawW, rawH)
    cardW = side
    cardH = side
    const cx = (p1.x + p2.x) / 2
    const cy = (p1.y + p2.y) / 2
    x = cx - side / 2
    y = cy - side / 2
  } else if (note.at) {
    const p = geoToScreen(map, note.at)
    const baseSide = Math.max(1, note.width ?? note.height ?? 180)
    const side = Math.max(1, baseSide * scale)
    cardW = side
    cardH = side
    x = p.x - cardW / 2
    y = p.y - cardH / 2
  } else {
    return
  }

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
  const borderColor = note.style?.strokeColor
    ? resolveColor(note.style.strokeColor, scheme, options.tokens)
    : noteColors.border

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

    const isUnderline = Boolean(
      note.style?.underline || note.style?.textDecoration === 'underline',
    )

    const paragraphs = note.text.split('\n')
    for (const paragraph of paragraphs) {
      const words = paragraph.split(' ')
      let line = ''
      for (const word of words) {
        const testLine = line ? `${line} ${word}` : word
        if (ctx.measureText(testLine).width > maxWidth && line !== '') {
          ctx.fillText(line, textX, textY)
          if (isUnderline && line.trim()) {
            const w = ctx.measureText(line).width
            let startX = textX
            if (note.style?.align === 'center') startX = textX - w / 2
            else if (note.style?.align === 'right') startX = textX - w
            ctx.beginPath()
            ctx.moveTo(startX, textY + fontSize + 1)
            ctx.lineTo(startX + w, textY + fontSize + 1)
            ctx.strokeStyle = noteColors.text
            ctx.lineWidth = Math.max(1, fontSize * 0.08)
            ctx.stroke()
          }
          line = word
          textY += lineHeight
          if (textY > y + cardH - pad - lineHeight) break
        } else {
          line = testLine
        }
      }
      if (line && textY <= y + cardH - pad) {
        ctx.fillText(line, textX, textY)
        if (isUnderline && line.trim()) {
          const w = ctx.measureText(line).width
          let startX = textX
          if (note.style?.align === 'center') startX = textX - w / 2
          else if (note.style?.align === 'right') startX = textX - w
          ctx.beginPath()
          ctx.moveTo(startX, textY + fontSize + 1)
          ctx.lineTo(startX + w, textY + fontSize + 1)
          ctx.strokeStyle = noteColors.text
          ctx.lineWidth = Math.max(1, fontSize * 0.08)
          ctx.stroke()
        }
        textY += lineHeight
      }
      if (textY > y + cardH - pad - lineHeight) break
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
