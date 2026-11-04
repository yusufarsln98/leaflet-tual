export type { GeoPoint } from '../../shared/types/geo.js'
import type { ArrowItem } from './arrow/types.js'
import type { ShapeItem } from './shape/types.js'
import type { FreedrawItem } from './freedraw/types.js'
import type { PenItem, PenPoint } from './pen/types.js'
import type { RulerItem } from './ruler/types.js'
import type { AreaItem } from './area/types.js'
import type { NoteItem } from './note/types.js'
import type { TextItem } from './text/types.js'

export type {
  ArrowItem,
  ShapeItem,
  FreedrawItem,
  PenItem,
  PenPoint,
  RulerItem,
  AreaItem,
  NoteItem,
  TextItem,
}

export type ColorName =
  | 'ink'
  | 'gray'
  | 'taupe'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'pink'

export type FontSizeName = 's' | 'm' | 'l' | 'xl' | 'huge'

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

export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never

export type Item =
  | ArrowItem
  | ShapeItem
  | FreedrawItem
  | PenItem
  | RulerItem
  | AreaItem
  | NoteItem
  | TextItem

export type NewItem = DistributiveOmit<Item, 'id' | 'createdAt'> & {
  id?: string
}
