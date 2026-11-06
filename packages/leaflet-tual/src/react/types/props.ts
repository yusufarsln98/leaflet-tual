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
  /** Initial right-side properties & layers inspector visibility. */
  sidebar?: boolean
  /** Called whenever the inspector is opened or closed from the toolbar. */
  onSidebarChange?: (open: boolean) => void
  translations?: Partial<TranslationTokens>
  /** Set to false to disable the built-in keyboard shortcuts. Defaults to true. */
  shortcuts?: boolean
  map?: L.Map
}

export interface ToolbarProps extends ToolbarOptions {
  controller: Controller
  map?: L.Map
  themeTokens?: Partial<ThemeTokens>
  sidebarOpen?: boolean
  onToggleSidebar?: () => void
  /** Set to false to hide shortcut hints in tool labels. Defaults to true. */
  shortcuts?: boolean
}
