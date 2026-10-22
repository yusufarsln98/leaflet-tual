import type {
  ArrowStyle,
  TualItem,
  TualTool,
  GeoPoint,
  ShapeKind,
} from './items.js'

export interface DraftArrowState {
  arrowStyle: ArrowStyle
  startGeo: GeoPoint
  currentGeo: GeoPoint
}

export interface DraftShapeState {
  shape: ShapeKind
  startGeo: GeoPoint
  currentGeo: GeoPoint
}

export interface DraftRulerState {
  startGeo: GeoPoint
  currentGeo: GeoPoint
}

export interface TualOverlayOptions {
  interactive?: boolean
  readOnly?: boolean
  zIndex?: number
  defaultColor?: string
  defaultStrokeWidth?: number
  defaultNoteColor?: string
  defaultFontSize?: number
  defaultShape?: ShapeKind
}

export interface UseLeafletTualOptions extends TualOverlayOptions {
  initialItems?: TualItem[]
  items?: TualItem[]
  maxHistory?: number
  onItemsChange?: (items: TualItem[]) => void
  onChange?: (items: TualItem[]) => void
  onChangeComplete?: (items: TualItem[], targetItem?: TualItem | null) => void
  onItemsChangeComplete?: (items: TualItem[], targetItem?: TualItem | null) => void
  onEditEnd?: (items: TualItem[], targetItem?: TualItem | null) => void
  onEditComplete?: (items: TualItem[], targetItem?: TualItem | null) => void
  onItemSelect?: (item: TualItem | null) => void
  onItemCreate?: (item: TualItem) => void
  onItemChange?: (item: TualItem) => void
  onItemDelete?: (id: string) => void
  onItemChangeComplete?: (item: TualItem) => void
  initialTool?: TualTool
  onToolChange?: (tool: TualTool) => void
}

export type LeafletTualOptions = UseLeafletTualOptions

export interface LeafletTualController {
  items: TualItem[]
  activeTool: TualTool
  setActiveTool: (tool: TualTool) => void
  readOnly: boolean
  setReadOnly: (readOnly: boolean) => void
  activeShape: ShapeKind
  setActiveShape: (shape: ShapeKind) => void
  shapeFilled: boolean
  setShapeFilled: (filled: boolean) => void
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  selectedItem: TualItem | null
  isEditingLabel?: boolean
  setEditingLabel?: (editing: boolean) => void
  labelEditMode?: boolean
  setLabelEditMode?: (editing: boolean) => void
  activeColor: string
  setActiveColor: (color: string) => void
  strokeWidth: number
  setStrokeWidth: (width: number) => void
  dashed: boolean
  setDashed: (dashed: boolean) => void
  noteColor: string
  setNoteColor: (color: string) => void
  fontSize: number
  setFontSize: (size: number) => void
  fontWeight: 'normal' | 'bold'
  setFontWeight: (weight: 'normal' | 'bold') => void
  addItem: (item: TualItem) => void
  updateItem: (id: string, patch: Partial<TualItem>) => void
  removeItem: (id: string) => void
  deleteSelected: () => void
  clearAll: () => void
  clear: () => void
  deleteItem: (id: string) => void
  setTool: (tool: TualTool) => void
  selectItem: (id: string | null) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  notifyChangeComplete: (targetItem?: TualItem | null) => void
  exportJSON: () => string
  importJSON: (json: string) => boolean
}


