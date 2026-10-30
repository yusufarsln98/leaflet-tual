import type { ColorName, Style } from '../../types/items.js'
import type { Scheme, Theme, Tokens } from '../../types/theme.js'
import {
  DEFAULT_PALETTE,
  DEFAULT_SCHEME,
  NOTE_SURFACES,
} from './theme-constants.js'

export {
  DEFAULT_PALETTE,
  DEFAULT_SCHEME,
  DEFAULT_TOOL_STYLES,
  NOTE_SURFACES,
} from './theme-constants.js'

const isCssColor = (val: string) =>
  val.startsWith('#') || val.startsWith('rgb') || val.startsWith('hsl')

export function resolveColor(
  name: ColorName | string = 'ink',
  _scheme: 'light' | 'dark' = 'light',
  tokens?: Partial<Tokens>,
): string {
  if (typeof name === 'string' && isCssColor(name)) return name
  const custom = tokens?.palette?.[name as ColorName]
  if (custom) return custom.light
  return (DEFAULT_PALETTE[name as ColorName] ?? DEFAULT_PALETTE.ink).light
}

export function resolveNoteColors(
  color: ColorName | string = 'yellow',
  _scheme: 'light' | 'dark' = 'light',
  customText?: ColorName | string,
  customBg?: ColorName | string,
): { bg: string; text: string; border: string } {
  const bgKey = customBg ?? color
  if (typeof bgKey === 'string' && isCssColor(bgKey)) {
    return {
      bg: bgKey,
      text: customText ? resolveColor(customText, 'light') : '#1F2A30',
      border: 'rgba(0, 0, 0, 0.12)',
    }
  }
  const { light } = NOTE_SURFACES[bgKey as ColorName] ?? NOTE_SURFACES.yellow
  return {
    bg: light.bg,
    text: customText ? resolveColor(customText, 'light') : light.text,
    border: light.border,
  }
}

const WIDTH_MAP: Record<'s' | 'm' | 'l', number> = { s: 1, m: 2, l: 4 }

export function resolveWidth(width: 's' | 'm' | 'l' | number = 'm'): number {
  return typeof width === 'number' ? width : (WIDTH_MAP[width] ?? 2)
}

const SIZE_MAP: Record<'s' | 'm' | 'l' | 'xl', number> = { s: 12, m: 16, l: 24, xl: 32 }

export function resolveSize(
  size: 's' | 'm' | 'l' | 'xl' | number = 'm',
  customPx?: number,
): number {
  if (typeof customPx === 'number' && customPx > 0) return customPx
  if (typeof size === 'number' && size > 0) return size
  return SIZE_MAP[size as keyof typeof SIZE_MAP] ?? 16
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

export function resolveScheme(
  schemeName: 'light' | 'dark',
  tokens?: Partial<Tokens>,
): Scheme {
  const base = DEFAULT_SCHEME[schemeName]
  const overrides = schemeName === 'dark' ? tokens?.dark : tokens?.light
  return { ...base, ...overrides }
}

export function resolveSchemeFromTheme(theme: Theme = 'system'): 'light' | 'dark' {
  if (theme === 'light' || theme === 'dark') return theme
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

