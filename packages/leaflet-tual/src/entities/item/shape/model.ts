import type { ShapeItem, ShapeKind, LabelPosition } from './types.js'
import type { GeoPoint } from '../../../shared/types/geo.js'

export const SHAPE_KINDS = new Set<string>([
  'square',
  'circle',
  'star',
  'actor',
  'triangle',
  'diamond',
  'hexagon',
  'marker',
])

export const LABEL_POSITIONS = new Set<string>(['top', 'center', 'bottom'])

export const DEFAULT_SHAPE_KIND: ShapeKind = 'square'

export function isShapeItem(item: unknown): item is ShapeItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    (item as ShapeItem).type === 'shape'
  )
}

export function createDefaultShapeItem(
  id: string,
  at: GeoPoint,
  kind: ShapeKind = DEFAULT_SHAPE_KIND,
  width = 120,
  height = 120,
  labelPosition: LabelPosition = 'center',
): ShapeItem {
  return {
    id,
    type: 'shape',
    kind,
    at,
    width,
    height,
    labelPosition,
    createdAt: Date.now(),
  }
}
