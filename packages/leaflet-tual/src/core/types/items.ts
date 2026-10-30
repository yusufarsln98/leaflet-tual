import type { GeoPoint } from './geo.js'

export type ColorName =
  'ink' | 'gray' | 'taupe' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink'

export type FontSizeName = 's' | 'm' | 'l' | 'xl'

export type FontWeight =
  | 'regular'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'black'
  | number

export interface Style {
  color?: ColorName | string
  fillColor?: ColorName | string
  textColor?: ColorName | string
  strokeColor?: ColorName | string
  opacity?: number
  fillOpacity?: number
  width?: 's' | 'm' | 'l' | number
  dash?: 'solid' | 'dashed' | 'dotted' | 'none'
  fill?: 'none' | 'tint' | 'solid'
  size?: FontSizeName | number
  fontSize?: number
  weight?: FontWeight
  fontStyle?: 'normal' | 'italic'
  textDecoration?: 'none' | 'underline'
  underline?: boolean
  align?: 'left' | 'center' | 'right'
  radius?: number
  list?: 'none' | 'bullet'
  bullets?: boolean
}

export interface Base {
  id: string
  style?: Style
  locked?: boolean
  meta?: Record<string, unknown>
  baseZoom?: number
  readonly createdAt: number
}

export type ArrowKind = 'linear' | 'curved' | 'elbow' | 's-curve'
export type Head = 'triangle' | 'open' | 'none'

export type ShapeKind =
  'square' | 'circle' | 'star' | 'actor' | 'triangle' | 'diamond' | 'hexagon' | 'marker'

export interface ArrowItem extends Base {
  type: 'arrow'
  kind: ArrowKind
  from: GeoPoint
  to: GeoPoint
  via?: GeoPoint
  heads?: { start?: Head; end?: Head }
  label?: string
}

export interface ShapeItem extends Base {
  type: 'shape'
  kind: ShapeKind
  at: GeoPoint
  width: number
  height: number
  label?: string
  labelPosition?: LabelPosition
}

/** Where the label pill sits relative to the shape's bounding box. */
export type LabelPosition = 'top' | 'center' | 'bottom'

/**
 * A freehand stroke recorded from pointer samples.
 *
 * Kept as its own item type so it stays independent from the bezier
 * {@link PenItem}.
 */
export interface FreedrawItem extends Base {
  type: 'freedraw'
  points: GeoPoint[]
}

/**
 * One anchor of a bezier pen path.
 *
 * `at` is the anchor itself. `in` and `out` are absolute geographic control
 * points for the incoming and outgoing cubic segments. When they are omitted
 * the segment is a straight line.
 */
export interface PenPoint {
  at: GeoPoint
  in?: GeoPoint
  out?: GeoPoint
}

/** A bezier path created with the pen tool (click to add anchors, drag for curves). */
export interface PenItem extends Base {
  type: 'pen'
  points: PenPoint[]
  closed?: boolean
}

export interface RulerItem extends Base {
  type: 'ruler'
  from: GeoPoint
  to: GeoPoint
  unit?: 'metric' | 'imperial'
  label?: string
}

export interface NoteItem extends Base {
  type: 'note'
  at: GeoPoint
  width?: number
  height?: number
  text: string
  title?: string
}

export interface TextItem extends Base {
  type: 'text'
  at: GeoPoint
  text: string
}

export type Item =
  | ArrowItem
  | ShapeItem
  | FreedrawItem
  | PenItem
  | RulerItem
  | NoteItem
  | TextItem

export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never

export type NewItem = DistributiveOmit<Item, 'id' | 'createdAt'> & {
  id?: string
}

export interface Page {
  id: string
  name: string
  view?: { center: GeoPoint; zoom: number }
  items: Item[]
}

export interface Doc {
  version: 2
  page: string
  pages: Page[]
}
