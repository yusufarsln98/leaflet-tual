import type L from 'leaflet'
import type {
  ChangeInfo,
  Controller,
  Doc,
  Theme,
  ToolbarOptions,
  TranslationTokens,
} from '../../core/types/index.js'

export interface LeafletTualProps {
  controller?: Controller
  value?: Doc
  defaultValue?: Doc
  onChange?: (doc: Doc, info: ChangeInfo) => void
  readOnly?: boolean
  theme?: Theme
  toolbar?: boolean | ToolbarOptions
  translations?: Partial<TranslationTokens>
  map?: L.Map
}

export interface ToolbarProps extends ToolbarOptions {
  controller: Controller
  map?: L.Map
  currentZoom?: number
}
