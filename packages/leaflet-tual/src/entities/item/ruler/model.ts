import type { RulerItem } from './types.js'
import type { GeoPoint } from '../../../shared/types/geo.js'

export function isRulerItem(item: unknown): item is RulerItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    (item as RulerItem).type === 'ruler'
  )
}

export function createDefaultRulerItem(
  id: string,
  from: GeoPoint,
  to: GeoPoint,
  unit: 'metric' | 'imperial' = 'metric',
): RulerItem {
  return {
    id,
    type: 'ruler',
    from,
    to,
    unit,
    createdAt: Date.now(),
  }
}
