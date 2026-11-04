import type { Item } from '../../../../core/index.js'
import { ICONS } from '../../../ui/index.js'

export function getItemIcon(item: Item) {
  switch (item.type) {
    case 'shape':
      return (ICONS[item.kind] ?? ICONS.square)()
    case 'arrow':
      return (ICONS[item.kind] ?? ICONS['linear'])()
    case 'freedraw':
      return ICONS.pencil()
    case 'pen':
      return ICONS.pen()
    case 'text':
      return ICONS.text()
    case 'note':
      return ICONS.note()
    case 'ruler':
      return ICONS.ruler()
    case 'area':
      return ICONS.area()
  }
}

export function getItemTypeName(
  item: Item,
  t: (key: string, values?: Record<string, string | number>, fallback?: string) => string,
): string {
  if (item.type === 'shape') {
    return t(item.kind, undefined, item.kind)
  }
  return t(item.type, undefined, item.type)
}

