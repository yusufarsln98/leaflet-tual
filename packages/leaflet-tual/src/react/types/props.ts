import type L from 'leaflet'
import type {
  ChangeInfo,
  Controller,
  Doc,
  KeyboardShortcutsOptions,
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
  /**
   * Keyboard shortcut configuration. Set to `false` to disable all shortcuts,
   * or override individual bindings with `{ pen: 'D', delete: false }`.
   */
  shortcuts?: boolean | KeyboardShortcutsOptions
  map?: L.Map
}

export interface ToolbarProps extends ToolbarOptions {
  controller: Controller
  map?: L.Map
  themeTokens?: Partial<ThemeTokens>
  sidebarOpen?: boolean
  onToggleSidebar?: () => void
  /** Shortcut config used for tool labels; pass the same value as `<LeafletTual>`. */
  shortcuts?: boolean | KeyboardShortcutsOptions
}
