import type { AreaItem } from './types.js'
import type { GeoPoint } from '../../../shared/types/geo.js'

export function isAreaItem(item: unknown): item is AreaItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    (item as AreaItem).type === 'area'
  )
}

export function createDefaultAreaItem(
  id: string,
  points: GeoPoint[] = [],
  unit: 'metric' | 'imperial' = 'metric',
): AreaItem {
  return {
    id,
    type: 'area',
    points,
    unit,
    createdAt: Date.now(),
  }
}
