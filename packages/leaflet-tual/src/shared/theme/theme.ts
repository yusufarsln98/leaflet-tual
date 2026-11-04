import type { ColorName, Style } from '../../entities/item/types.js'
import { DEFAULT_PALETTE, NOTE_SURFACES } from './theme-constants.js'

export { DEFAULT_PALETTE, DEFAULT_TOOL_STYLES, NOTE_SURFACES } from './theme-constants.js'

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

export function isHexColor(value?: string): boolean {
  return typeof value === 'string' && HEX_COLOR.test(value.trim())
}

export function resolveColor(value?: string): string {
  if (isTransparentColor(value)) return 'transparent'
  return isHexColor(value) ? value!.trim() : DEFAULT_PALETTE.ink
}

export function isTransparentColor(color?: string): boolean {
  return typeof color === 'string' && color.trim().toLowerCase() === 'transparent'
}

export function resolveNoteColors(
  color: string = DEFAULT_PALETTE.yellow,
  customText?: string,
  customBg?: string,
): { bg: string; text: string; border: string } {
  const bgKey = customBg ?? color
  if (isTransparentColor(bgKey)) {
    return {
      bg: 'transparent',
      text: customText ? resolveColor(customText) : '#1F2A30',
      border: '#00000033',
    }
  }

  const bg = resolveColor(bgKey)
  const paletteName = (Object.keys(DEFAULT_PALETTE) as ColorName[]).find(
    (name) => DEFAULT_PALETTE[name].toLowerCase() === bg.toLowerCase(),
  )
  const surface = paletteName ? NOTE_SURFACES[paletteName] : undefined
  if (surface) {
    return {
      bg: surface.bg,
      text: customText ? resolveColor(customText) : surface.text,
      border: surface.border,
    }
  }

  return {
    bg,
    text: customText ? resolveColor(customText) : '#1F2A30',
    border: '#00000033',
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

export type ResolvedTheme = 'light' | 'dark'
export type ThemeMode = 'light' | 'dark' | 'system'

/**
 * Detects whether the user's OS or browser prefers dark mode.
 */
export function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Resolves an input theme preference ('light' | 'dark' | 'system') to either 'light' or 'dark'.
 */
export function resolveTheme(theme: ThemeMode = 'system'): ResolvedTheme {
  if (theme === 'dark') return 'dark'
  if (theme === 'light') return 'light'
  return getSystemTheme()
}

/**
 * Subscribes to OS/browser prefers-color-scheme changes.
 */
export function subscribeSystemTheme(onChange: (scheme: ResolvedTheme) => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {}
  }
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const handler = (e: MediaQueryListEvent) => onChange(e.matches ? 'dark' : 'light')
  mq.addEventListener?.('change', handler)
  return () => mq.removeEventListener?.('change', handler)
}

