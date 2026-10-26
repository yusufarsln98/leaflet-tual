import type { CSSProperties } from 'react'
import type L from 'leaflet'
import type {
  ChangeInfo,
  Controller,
  Doc,
  Item,
  Labels,
  Part,
  Theme,
  Tokens,
  ToolId,
  ToolbarOptions,
} from '../../core/types/index.js'

export interface LeafletTualProps {
  controller?: Controller
  value?: Doc
  defaultValue?: Doc
  onChange?: (doc: Doc, info: ChangeInfo) => void
  onSelect?: (items: Item[]) => void
  onToolChange?: (tool: ToolId, variant: string | null) => void
  theme?: Theme
  tokens?: Partial<Tokens>
  toolbar?: false | ToolbarOptions
  readOnly?: boolean
  labels?: Partial<Labels>
  collapseBelowZoom?: { notes?: number; text?: number }
  map?: L.Map
  zIndex?: number
  className?: string
  style?: CSSProperties
  classNames?: Partial<Record<Part, string>>
}

export interface ToolbarProps extends ToolbarOptions {
  controller: Controller
  map?: L.Map
  currentZoom?: number
  className?: string
  style?: CSSProperties
  classNames?: Partial<Record<Part, string>>
}
