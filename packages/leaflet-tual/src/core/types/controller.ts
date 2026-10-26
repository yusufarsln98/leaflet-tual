import type { ArrowKind, Doc, Item, NewItem, ShapeKind, Style } from './items.js'
import type { Theme } from './theme.js'
import type { TranslationTokens } from '../shared/i18n/index.js'

export type { TranslationTokens, TranslationToken, Translator } from '../shared/i18n/index.js'
export type { Theme } from './theme.js'

/** Tools grouped under the toolbar's Draw dropdown. */
export type DrawKind = 'freedraw' | 'pen'

export type ToolId = 'select' | 'text' | 'note' | DrawKind | 'arrow' | 'shape' | 'ruler'

export type ChangeReason =
  'create' | 'update' | 'delete' | 'reorder' | 'page' | 'load' | 'undo' | 'redo'

export type ChangeInfo = {
  reason: ChangeReason
  ids: string[]
  committed: boolean
}

export interface ControllerPages {
  readonly list: { id: string; name: string }[]
  readonly active: string
  add(name?: string): string
  rename(id: string, name: string): void
  remove(id: string): void
  move(id: string, toIndex: number): void
  select(id: string): void
}

export interface Controller {
  readonly doc: Doc
  readonly items: Item[]
  readonly tool: ToolId
  readonly variant: string | null
  readonly style: Style
  readonly selection: string[]
  readonly selected: Item[]
  readonly scheme: 'light' | 'dark'
  readonly theme: Theme
  readonly readOnly: boolean
  readonly canUndo: boolean
  readonly canRedo: boolean
  readonly editingId: string | null
  readonly translations: TranslationTokens

  readonly pages: ControllerPages

  getTranslations(): TranslationTokens
  setTranslations(patch: Partial<TranslationTokens>): void
  setTheme(theme: Theme): void
  subscribe(handler: (doc: Doc) => void): () => void
  setTool(tool: ToolId, variant?: string | null): void
  setStyle(patch: Partial<Style>): void
  add(item: NewItem): Item
  update(id: string, patch: Partial<Item>, committed?: boolean): void
  remove(ids?: string | string[]): void
  clear(): void
  select(ids: string[] | string | null): void
  edit(id: string | null): void
  undo(): void
  redo(): void
  fit(target: 'all' | 'selection' | string): void
  load(doc: Doc): void
  setReadOnly(v: boolean): void
  on(
    event: 'change' | 'select' | 'tool' | 'page' | 'state' | 'translations' | 'theme',
    handler: (...args: unknown[]) => void,
  ): () => void
}

export interface InternalController extends Controller {
  _updateControlledDoc?: (nextDoc: Doc) => void
  _setScheme?: (s: 'light' | 'dark') => void
  _setTheme?: (t: Theme) => void
  _setMap?: (m: L.Map | null) => void
}

export interface ToolbarAction {
  id: string
  label: string
  title?: string
  icon?: unknown
  onClick?: () => void
  run?: (controller: Controller) => void
  active?: boolean
  disabled?: boolean
}

export interface ToolbarOptions {
  position?:
    'top-left' | 'top' | 'top-right' | 'left' | 'right' | 'bottom-left' | 'bottom' | 'bottom-right'
  orientation?: 'horizontal' | 'vertical'
  tools?: ToolId[]
  variants?: {
    arrow?: ArrowKind[]
    shape?: ShapeKind[]
    draw?: DrawKind[]
  }
  pages?: boolean
  history?: boolean
  zoom?: boolean
  actions?: ToolbarAction[]
}

export interface CreateLeafletTualOptions {
  defaultValue?: Doc
  value?: Doc
  onChange?: (doc: Doc, info: ChangeInfo) => void
  onSelect?: (items: Item[]) => void
  onToolChange?: (tool: ToolId, variant: string | null) => void
  maxHistory?: number
  readOnly?: boolean
  tool?: ToolId
  variant?: string | null
  style?: Partial<Style>
  theme?: Theme
  toolbar?: false | ToolbarOptions
  translations?: Partial<TranslationTokens>
  collapseBelowZoom?: { notes?: number; text?: number }
  zIndex?: number
}
