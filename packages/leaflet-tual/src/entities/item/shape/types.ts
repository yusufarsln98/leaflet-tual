import type { Base } from '../types.js'
import type { GeoPoint } from '../../../shared/types/geo.js'

export const ALL_SHAPE_KINDS = [
  'square',
  'circle',
  'star',
  'actor',
  'triangle',
  'diamond',
  'hexagon',
  'marker',
] as const

export type ShapeKind = (typeof ALL_SHAPE_KINDS)[number]

export function isShapeKind(value: unknown): value is ShapeKind {
  return typeof value === 'string' && (ALL_SHAPE_KINDS as readonly string[]).includes(value)
}

export type LabelPosition = 'top' | 'center' | 'bottom'

export interface ShapeItem extends Base {
  type: 'shape'
  kind: ShapeKind
  at: GeoPoint
  width: number
  height: number
  label?: string
  labelPosition?: LabelPosition
}
