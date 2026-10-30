import type { FontWeight, Style } from '../types/index.js'

export const THEME_PRESETS: {
  id: NonNullable<Style['size']>
  label: string
  px: number
}[] = [
  { id: 's', label: 'Small', px: 14 },
  { id: 'm', label: 'Medium', px: 24 },
  { id: 'l', label: 'Large', px: 40 },
  { id: 'xl', label: 'Extra large', px: 72 },
  { id: 'huge', label: 'Huge', px: 120 },
]

export const WEIGHT_OPTIONS: { id: FontWeight; label: string; num: number }[] = [
  { id: 'regular', label: 'Regular', num: 400 },
  { id: 'medium', label: 'Medium', num: 500 },
  { id: 'semibold', label: 'Semibold', num: 600 },
  { id: 'bold', label: 'Bold', num: 700 },
  { id: 'black', label: 'Black', num: 800 },
]

export function isItemBold(style: Style): boolean {
  return (
    style.weight === 'bold' ||
    style.weight === 700 ||
    style.weight === 'semibold' ||
    style.weight === 'black' ||
    style.weight === 600 ||
    style.weight === 800
  )
}

export function isItemItalic(style: Style): boolean {
  return style.fontStyle === 'italic'
}

export function isItemUnderline(style: Style): boolean {
  return Boolean(style.underline || style.textDecoration === 'underline')
}

export function isTextBulleted(text: string, style: Style): boolean {
  if (style.list === 'bullet' || style.bullets === true) return true
  const lines = text.split('\n')
  const hasContent = lines.some((l) => l.trim().length > 0)
  return (
    hasContent &&
    lines
      .filter((l) => l.trim().length > 0)
      .every((l) => /^\s*([•\-*])\s+/.test(l) || /^\s*•/.test(l))
  )
}

export function toggleBulletList(text: string, isCurrentlyBulleted: boolean): string {
  const lines = text.split('\n')
  if (!isCurrentlyBulleted) {
    if (!text) return '• '
    return lines
      .map((l) => {
        if (!l.trim()) return l
        if (/^\s*([•\-*])\s+/.test(l) || /^\s*•/.test(l)) return l
        return `• ${l}`
      })
      .join('\n')
  }
  return lines
    .map((l) => l.replace(/^(\s*)([•\-*]\s*)/, '$1'))
    .join('\n')
}

export function resolveTypographyLabel(
  style: Style,
  t?: (token: string, params?: Record<string, string | number>, fallback?: string) => string,
): string {
  if (style.fontSize) return `${style.fontSize}px`
  if (style.size === 'huge') return t ? t('huge', undefined, 'Huge') : 'Huge'
  if (style.size === 'xl') return t ? t('extraLarge', undefined, 'Extra large') : 'Extra large'
  if (style.size === 'l') return t ? t('large', undefined, 'Large') : 'Large'
  if (style.size === 's') return t ? t('small', undefined, 'Small') : 'Small'
  return t ? t('medium', undefined, 'Medium') : 'Medium'
}

export function formatBulletInput(val: string, forceBullets = false): string {
  const formatted = val.replace(/(^|\n)([-*])\s/g, '$1• ')
  if (forceBullets && formatted && !formatted.startsWith('• ')) {
    return `• ${formatted}`
  }
  return formatted
}

export function getStyleShortcutPatch(
  key: string,
  style: Style = {},
): Partial<Style> | null {
  const lower = key.toLowerCase()
  if (lower === 'b') {
    return { weight: isItemBold(style) ? 'regular' : 'bold' }
  }
  if (lower === 'i') {
    return { fontStyle: isItemItalic(style) ? 'normal' : 'italic' }
  }
  if (lower === 'u') {
    const next = !isItemUnderline(style)
    return { underline: next, textDecoration: next ? 'underline' : 'none' }
  }
  return null
}


