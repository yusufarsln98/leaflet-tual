import type { FontWeight, Style } from '../types/index.js'

export const THEME_PRESETS: {
  id: NonNullable<Style['size']>
  label: string
  px: number
}[] = [
  { id: 'xl', label: 'Heading 1', px: 28 },
  { id: 'l', label: 'Heading 2', px: 20 },
  { id: 'm', label: 'Body', px: 16 },
  { id: 's', label: 'Caption', px: 12 },
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
  if (style.size === 'xl') return t ? t('heading1', undefined, 'Heading 1') : 'Heading 1'
  if (style.size === 'l') return t ? t('heading2', undefined, 'Heading 2') : 'Heading 2'
  if (style.size === 's') return t ? t('caption', undefined, 'Caption') : 'Caption'
  return t ? t('body', undefined, 'Body') : 'Body'
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


