import type L from 'leaflet'
import type {
  ChangeInfo,
  Controller,
  Doc,
  Item,
  Theme,
  ToolId,
  ToolbarOptions,
  TranslationTokens,
} from '../../core/types/index.js'

export interface LeafletTualProps {
  controller?: Controller
  value?: Doc
  defaultValue?: Doc
  onChange?: (doc: Doc, info: ChangeInfo) => void
  onSelect?: (items: Item[]) => void
  onToolChange?: (tool: ToolId, variant: string | null) => void
  theme?: Theme
  toolbar?: false | ToolbarOptions
  readOnly?: boolean
  translations?: Partial<TranslationTokens>
  collapseBelowZoom?: { notes?: number; text?: number }
  map?: L.Map
  zIndex?: number
}

export interface ToolbarProps extends ToolbarOptions {
  controller: Controller
  map?: L.Map
  currentZoom?: number
}
