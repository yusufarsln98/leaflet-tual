import type L from 'leaflet'
import type {
  ChangeInfo,
  Controller,
  Doc,
  ThemeTokens,
  ToolbarOptions,
  TranslationTokens,
} from '../../core/types.js'

export interface LeafletTualProps {
  controller?: Controller
  value?: Doc
  defaultValue?: Doc
  onChange?: (doc: Doc, info: ChangeInfo) => void
  onGesture?: (doc: Doc, info: ChangeInfo) => void
  readOnly?: boolean
  themeTokens?: Partial<ThemeTokens>
  toolbar?: boolean | ToolbarOptions
  translations?: Partial<TranslationTokens>
  map?: L.Map
}

export interface ToolbarProps extends ToolbarOptions {
  controller: Controller
  map?: L.Map
  themeTokens?: Partial<ThemeTokens>
}
