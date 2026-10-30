import type { ColorName, Style } from '../../types/items.js'
import { DEFAULT_PALETTE, NOTE_SURFACES } from './theme-constants.js'

export { DEFAULT_PALETTE, DEFAULT_TOOL_STYLES, NOTE_SURFACES } from './theme-constants.js'

const isCssColor = (val: string) =>
  val.startsWith('#') || val.startsWith('rgb') || val.startsWith('hsl')

export function resolveColor(name: ColorName | string = 'ink'): string {
  if (typeof name === 'string' && isCssColor(name)) return name
  return DEFAULT_PALETTE[name as ColorName] ?? DEFAULT_PALETTE.ink
}

export function resolveNoteColors(
  color: ColorName | string = 'yellow',
  customText?: ColorName | string,
  customBg?: ColorName | string,
): { bg: string; text: string; border: string } {
  const bgKey = customBg ?? color
  if (typeof bgKey === 'string' && isCssColor(bgKey)) {
    return {
      bg: bgKey,
      text: customText ? resolveColor(customText) : '#1F2A30',
      border: 'rgba(0, 0, 0, 0.12)',
    }
  }
  const surface = NOTE_SURFACES[bgKey as ColorName] ?? NOTE_SURFACES.yellow
  return {
    bg: surface.bg,
    text: customText ? resolveColor(customText) : surface.text,
    border: surface.border,
  }
}

const WIDTH_MAP: Record<'s' | 'm' | 'l', number> = { s: 1, m: 2, l: 4 }

export function resolveWidth(width: 's' | 'm' | 'l' | number = 'm'): number {
  return typeof width === 'number' ? width : (WIDTH_MAP[width] ?? 2)
}

const SIZE_MAP: Record<'s' | 'm' | 'l' | 'xl' | 'huge', number> = {
  s: 14,
  m: 24,
  l: 40,
  xl: 72,
  huge: 120,
}

export function resolveSize(
  size: 's' | 'm' | 'l' | 'xl' | 'huge' | number = 'm',
  customPx?: number,
): number {
  if (typeof customPx === 'number' && customPx > 0) return customPx
  if (typeof size === 'number' && size > 0) return size
  return SIZE_MAP[size as keyof typeof SIZE_MAP] ?? 24
}

const WEIGHT_MAP: Record<string, string> = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  black: '800',
}

export function resolveWeight(weight?: Style['weight']): string {
  if (typeof weight === 'number') return String(weight)
  return (weight && WEIGHT_MAP[weight]) || '400'
}

export function resolveDash(dash: 'solid' | 'dashed' | 'dotted' | 'none' = 'solid'): number[] {
  if (dash === 'dashed') return [6, 6]
  if (dash === 'dotted') return [2, 4]
  return []
}
