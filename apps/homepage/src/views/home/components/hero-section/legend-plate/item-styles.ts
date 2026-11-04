import { DEFAULT_PALETTE, NOTE_SURFACES, resolveDash, resolveWidth } from 'leaflet-tual'

/**
 * Actual item styling primitives, mirrored from the leaflet-tual canvas so the
 * hero preview stays faithful to the real editor output.
 */

export const NOTE_SURFACE = NOTE_SURFACES.yellow

export const STROKE = {
  s: resolveWidth('s'),
  m: resolveWidth('m'),
  l: resolveWidth('l'),
} as const

export const DASH = {
  dashed: resolveDash('dashed'),
} as const

export const HANDLE_COLOR = DEFAULT_PALETTE.blue
export const LABEL_BG = '#FFFFFF'
export const LABEL_BORDER = '#E3E1DD'
export const LABEL_TEXT = DEFAULT_PALETTE.ink
export const LABEL_FONT = 'system-ui, -apple-system, sans-serif'

export function tint(color: string) {
  return `color-mix(in srgb, ${color} 25%, transparent)`
}
