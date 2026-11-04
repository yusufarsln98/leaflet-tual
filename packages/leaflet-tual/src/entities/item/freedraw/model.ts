import type { FreedrawItem } from './types.js'
import type { GeoPoint } from '../../../shared/types/geo.js'

export function isFreedrawItem(item: unknown): item is FreedrawItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    (item as FreedrawItem).type === 'freedraw'
  )
}

export function createDefaultFreedrawItem(
  id: string,
  points: GeoPoint[] = [],
): FreedrawItem {
  return {
    id,
    type: 'freedraw',
    points,
    createdAt: Date.now(),
  }
}
