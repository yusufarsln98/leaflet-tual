import type { Base } from '../types.js'
import type { GeoPoint } from '../../../shared/types/geo.js'

export const ALL_ARROW_KINDS = ['linear', 'curved', 'elbow'] as const
export type ArrowKind = (typeof ALL_ARROW_KINDS)[number]

export function isArrowKind(value: unknown): value is ArrowKind {
  return typeof value === 'string' && (ALL_ARROW_KINDS as readonly string[]).includes(value)
}
export type Head = 'triangle' | 'open' | 'none'

export interface ArrowItem extends Base {
  type: 'arrow'
  kind: ArrowKind
  from: GeoPoint
  to: GeoPoint
  via?: GeoPoint
  heads?: { start?: Head; end?: Head }
  label?: string
}
