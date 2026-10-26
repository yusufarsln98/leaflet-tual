import type { ColorName, Style } from '../types/items.js'
import type { Scheme, Tokens } from '../types/theme.js'

export const DEFAULT_PALETTE: Record<ColorName, { light: string; dark: string }> = {
  ink: { light: '#1D1D1B', dark: '#F2F0EC' },
  gray: { light: '#8A857E', dark: '#A8A39B' },
  taupe: { light: '#B5ADA3', dark: '#8F877D' },
  red: { light: '#E5484D', dark: '#FF6369' },
  orange: { light: '#F76B15', dark: '#FF8B3E' },
  yellow: { light: '#F5C518', dark: '#FFD43B' },
  green: { light: '#30A46C', dark: '#3DD68C' },
  blue: { light: '#2F6FEB', dark: '#6AA5FF' },
  purple: { light: '#8E4EC6', dark: '#BF7AF0' },
  pink: { light: '#D6409F', dark: '#F76BC6' },
}

export const DEFAULT_SCHEME: { light: Scheme; dark: Scheme } = {
  light: {
    surface: '#FFFFFF',
    surfaceHover: '#F4F4F5',
    border: '#E4E4E7',
    text: '#18181B',
    muted: '#71717A',
    activeBg: '#DBEAFE',
    activeFg: '#2563EB',
    shadow: '0 4px 16px -2px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
    artboardFill: '#FFFFFF',
    artboardBorder: '#E4E4E7',
    handle: '#2563EB',
  },
  dark: {
    surface: '#18181B',
    surfaceHover: '#27272A',
    border: '#2E2E33',
    text: '#F4F4F5',
    muted: '#A1A1AA',
    activeBg: '#1E3A8A',
    activeFg: '#60A5FA',
    shadow: '0 4px 20px -2px rgba(0, 0, 0, 0.4), 0 2px 6px -1px rgba(0, 0, 0, 0.3)',
    artboardFill: '#27272A',
    artboardBorder: '#3F3F46',
    handle: '#60A5FA',
  },
}

export const NOTE_SURFACES: Record<
  ColorName,
  { light: { bg: string; text: string }; dark: { bg: string; text: string } }
> = {
  yellow: {
    light: { bg: '#FFF1A1', text: '#4A4020' },
    dark: { bg: '#3D3516', text: '#FFD43B' },
  },
  blue: {
    light: { bg: '#DBEAFE', text: '#1E3A8A' },
    dark: { bg: '#1E293B', text: '#93C5FD' },
  },
  green: {
    light: { bg: '#D1FAE5', text: '#064E3B' },
    dark: { bg: '#132E22', text: '#6EE7B7' },
  },
  red: {
    light: { bg: '#FEE2E2', text: '#7F1D1D' },
    dark: { bg: '#3B181A', text: '#FCA5A5' },
  },
  orange: {
    light: { bg: '#FFEDD5', text: '#7C2D12' },
    dark: { bg: '#3B2313', text: '#FDBA74' },
  },
  purple: {
    light: { bg: '#F3E8FF', text: '#581C87' },
    dark: { bg: '#2D1B3E', text: '#D8B4FE' },
  },
  pink: {
    light: { bg: '#FCE7F3', text: '#831843' },
    dark: { bg: '#381628', text: '#F9A8D4' },
  },
  taupe: {
    light: { bg: '#EFECE6', text: '#3E3A35' },
    dark: { bg: '#2B2824', text: '#D4CEBF' },
  },
  gray: {
    light: { bg: '#F1F0EE', text: '#383531' },
    dark: { bg: '#262523', text: '#D6D3CD' },
  },
  ink: {
    light: { bg: '#E5E4E2', text: '#1D1D1B' },
    dark: { bg: '#242322', text: '#F2F0EC' },
  },
}

export const DEFAULT_TOOL_STYLES: Record<string, Style> = {
  freedraw: { color: 'ink', width: 'm', dash: 'solid' },
  pen: { color: 'ink', width: 'm', dash: 'solid' },
  arrow: { color: 'ink', width: 'm', dash: 'solid' },
  ruler: { color: 'ink', width: 'm', dash: 'solid' },
  shape: { color: 'ink', fill: 'solid', width: 'm', dash: 'solid' },
  note: { color: 'ink', fillColor: 'yellow', size: 'm' },
  text: { color: 'ink', size: 'm' },
}

export function resolveColor(
  name: ColorName = 'ink',
  scheme: 'light' | 'dark' = 'light',
  tokens?: Partial<Tokens>,
): string {
  const custom = tokens?.palette?.[name]
  if (custom) {
    return scheme === 'dark' ? custom.dark : custom.light
  }
  const entry = DEFAULT_PALETTE[name] ?? DEFAULT_PALETTE.ink
  return scheme === 'dark' ? entry.dark : entry.light
}

export function resolveNoteColors(
  color: ColorName = 'yellow',
  scheme: 'light' | 'dark' = 'light',
  customText?: ColorName,
  customBg?: ColorName,
): { bg: string; text: string } {
  const bgKey = customBg ?? color
  const entry = NOTE_SURFACES[bgKey] ?? NOTE_SURFACES.yellow
  const defaultColors = scheme === 'dark' ? entry.dark : entry.light
  return {
    bg: defaultColors.bg,
    text: customText ? resolveColor(customText, scheme) : defaultColors.text,
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

