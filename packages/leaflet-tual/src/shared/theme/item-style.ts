import type { NoteItem, ShapeItem, Style } from '../../entities/index.js'
import {
  DEFAULT_PALETTE,
  resolveColor,
  resolveDash,
  resolveNoteColors,
  resolveSize,
  resolveWeight,
  resolveWidth,
} from './theme.js'

/** Items that paint a filled box with a border and, optionally, text. */
export type BoxItem = ShapeItem | NoteItem

/** Visual context for resolving box styles. */
export type BoxContext = 'shape' | 'note'

export type ResolvedDash = NonNullable<Style['dash']>

export interface ResolvedTextStyle {
  color: string
  fontSize: number
  fontWeight: string
  fontStyle: 'normal' | 'italic'
  textDecoration: 'none' | 'underline'
  align: 'left' | 'center' | 'right'
}

export interface ResolvedItemStyle {
  fillColor: string
  strokeColor: string
  strokeWidth: number
  dash: ResolvedDash
  dashArray: number[]
  radius: number
  opacity: number
  text: ResolvedTextStyle
}

const NOTE_DEFAULT_FONT_SIZE = 16
const SHAPE_LABEL_DEFAULT_FONT_SIZE = 12

export function resolveItemStyle(item: BoxItem): ResolvedItemStyle {
  const style = item.style ?? {}
  const context: BoxContext = item.type === 'note' ? 'note' : 'shape'
  const isNote = context === 'note'
  const dash = style.dash ?? 'solid'

  const baseColor = style.color ?? (isNote ? DEFAULT_PALETTE.yellow : DEFAULT_PALETTE.blue)

  const noteColors = isNote
    ? resolveNoteColors(baseColor, style.textColor, style.fillColor)
    : null

  const fillColor = noteColors
    ? noteColors.bg
    : resolveColor(style.fillColor ?? baseColor)
  const strokeColor = noteColors
    ? style.strokeColor
      ? resolveColor(style.strokeColor)
      : noteColors.border
    : resolveColor(style.strokeColor ?? baseColor)

  const strokeWidth =
    dash === 'none' || style.width === 0
      ? 0
      : resolveWidth(style.width ?? (isNote ? 's' : 'm'))

  const defaultFontSize = isNote
    ? NOTE_DEFAULT_FONT_SIZE
    : SHAPE_LABEL_DEFAULT_FONT_SIZE
  const fontSize =
    style.fontSize ?? (style.size ? resolveSize(style.size) : defaultFontSize)
  const underline = Boolean(
    style.underline || style.textDecoration === 'underline',
  )

  return {
    fillColor,
    strokeColor,
    strokeWidth,
    dash,
    dashArray: resolveDash(dash),
    radius: style.radius ?? 8,
    opacity: style.opacity ?? (isNote ? 1 : 0.5),
    text: {
      color: noteColors
        ? noteColors.text
        : resolveColor(style.textColor ?? DEFAULT_PALETTE.ink),
      fontSize,
      fontWeight: resolveWeight(style.weight),
      fontStyle: style.fontStyle === 'italic' ? 'italic' : 'normal',
      textDecoration: underline ? 'underline' : 'none',
      align: style.align ?? 'left',
    },
  }
}

/**
 * Returns the next horizontal text alignment in the toggle cycle: left -> center -> right -> left.
 */
export function getNextAlign(align?: Style['align']): 'left' | 'center' | 'right' {
  if (align === 'center') return 'right'
  if (align === 'right') return 'left'
  return 'center'
}

/**
 * Toggles font weight between regular and bold.
 */
export function toggleBoldStyle(style: Style = {}): Partial<Style> {
  const isBold = String(style.weight) === 'bold' || String(style.weight) === '700' || String(style.weight) === 'black'
  return { weight: isBold ? 'regular' : 'bold' }
}

/**
 * Toggles font style between normal and italic.
 */
export function toggleItalicStyle(style: Style = {}): Partial<Style> {
  const isItalic = style.fontStyle === 'italic'
  return { fontStyle: isItalic ? 'normal' : 'italic' }
}

/**
 * Toggles underline decoration.
 */
export function toggleUnderlineStyle(style: Style = {}): Partial<Style> {
  const isUnderline = Boolean(style.underline || style.textDecoration === 'underline')
  return {
    underline: !isUnderline,
    textDecoration: !isUnderline ? 'underline' : 'none',
  }
}

