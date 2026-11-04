import type { ScreenPoint } from '../../types/index.js'

export function drawHandle(
  ctx: CanvasRenderingContext2D,
  p: ScreenPoint,
  color: string,
  size = 8,
) {
  ctx.save()
  ctx.fillStyle = '#FFFFFF'
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.rect(p.x - size / 2, p.y - size / 2, size, size)
  ctx.fill()
  ctx.stroke()
  ctx.restore()
}

export const DEFAULT_LABEL_FONT_FAMILY =
  'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

export function drawLabelPill(
  ctx: CanvasRenderingContext2D,
  center: ScreenPoint,
  text: string,
  options: {
    textColor?: string
    bgColor?: string
    borderColor?: string
    fontSize?: number
    fontWeight?: string | number
    fontStyle?: 'normal' | 'italic'
    underline?: boolean
    paddingX?: number
    paddingY?: number
    fontFamily?: string
  } = {},
) {
  if (!text) return
  ctx.save()
  ctx.globalAlpha = 1
  ctx.setLineDash([])
  const fontSize = options.fontSize ?? 10
  if (fontSize < 1) {
    ctx.restore()
    return
  }
  const weight = options.fontWeight ?? '500'
  const italic = options.fontStyle === 'italic' ? 'italic ' : ''
  let family = options.fontFamily
  if (!family && typeof window !== 'undefined' && ctx.canvas?.ownerDocument) {
    try {
      const computed = window.getComputedStyle(ctx.canvas).fontFamily
      if (computed) family = computed
    } catch {
      // fallback to default
    }
  }
  ctx.font = `${italic}${weight} ${fontSize}px ${family || DEFAULT_LABEL_FONT_FAMILY}`
  const textWidth = ctx.measureText(text).width
  const paddingX = options.paddingX ?? Math.max(2, fontSize * 0.4)
  const paddingY = options.paddingY ?? Math.max(1, fontSize * 0.2)
  const pillWidth = textWidth + paddingX * 2
  const pillHeight = fontSize + paddingY * 2
  const x = center.x - pillWidth / 2
  const y = center.y - pillHeight / 2

  if (options.bgColor) {
    ctx.fillStyle = options.bgColor
    ctx.beginPath()
    ctx.roundRect(x, y, pillWidth, pillHeight, 3)
    ctx.fill()
  }
  if (options.borderColor) {
    ctx.strokeStyle = options.borderColor
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(x, y, pillWidth, pillHeight, 3)
    ctx.stroke()
  }

  ctx.fillStyle = options.textColor ?? '#1E293B'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, center.x, center.y)

  if (options.underline) {
    ctx.strokeStyle = options.textColor ?? '#1E293B'
    ctx.lineWidth = Math.max(1, fontSize / 14)
    const underlineY = center.y + fontSize * 0.55
    ctx.beginPath()
    ctx.moveTo(center.x - textWidth / 2, underlineY)
    ctx.lineTo(center.x + textWidth / 2, underlineY)
    ctx.stroke()
  }

  ctx.restore()
}

