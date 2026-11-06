import type L from 'leaflet'
import type { StoreApi } from 'zustand/vanilla'
import type { Doc, Item, NewItem, Style } from '../entities/index.js'
import type { TranslationTokens } from '../shared/i18n/index.js'
import type { ThemeTokens } from '../shared/theme/index.js'
import type {
  ArrowKind,
  DrawKind,
  MeasureKind,
  ShapeKind,
  ToolId,
  ToolVariant,
  ToolVariantFor,
} from './tool-kinds.js'

export type {
  ArrowKind,
  Doc,
  DrawKind,
  Item,
  MeasureKind,
  NewItem,
  ShapeKind,
  Style,
  ToolId,
  ToolVariant,
  ToolVariantFor,
}
export type { TranslationTokens, TranslationToken, Translator } from '../shared/i18n/index.js'
export type { ThemeTokens } from '../shared/theme/index.js'
export type {
  KeyboardShortcutsOptions,
  ResolvedKeyboardShortcuts,
  ShortcutAction,
  ShortcutBinding,
  ShortcutCommandAction,
} from '../shared/drawing/interactions/shortcut-config.js'

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
  patches?: Record<string, Partial<Item>>
}

export interface ControllerState {
  doc: Doc
  items: Item[]
  itemMap: Record<string, Item>
  tool: ToolId
  variant: ToolVariant | null
  style: Style
  selection: string[]
  selected: Item[]
  readOnly: boolean
  canUndo: boolean
  canRedo: boolean
  editingId: string | null
  activePageId: string
  translations: TranslationTokens
}

export type ControllerStore = StoreApi<ControllerState>

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
  readonly itemMap: Record<string, Item>
  readonly store: ControllerStore
  readonly tool: ToolId
  readonly variant: ToolVariant | null
  readonly style: Style
  readonly selection: string[]
  readonly selected: Item[]
  readonly readOnly: boolean
  readonly canUndo: boolean
  readonly canRedo: boolean
  readonly editingId: string | null
  readonly translations: TranslationTokens

  readonly pages: ControllerPages

  getItem(id: string): Item | undefined
  getTranslations(): TranslationTokens
  setTranslations(patch: Partial<TranslationTokens>): void
  subscribe(handler: (doc: Doc) => void): () => void
  setTool<T extends ToolId = ToolId>(tool: T, variant?: ToolVariantFor<T> | null): void
  setStyle(patch: Partial<Style>): void
  add(item: NewItem): Item
  update(id: string, patch: Partial<Item>, committed?: boolean): void
  updateMany(patches: Array<{ id: string; patch: Partial<Item> }>, committed?: boolean): void
  duplicate(ids?: string | string[]): Item[]
  reorder(ids: string | string[], action: ReorderAction): void
  bringToFront(ids?: string | string[]): void
  sendToBack(ids?: string | string[]): void
  bringForward(ids?: string | string[]): void
  sendBackward(ids?: string | string[]): void
  remove(ids?: string | string[]): void
  clear(): void
  select(ids: string[] | string | null): void
  selectAll(): void
  edit(id: string | null): void
  undo(): void
  redo(): void
  fit(target: 'all' | 'selection' | string): void
  load(doc: Doc): void
  setReadOnly(v: boolean): void
  on(
    event: 'change' | 'gesture' | 'select' | 'tool' | 'page' | 'state' | 'translations',
    handler: (...args: unknown[]) => void,
  ): () => void
}

export interface InternalController extends Controller {
  _updateControlledDoc?: (nextDoc: Doc) => void
  _setMap?: (m: L.Map | null) => void
}

export type ToolbarOrientation = 'horizontal' | 'vertical'

/**
 * Toolbar anchor. The first segment is the map edge: `top`/`bottom` lay the
 * toolbar out horizontally, while `left`/`right` lay it out vertically.
 * The optional second segment aligns it along that edge (`left`, `center`,
 * `right`, or the equivalent `top`/`bottom` for vertical edges).
 */
export type ToolbarPosition =
  | 'inline'
  | 'top-left'
  | 'top'
  | 'top-center'
  | 'top-right'
  | 'right-top'
  | 'right'
  | 'right-center'
  | 'right-bottom'
  | 'bottom-left'
  | 'bottom'
  | 'bottom-center'
  | 'bottom-right'
  | 'left-top'
  | 'left'
  | 'left-center'
  | 'left-bottom'
  | 'center'

export interface ToolbarOptions {
  position?: ToolbarPosition
  /**
   * @deprecated Orientation is derived from `position`. This is only used by
   * `position: 'inline'` toolbars rendered outside the map.
   */
  orientation?: ToolbarOrientation
  tools?: ToolId[]
  pages?: boolean
  history?: boolean
}

export interface CreateLeafletTualOptions {
  defaultValue?: Doc
  value?: Doc
  onChange?: (doc: Doc, info: ChangeInfo) => void
  onGesture?: (doc: Doc, info: ChangeInfo) => void
  readOnly?: boolean
  themeTokens?: Partial<ThemeTokens>
  tool?: ToolId
  variant?: ToolVariant | null
  style?: Partial<Style>
  translations?: Partial<TranslationTokens>
}
