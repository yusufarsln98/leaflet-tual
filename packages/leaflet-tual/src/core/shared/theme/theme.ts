import type { ColorName, Style } from '../../types/items.js'
import type { Scheme, Tokens } from '../../types/theme.js'
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

export function resolveColor(
  name: ColorName | string = 'ink',
  _scheme: 'light' | 'dark' = 'light',
  tokens?: Partial<Tokens>,
): string {
  if (typeof name === 'string' && (name.startsWith('#') || name.startsWith('rgb') || name.startsWith('hsl'))) {
    return name
  }
  const custom = tokens?.palette?.[name as ColorName]
  if (custom) {
    return custom.light
  }
  const entry = DEFAULT_PALETTE[name as ColorName] ?? DEFAULT_PALETTE.ink
  return entry.light
}

export function resolveNoteColors(
  color: ColorName | string = 'yellow',
  _scheme: 'light' | 'dark' = 'light',
  customText?: ColorName | string,
  customBg?: ColorName | string,
): { bg: string; text: string; border: string } {
  const bgKey = customBg ?? color
  if (typeof bgKey === 'string' && (bgKey.startsWith('#') || bgKey.startsWith('rgb') || bgKey.startsWith('hsl'))) {
    return {
      bg: bgKey,
      text: customText ? resolveColor(customText, 'light') : '#1F2A30',
      border: 'rgba(0, 0, 0, 0.12)',
    }
  }
  const entry = NOTE_SURFACES[bgKey as ColorName] ?? NOTE_SURFACES.yellow
  const defaultColors = entry.light
  return {
    bg: defaultColors.bg,
    text: customText ? resolveColor(customText, 'light') : defaultColors.text,
    border: defaultColors.border,
  }
}

export function resolveWidth(width: 's' | 'm' | 'l' | number = 'm'): number {
  if (typeof width === 'number') return width
  switch (width) {
    case 's':
      return 1
    case 'm':
      return 2
    case 'l':
      return 4
    default:
      return 2
  }
}

export function resolveSize(
  size: 's' | 'm' | 'l' | 'xl' | number = 'm',
  customPx?: number,
): number {
  if (typeof customPx === 'number' && customPx > 0) return customPx
  if (typeof size === 'number' && size > 0) return size
  switch (size) {
    case 's':
      return 12
    case 'm':
      return 16
    case 'l':
      return 24
    case 'xl':
      return 32
    default:
      return 16
  }
}

export function resolveWeight(weight?: Style['weight']): string {
  if (typeof weight === 'number') return String(weight)
  switch (weight) {
    case 'medium':
      return '500'
    case 'semibold':
      return '600'
    case 'bold':
      return '700'
    case 'black':
      return '800'
    case 'regular':
    default:
      return '400'
  }
}

export function resolveDash(dash: 'solid' | 'dashed' | 'dotted' | 'none' = 'solid'): number[] {
  switch (dash) {
    case 'dashed':
      return [6, 6]
    case 'dotted':
      return [2, 4]
    default:
      return []
  }
}

export function resolveScheme(
  schemeName: 'light' | 'dark',
  tokens?: Partial<Tokens>,
): Scheme {
  const base = DEFAULT_SCHEME[schemeName]
  const overrides = schemeName === 'dark' ? tokens?.dark : tokens?.light
  return { ...base, ...overrides }
}
