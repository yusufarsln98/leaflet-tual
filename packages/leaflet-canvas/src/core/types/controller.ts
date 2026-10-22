import type {
  ArrowStyle,
  CanvasItem,
  CanvasTool,
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

export interface CanvasOverlayOptions {
  interactive?: boolean
  readOnly?: boolean
  zIndex?: number
  defaultColor?: string
  defaultStrokeWidth?: number
  defaultNoteColor?: string
  defaultFontSize?: number
  defaultShape?: ShapeKind
}

export interface UseLeafletCanvasOptions extends CanvasOverlayOptions {
  initialItems?: CanvasItem[]
  items?: CanvasItem[]
  maxHistory?: number
  onItemsChange?: (items: CanvasItem[]) => void
  onChange?: (items: CanvasItem[]) => void
  onChangeComplete?: (items: CanvasItem[], targetItem?: CanvasItem | null) => void
  onItemsChangeComplete?: (items: CanvasItem[], targetItem?: CanvasItem | null) => void
  onEditEnd?: (items: CanvasItem[], targetItem?: CanvasItem | null) => void
  onEditComplete?: (items: CanvasItem[], targetItem?: CanvasItem | null) => void
  onItemSelect?: (item: CanvasItem | null) => void
  onItemCreate?: (item: CanvasItem) => void
  onItemChange?: (item: CanvasItem) => void
  onItemDelete?: (id: string) => void
  onItemChangeComplete?: (item: CanvasItem) => void
  initialTool?: CanvasTool
  onToolChange?: (tool: CanvasTool) => void
}

export type LeafletCanvasOptions = UseLeafletCanvasOptions

export interface LeafletCanvasController {
  items: CanvasItem[]
  activeTool: CanvasTool
  setActiveTool: (tool: CanvasTool) => void
  readOnly: boolean
  setReadOnly: (readOnly: boolean) => void
  activeShape: ShapeKind
  setActiveShape: (shape: ShapeKind) => void
  shapeFilled: boolean
  setShapeFilled: (filled: boolean) => void
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  selectedItem: CanvasItem | null
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
  addItem: (item: CanvasItem) => void
  updateItem: (id: string, patch: Partial<CanvasItem>) => void
  removeItem: (id: string) => void
  deleteSelected: () => void
  clearAll: () => void
  clear: () => void
  deleteItem: (id: string) => void
  setTool: (tool: CanvasTool) => void
  selectItem: (id: string | null) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  notifyChangeComplete: (targetItem?: CanvasItem | null) => void
  exportJSON: () => string
  importJSON: (json: string) => boolean
}

