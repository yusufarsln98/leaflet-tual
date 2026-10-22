export type GeoPoint = {
  lat: number
  lng: number
}

export type ScreenPoint = {
  x: number
  y: number
}

export type ArrowStyle = 'linear' | 'curved' | 'bi' | 'elbow' | 's-curve'

export type ShapeKind =
  | 'square'
  | 'circle'
  | 'star'
  | 'actor'
  | 'triangle'
  | 'diamond'
  | 'hexagon'
  | 'marker'

export type TualTool =
  | 'select'
  | 'freedraw'
  | 'arrow-linear'
  | 'arrow-curved'
  | 'arrow-bi'
  | 'arrow-elbow'
  | 'arrow-s-curve'
  | 'shape'
  | 'ruler'
  | 'note'
  | 'text'

export type ToolbarToolGroupId =
  | 'select'
  | 'freedraw'
  | 'arrow'
  | 'shape'
  | 'ruler'
  | 'note'
  | 'text'

export type ArrowHeadStyle = 'triangle' | 'open' | 'both' | 'none'

export interface ArrowItem {
  id: string
  type: 'arrow'
  arrowStyle: ArrowStyle
  start: GeoPoint
  end: GeoPoint
  controlPoint?: GeoPoint
  color: string
  strokeWidth: number
  dashed?: boolean
  headStyle?: ArrowHeadStyle
  label?: string
  labelMode?: boolean
  hasLabelMode?: boolean
  createdAt: number
}

export interface FreeDrawItem {
  id: string
  type: 'freedraw'
  points: GeoPoint[]
  color: string
  strokeWidth: number
  dashed?: boolean
  createdAt: number
}

export interface ShapeItem {
  id: string
  type: 'shape'
  shape: ShapeKind
  start: GeoPoint
  end: GeoPoint
  color: string
  fillColor?: string
  filled?: boolean
  strokeWidth: number
  dashed?: boolean
  label?: string
  labelMode?: boolean
  hasLabelMode?: boolean
  createdAt: number
}

export type NoteCollapseState = 'expanded' | 'collapsed' | 'compact'

export interface NoteItem {
  id: string
  type: 'note'
  position: GeoPoint
  title?: string
  text: string
  backgroundColor: string
  textColor: string
  width?: number
  height?: number
  minimized?: boolean | 'compact'
  collapseState?: NoteCollapseState
  createdAt: number
}

export interface TextItem {
  id: string
  type: 'text'
  position: GeoPoint
  text: string
  color: string
  initialFontSize?: number
  baseZoom?: number
  fontWeight?: 'normal' | 'bold'
  backgroundColor?: string
  createdAt: number
}

export interface RulerItem {
  id: string
  type: 'ruler'
  start: GeoPoint
  end: GeoPoint
  color: string
  strokeWidth: number
  dashed?: boolean
  label?: string
  unit?: 'metric' | 'imperial'
  createdAt: number
}

export type TualItem =
  | ArrowItem
  | FreeDrawItem
  | ShapeItem
  | NoteItem
  | TextItem
  | RulerItem

