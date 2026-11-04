import type { ArrowItem, ArrowKind, Head } from './types.js'
import type { GeoPoint } from '../../../shared/types/geo.js'

export const ARROW_KINDS = new Set<string>(['linear', 'curved', 'elbow', 's-curve'])

export function isArrowItem(item: unknown): item is ArrowItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    (item as ArrowItem).type === 'arrow'
  )
}

export function createDefaultArrowItem(
  id: string,
  from: GeoPoint,
  to: GeoPoint,
  kind: ArrowKind = 'linear',
  heads: { start?: Head; end?: Head } = { start: 'none', end: 'triangle' },
): ArrowItem {
  return {
    id,
    type: 'arrow',
    kind,
    from,
    to,
    heads,
    createdAt: Date.now(),
  }
}
