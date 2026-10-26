import type {
  ArrowKind,
  Doc,
  Item,
  NewItem,
  ShapeKind,
  Style,
} from './items.js'
import type { Theme, Tokens } from './theme.js'

/** Tools grouped under the toolbar's Draw dropdown. */
export type DrawKind = 'freedraw' | 'pen'

export type ToolId =
  | 'select'
  | 'text'
  | 'note'
  | DrawKind
  | 'arrow'
  | 'shape'
  | 'ruler'

export type ChangeReason =
  | 'create'
  | 'update'
  | 'delete'
  | 'reorder'
  | 'page'
  | 'load'
  | 'undo'
  | 'redo'

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
  duplicate(id: string): string
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
  readonly readOnly: boolean
  readonly canUndo: boolean
  readonly canRedo: boolean
  readonly editingId: string | null

  readonly pages: ControllerPages

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
    event: 'change' | 'select' | 'tool' | 'page' | 'state',
    handler: (...args: unknown[]) => void,
  ): () => void
}

export interface InternalController extends Controller {
  _updateControlledDoc?: (nextDoc: Doc) => void
  _setScheme?: (s: 'light' | 'dark') => void
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
    | 'top-left'
    | 'top'
    | 'top-right'
    | 'left'
    | 'right'
    | 'bottom-left'
    | 'bottom'
    | 'bottom-right'
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
  collapsible?: boolean
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  actions?: ToolbarAction[]
}

export interface Labels {
  select: string
  text: string
  note: string
  draw: string
  freedraw: string
  pen: string
  arrow: string
  shape: string
  ruler: string
  undo: string
  redo: string
  page: string
  addPage: string
  deletePage: string
  renamePage: string
  duplicatePage: string
  color: string
  strokeWidth: string
  dash: string
  fill: string
  size: string
  weight: string
  align: string
  collapse: string
  expand: string
  fit: string
  placeholderNote: string
  placeholderText: string
  placeholderTitle: string
  [key: string]: string
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
  tokens?: Partial<Tokens>
  toolbar?: false | ToolbarOptions
  labels?: Partial<Labels>
  collapseBelowZoom?: { notes?: number; text?: number }
  zIndex?: number
}
