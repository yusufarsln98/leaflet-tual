import type { TualAnnotationTheme, ScreenPoint } from '../types/index.js'
import { truncateTualText } from './geo.js'

export function drawTualHandle(
  ctx: CanvasRenderingContext2D,
  pt: ScreenPoint,
  strokeColor: string,
  fillColor: string,
  radius: number,
  strokeWidth = 2,
) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2)
  ctx.fillStyle = fillColor
  ctx.fill()
  ctx.lineWidth = strokeWidth
  ctx.strokeStyle = strokeColor
  ctx.stroke()
  ctx.restore()
}

export function drawTualLabelPill(
  ctx: CanvasRenderingContext2D,
  label: string,
  midX: number,
  midY: number,
  strokeColor: string,
  maxAllowedBoxWidth: number,
  theme?: TualAnnotationTheme,
) {
  ctx.save()
  ctx.font = theme?.labelFont ?? '12px system-ui, -apple-system, sans-serif'
  const padX = theme?.labelPaddingX ?? 6
  const maxTextWidth = Math.max(10, maxAllowedBoxWidth - padX * 2)
  const displayText = truncateTualText(ctx, label, maxTextWidth)

  if (displayText) {
    const metrics = ctx.measureText(displayText)
    const boxW = Math.round(metrics.width + padX * 2)
    const boxH = theme?.labelPaddingY ?? 18
    const boxX = Math.round(midX - boxW / 2)
    const boxY = Math.round(midY - boxH / 2)
    const borderRadius = theme?.labelBorderRadius ?? 2

    if (theme?.labelShadowColor) {
      ctx.shadowColor = theme.labelShadowColor
      ctx.shadowBlur = theme.labelShadowBlur ?? 3
    }

    ctx.fillStyle = theme?.labelBackgroundColor ?? '#ffffff'
    ctx.strokeStyle = theme?.labelBorderColor ?? strokeColor
    ctx.lineWidth = theme?.labelBorderWidth ?? 1
    ctx.beginPath()
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(boxX, boxY, boxW, boxH, borderRadius)
    } else {
      ctx.rect(boxX, boxY, boxW, boxH)
    }
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = theme?.labelTextColor ?? '#000000'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(displayText, midX, midY)
  }
  ctx.restore()
}

