import type { TextItem } from './types.js'
import type { GeoPoint } from '../../../shared/types/geo.js'

export function isTextItem(item: unknown): item is TextItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    (item as TextItem).type === 'text'
  )
}

export function createDefaultTextItem(id: string, at: GeoPoint, text = ''): TextItem {
  return {
    id,
    type: 'text',
    at,
    text,
    createdAt: Date.now(),
  }
}
