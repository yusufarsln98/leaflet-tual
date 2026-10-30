import type { Doc, Item, NewItem, Style } from './items.js'
import type { TranslationTokens } from '../shared/i18n/index.js'

export type { TranslationTokens, TranslationToken, Translator } from '../shared/i18n/index.js'

export type Theme = 'light' | 'dark' | 'system'

/** Tools grouped under the toolbar's Draw dropdown. */
export type DrawKind = 'freedraw' | 'pen'

export type ToolId = 'select' | 'text' | 'note' | DrawKind | 'arrow' | 'shape' | 'ruler'

export type ChangeReason =
  | 'create'
  | 'update'
  | 'delete'
  | 'reorder'
  | 'page'
  | 'load'
  | 'undo'
  | 'redo'

export type ReorderAction = 'front' | 'back' | 'forward' | 'backward'

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
  updateMany(patches: Array<{ id: string; patch: Partial<Item> }>, committed?: boolean): void
  duplicate(ids?: string | string[]): Item[]
  reorder(ids: string | string[], action: ReorderAction): void
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
  _setMap?: (m: L.Map | null) => void
}

export type ToolbarPosition =
  | 'top-left'
  | 'top'
  | 'top-right'
  | 'left'
  | 'right'
  | 'bottom-left'
  | 'bottom'
  | 'bottom-right'

export interface ToolbarOptions {
  position?: ToolbarPosition
  orientation?: 'horizontal' | 'vertical'
  tools?: ToolId[]
  pages?: boolean
}

export interface CreateLeafletTualOptions {
  defaultValue?: Doc
  value?: Doc
  onChange?: (doc: Doc, info: ChangeInfo) => void
  readOnly?: boolean
  theme?: Theme
  tool?: ToolId
  variant?: string | null
  style?: Partial<Style>
  translations?: Partial<TranslationTokens>
}
