import type { ArrowKind, ShapeKind } from '../entities/index.js'
import {
  ALL_ARROW_KINDS,
  ALL_SHAPE_KINDS,
  isArrowKind,
  isShapeKind,
} from '../entities/index.js'

export type { ArrowKind, ShapeKind }
export { ALL_ARROW_KINDS, ALL_SHAPE_KINDS, isArrowKind, isShapeKind }

/** Tools grouped under the toolbar's Draw dropdown. */
export const ALL_DRAW_KINDS = ['freedraw', 'pen'] as const
export type DrawKind = (typeof ALL_DRAW_KINDS)[number]

export function isDrawKind(value: unknown): value is DrawKind {
  return typeof value === 'string' && (ALL_DRAW_KINDS as readonly string[]).includes(value)
}

/** Tools grouped under the toolbar's Measure dropdown. */
export const ALL_MEASURE_KINDS = ['ruler', 'area'] as const
export type MeasureKind = (typeof ALL_MEASURE_KINDS)[number]

export function isMeasureKind(value: unknown): value is MeasureKind {
  return typeof value === 'string' && (ALL_MEASURE_KINDS as readonly string[]).includes(value)
}

export const ALL_TOOLS = [
  'select',
  'text',
  'note',
  'freedraw',
  'pen',
  'arrow',
  'shape',
  'ruler',
  'area',
  'laser',
] as const

export type ToolId = (typeof ALL_TOOLS)[number]

export function isToolId(value: unknown): value is ToolId {
  return typeof value === 'string' && (ALL_TOOLS as readonly string[]).includes(value)
}

/** Active variant for tools that support sub-styles: ArrowKind ('linear' | 'curved' | 'elbow') or ShapeKind ('square' | 'circle' | 'star' | ...). */
export type ToolVariant = ArrowKind | ShapeKind

export function isToolVariant(value: unknown): value is ToolVariant {
  return isArrowKind(value) || isShapeKind(value)
}

/** Resolves the valid variant type for a given ToolId. */
export type ToolVariantFor<T extends ToolId> =
  T extends 'arrow'
    ? ArrowKind
    : T extends 'shape'
      ? ShapeKind
      : never

