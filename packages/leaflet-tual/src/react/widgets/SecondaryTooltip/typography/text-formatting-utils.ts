import type { Style } from '../../../../core/index.js'

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
      .every((l) => /^\s*([•\-\*])\s+/.test(l) || /^\s*•/.test(l))
  )
}

export function toggleBulletList(text: string, isCurrentlyBulleted: boolean): string {
  const lines = text.split('\n')
  if (!isCurrentlyBulleted) {
    if (!text) return '• '
    return lines
      .map((l) => {
        if (!l.trim()) return l
        if (/^\s*([•\-\*])\s+/.test(l) || /^\s*•/.test(l)) return l
        return `• ${l}`
      })
      .join('\n')
  }
  return lines
    .map((l) => l.replace(/^(\s*)([•\-\*]\s*)/, '$1'))
    .join('\n')
}

export function resolveTypographyLabel(style: Style): string {
  if (style.fontSize) return `${style.fontSize}px`
  if (style.size === 'xl') return 'Heading 1'
  if (style.size === 'l') return 'Heading 2'
  if (style.size === 's') return 'Caption'
  return 'Body'
}
