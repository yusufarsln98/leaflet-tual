import type { NoteItem, ShapeItem, Style } from '../../types/items.js'
import type { Tokens } from '../../types/theme.js'
import { parseColorString } from './color-utils.js'
import {
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

/**
 * The fully resolved text styling shared by notes and shape labels.
 *
 * Keeping this in one place means the DOM overlays (notes) and the canvas
 * renderers (shapes) interpret `Style` in exactly the same way.
 */
export interface ResolvedTextStyle {
  color: string
  fontSize: number
  fontWeight: string
  fontStyle: 'normal' | 'italic'
  textDecoration: 'none' | 'underline'
  align: 'left' | 'center' | 'right'
}

/**
 * The fully resolved box styling shared by notes and shapes.
 *
 * Notes derive their colors from the soft surface palette, while shapes use
 * the regular drawing palette. Both expose the same resolved interface so
 * renderers and UI controls can stay item-agnostic.
 */
export interface ResolvedItemStyle {
  fill: NonNullable<Style['fill']>
  fillColor: string
  /** The paint to use for DOM surfaces: solid, tinted or transparent. */
  backgroundColor: string
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

function withAlpha(color: string, alpha: number): string {
  const { r, g, b, a } = parseColorString(color)
  return `rgba(${r}, ${g}, ${b}, ${a * alpha})`
}

/**
 * Resolve a shape's or note's style into the shared {@link ResolvedItemStyle}
 * interface.
 *
 * Annotations intentionally render with the fixed light palette, so the
 * `scheme` argument is only used for note surfaces today. Tokens are accepted
 * for callers that override the palette.
 */
export function resolveItemStyle(
  item: BoxItem,
  scheme: 'light' | 'dark' = 'light',
  tokens?: Partial<Tokens>,
): ResolvedItemStyle {
  const style = item.style ?? {}
  const context: BoxContext = item.type === 'note' ? 'note' : 'shape'
  const isNote = context === 'note'
  const dash = style.dash ?? 'solid'

  const baseColor = style.color ?? (isNote ? 'yellow' : 'blue')

  const noteColors = isNote
    ? resolveNoteColors(
        baseColor,
        scheme,
        style.textColor,
        style.fillColor,
      )
    : null

  const fill = style.fill ?? (isNote ? 'solid' : 'tint')
  const fillColor = noteColors
    ? noteColors.bg
    : resolveColor(style.fillColor ?? baseColor, scheme, tokens)
  const backgroundColor =
    fill === 'none'
      ? 'transparent'
      : fill === 'tint'
        ? withAlpha(fillColor, 0.25)
        : fillColor
  const strokeColor = noteColors
    ? style.strokeColor
      ? resolveColor(style.strokeColor, scheme, tokens)
      : noteColors.border
    : resolveColor(style.strokeColor ?? baseColor, scheme, tokens)

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
    fill,
    fillColor,
    backgroundColor,
    strokeColor,
    strokeWidth,
    dash,
    dashArray: resolveDash(dash),
    radius: style.radius ?? 8,
    opacity: style.opacity ?? 1,
    text: {
      color: noteColors
        ? noteColors.text
        : resolveColor(style.textColor ?? 'ink', scheme, tokens),
      fontSize,
      fontWeight: resolveWeight(style.weight),
      fontStyle: style.fontStyle === 'italic' ? 'italic' : 'normal',
      textDecoration: underline ? 'underline' : 'none',
      align: style.align ?? 'left',
    },
  }
}
