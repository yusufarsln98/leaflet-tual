import type {
  TualItem,
  TualTool,
  LeafletTualController,
  ShapeKind,
  UseLeafletTualOptions,
} from '../types/index.js'
import {
  DEFAULT_FONT_SIZE,
  DEFAULT_NOTE_BG,
  DEFAULT_STROKE_COLOR,
  DEFAULT_STROKE_WIDTH,
  NOTE_COLOR_THEMES,
} from '../shared/constants.js'

export interface LeafletTualStore extends LeafletTualController {
  subscribe: (listener: (controller: LeafletTualController) => void) => () => void
  getState: () => LeafletTualController
  destroy: () => void
}

export function createLeafletTualController(
  options: UseLeafletTualOptions = {},
): LeafletTualStore {
  const maxPast = Math.max(0, (options.maxHistory ?? 50) - 1)
  let past: TualItem[][] = []
  let present: TualItem[] = options.items ?? options.initialItems ?? []
  let future: TualItem[][] = []
  let committedItems: TualItem[] = present

  let activeTool: TualTool = options.initialTool ?? 'select'
  let readOnly = Boolean(options.readOnly ?? false)
  let selectedId: string | null = null
  let isEditingLabel = false

  let activeShape: ShapeKind = options.defaultShape ?? 'square'
  let shapeFilled = true
  let activeColor = options.defaultColor ?? DEFAULT_STROKE_COLOR
  let strokeWidth = options.defaultStrokeWidth ?? DEFAULT_STROKE_WIDTH
  let dashed = false
  let noteColor = options.defaultNoteColor ?? DEFAULT_NOTE_BG
  let fontSize = options.defaultFontSize ?? DEFAULT_FONT_SIZE
  let fontWeight: 'normal' | 'bold' = 'bold'

  const listeners = new Set<(controller: LeafletTualController) => void>()

  const notifyListeners = () => {
    for (const listener of listeners) {
      listener(store)
    }
  }

  const triggerChange = (next: TualItem[]) => {
    options.onItemsChange?.(next)
    options.onChange?.(next)
  }

  const triggerChangeComplete = (finalItems: TualItem[], targetItem?: TualItem | null) => {
    options.onItemsChangeComplete?.(finalItems, targetItem)
    options.onChangeComplete?.(finalItems, targetItem)
    options.onEditEnd?.(finalItems, targetItem)
    options.onEditComplete?.(finalItems, targetItem)
    if (targetItem) options.onItemChangeComplete?.(targetItem)
  }

  const commitItems = (updater: (prev: TualItem[]) => TualItem[]) => {
    const next = updater(present)
    present = next
    triggerChange(next)
    notifyListeners()
    return next
  }

  const notifyChangeComplete = (targetItem?: TualItem | null) => {
    if (present === committedItems) return
    const anchor = committedItems
    committedItems = present
    past = [...past, anchor].slice(-maxPast)
    future = []
    triggerChangeComplete(present, targetItem)
    notifyListeners()
  }

  const setSelectedId = (id: string | null) => {
    if (selectedId !== id) {
      const prev = selectedId
      selectedId = id
      isEditingLabel = false
      if (prev !== null && id === null) notifyChangeComplete()
      options.onItemSelect?.(present.find((it) => it.id === id) ?? null)
      notifyListeners()
    }
  }

  const setActiveTool = (tool: TualTool) => {
    if (readOnly && tool !== 'select') return
    activeTool = tool
    options.onToolChange?.(tool)
    notifyListeners()
  }

  const setReadOnly = (nextReadOnly: boolean) => {
    readOnly = Boolean(nextReadOnly)
    if (readOnly && activeTool !== 'select') {
      activeTool = 'select'
    }
    notifyListeners()
  }

  const patchSelected = (predicate: (it: TualItem) => boolean, patcher: (it: any) => any) => {
    if (!selectedId) return
    commitItems((prev) =>
      prev.map((it) => (it.id === selectedId && predicate(it) ? patcher(it) : it)),
    )
  }

  const setActiveShape = (shape: ShapeKind) => {
    if (readOnly) return
    activeShape = shape
    patchSelected((it) => it.type === 'shape', (it) => ({ ...it, shape }))
    notifyListeners()
  }

  const setShapeFilled = (filled: boolean) => {
    if (readOnly) return
    shapeFilled = filled
    patchSelected((it) => it.type === 'shape', (it) => ({ ...it, filled }))
    notifyListeners()
  }

  const setActiveColor = (color: string) => {
    if (readOnly) return
    activeColor = color
    patchSelected((it) => it.type !== 'note', (it) => ({ ...it, color }))
    notifyListeners()
  }

  const setStrokeWidth = (width: number) => {
    if (readOnly) return
    strokeWidth = width
    patchSelected(
      (it) =>
        it.type === 'arrow' ||
        it.type === 'freedraw' ||
        it.type === 'shape' ||
        it.type === 'ruler',
      (it) => ({ ...it, strokeWidth: width }),
    )
    notifyListeners()
  }

  const setDashed = (nextDashed: boolean) => {
    if (readOnly) return
    dashed = nextDashed
    patchSelected(
      (it) =>
        it.type === 'arrow' ||
        it.type === 'freedraw' ||
        it.type === 'shape' ||
        it.type === 'ruler',
      (it) => ({ ...it, dashed: nextDashed }),
    )
    notifyListeners()
  }

  const setNoteColor = (bg: string) => {
    if (readOnly) return
    noteColor = bg
    const theme = NOTE_COLOR_THEMES.find((t) => t.bg === bg)
    patchSelected(
      (it) => it.type === 'note',
      (it) => ({ ...it, backgroundColor: bg, textColor: theme?.text ?? it.textColor }),
    )
    notifyListeners()
  }

  const setFontSize = (size: number) => {
    if (readOnly) return
    fontSize = size
    patchSelected((it) => it.type === 'text', (it) => ({ ...it, initialFontSize: size }))
    notifyListeners()
  }

  const setFontWeight = (weight: 'normal' | 'bold') => {
    if (readOnly) return
    fontWeight = weight
    patchSelected((it) => it.type === 'text', (it) => ({ ...it, fontWeight: weight }))
    notifyListeners()
  }

  const setEditingLabel = (editing: boolean) => {
    isEditingLabel = editing
    notifyListeners()
  }

  const addItem = (item: TualItem) => {
    if (readOnly) return
    commitItems((prev) => [...prev, item])
    setSelectedId(item.id)
    options.onItemCreate?.(item)
  }

  const updateItem = (id: string, patch: Partial<TualItem>) => {
    if (readOnly) {
      const patchKeys = Object.keys(patch)
      if (patchKeys.length !== 1 || patchKeys[0] !== 'minimized') return
    }
    let updated: TualItem | undefined
    commitItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          updated = { ...item, ...patch } as TualItem
          return updated
        }
        return item
      }),
    )
    if (updated) options.onItemChange?.(updated)
  }

  const removeItem = (id: string) => {
    if (readOnly) return
    commitItems((prev) => prev.filter((item) => item.id !== id))
    if (selectedId === id) setSelectedId(null)
    options.onItemDelete?.(id)
    notifyChangeComplete()
  }

  const deleteSelected = () => {
    if (!readOnly && selectedId) removeItem(selectedId)
  }

  const clearAll = () => {
    if (readOnly) return
    commitItems(() => [])
    setSelectedId(null)
    notifyChangeComplete()
  }

  const undo = () => {
    if (readOnly || past.length === 0) return
    const restored = past[past.length - 1]
    future = [present, ...future]
    past = past.slice(0, -1)
    present = restored
    committedItems = restored
    triggerChange(restored)
    triggerChangeComplete(restored, null)
    notifyListeners()
  }

  const redo = () => {
    if (readOnly || future.length === 0) return
    const next = future[0]
    past = [...past, present]
    future = future.slice(1)
    present = next
    committedItems = next
    triggerChange(next)
    triggerChangeComplete(next, null)
    notifyListeners()
  }

  const exportJSON = () => JSON.stringify(present, null, 2)

  const importJSON = (json: string): boolean => {
    if (readOnly) return false
    try {
      const parsed = JSON.parse(json)
      if (!Array.isArray(parsed)) return false
      commitItems(() => parsed as TualItem[])
      setSelectedId(null)
      notifyChangeComplete()
      return true
    } catch {
      return false
    }
  }

  const store: LeafletTualStore = {
    get items() {
      return present
    },
    get activeTool() {
      return activeTool
    },
    setActiveTool,
    get readOnly() {
      return readOnly
    },
    setReadOnly,
    get activeShape() {
      return activeShape
    },
    setActiveShape,
    get shapeFilled() {
      return shapeFilled
    },
    setShapeFilled,
    get selectedId() {
      return selectedId
    },
    setSelectedId,
    get selectedItem() {
      return present.find((it) => it.id === selectedId) ?? null
    },
    get isEditingLabel() {
      return isEditingLabel
    },
    setEditingLabel,
    get labelEditMode() {
      return isEditingLabel
    },
    setLabelEditMode: setEditingLabel,
    get activeColor() {
      return activeColor
    },
    setActiveColor,
    get strokeWidth() {
      return strokeWidth
    },
    setStrokeWidth,
    get dashed() {
      return dashed
    },
    setDashed,
    get noteColor() {
      return noteColor
    },
    setNoteColor,
    get fontSize() {
      return fontSize
    },
    setFontSize,
    get fontWeight() {
      return fontWeight
    },
    setFontWeight,
    addItem,
    updateItem,
    removeItem,
    deleteSelected,
    clearAll,
    clear: clearAll,
    deleteItem: removeItem,
    setTool: setActiveTool,
    selectItem: setSelectedId,
    undo,
    redo,
    get canUndo() {
      return !readOnly && past.length > 0
    },
    get canRedo() {
      return !readOnly && future.length > 0
    },
    notifyChangeComplete,
    exportJSON,
    importJSON,
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    getState() {
      return store
    },
    destroy() {
      listeners.clear()
    },
  }

  return store
}


