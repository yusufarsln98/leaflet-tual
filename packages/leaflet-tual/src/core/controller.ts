import type L from 'leaflet'
import { createStore } from 'zustand/vanilla'
import type {
  ChangeInfo,
  ChangeReason,
  Controller,
  ControllerState,
  ControllerStore,
  CreateLeafletTualOptions,
  InternalController,
  ReorderAction,
  Theme,
  ToolId,
  ToolVariant,
  ToolVariantFor,
} from './types.js'
import type { Doc, Item, NewItem, Style } from '../entities/index.js'
import { cloneDoc, emptyDoc, parseDoc, getPageItems } from '../entities/document/index.js'
import { DEFAULT_TOOL_STYLES } from '../shared/theme/theme.js'
import { resolveTranslations, type TranslationTokens } from '../shared/i18n/index.js'
import { fitItemsToBounds } from '../features/item-crud/fit.js'
import { createPageManager } from '../features/page-manager/page-manager.js'
import { createHistoryManager } from '../features/history/history-manager.js'
import { createItemOperations } from '../features/item-crud/item-crud.js'

type Listener = (...args: unknown[]) => void

const DEFAULT_MAX_HISTORY = 100

function mergeStylePatch(
  style: Style,
  patch: Partial<Style>,
  type: Item['type'] | ToolId | undefined,
): Style {
  const next = { ...style, ...patch }
  if (
    patch.color !== undefined &&
    patch.fillColor === undefined &&
    patch.strokeColor === undefined
  ) {
    if (type === 'shape') {
      next.fillColor = patch.color
      next.strokeColor = patch.color
    } else if (type === 'arrow') {
      next.strokeColor = patch.color
    }
  }
  return next
}

function resolveActivePage(doc: Doc) {
  return doc.pages.find((p) => p.id === doc.activePageId) ?? doc.pages[0]
}

function derivePageData(doc: Doc, selection: string[]) {
  const activePage = resolveActivePage(doc)
  const itemMap = activePage.items
  const items = getPageItems(activePage)
  const selected = selection.map((id) => itemMap[id]).filter(Boolean) as Item[]
  return { doc, items, itemMap, activePageId: doc.activePageId, selected }
}

export function createController(
  options: CreateLeafletTualOptions = {},
  mapGetter?: () => L.Map | null,
): Controller {
  const initialDoc: Doc = options.value
    ? parseDoc(options.value)
    : options.defaultValue
      ? parseDoc(options.defaultValue)
      : emptyDoc(options.translations)

  let customTranslations: Partial<TranslationTokens> = { ...options.translations }
  const getResolvedTranslations = (): TranslationTokens => resolveTranslations(customTranslations)

  const initialTool: ToolId = options.tool ?? 'select'
  const initialVariant: ToolVariant | null = options.variant ?? null
  const lastVariants = new Map<ToolId, ToolVariant>()
  if (initialVariant) lastVariants.set(initialTool, initialVariant)

  const initialDerived = derivePageData(initialDoc, [])

  // 1. Single Source of Truth: The Zustand Store
  const store: ControllerStore = createStore<ControllerState>(() => ({
    ...initialDerived,
    tool: initialTool,
    variant: initialVariant,
    style: { ...DEFAULT_TOOL_STYLES.shape, ...options.style },
    selection: [],
    theme: options.theme ?? 'system',
    readOnly: Boolean(options.readOnly),
    canUndo: false,
    canRedo: false,
    editingId: null,
    translations: getResolvedTranslations(),
  }))

  // 2. Event Dispatcher
  const listeners: Record<string, Set<Listener>> = {}
  function emit(event: string, ...args: unknown[]) {
    listeners[event]?.forEach((fn) => fn(...args))
  }

  function syncUndoRedo() {
    store.setState({
      canUndo: history.canUndo,
      canRedo: history.canRedo,
    })
  }

  // 3. History Manager
  const history = createHistoryManager({
    getDoc: () => store.getState().doc,
    setDoc: (nextDoc) => {
      const derived = derivePageData(nextDoc, [])
      store.setState({ ...derived, selection: [], editingId: null })
    },
    clearSelection: () => {
      store.setState({ selection: [], selected: [], editingId: null })
      emit('select', [])
    },
    maxHistory: DEFAULT_MAX_HISTORY,
    onChange: options.onChange,
    emit: (event, ...args) => {
      syncUndoRedo()
      emit(event, ...args)
    },
  })

  // 4. Change Committer (transient onGesture vs committed onChange)
  function commitChange(
    reason: ChangeReason,
    ids: string[],
    committed: boolean,
    prevDoc?: Doc,
    patches?: Record<string, Partial<Item>>,
  ) {
    const state = store.getState()
    const derived = derivePageData(state.doc, state.selection)
    store.setState(derived)
    syncUndoRedo()

    const info: ChangeInfo = { reason, ids, committed, patches }
    if (!committed) {
      options.onGesture?.(state.doc, info)
      emit('gesture', state.doc, info)
      emit('state')
      return
    }

    if (prevDoc) history.push(prevDoc)
    syncUndoRedo()
    options.onChange?.(state.doc, info)
    emit('change', state.doc, info)
    emit('state')
  }

  // Map binding
  let boundMap: L.Map | null = null
  const getMap = () => boundMap ?? mapGetter?.() ?? null

  // 5. Page Operations
  const pageManager = createPageManager({
    getDoc: () => store.getState().doc,
    setDoc: (nextDoc) => {
      const derived = derivePageData(nextDoc, [])
      store.setState({ ...derived, selection: [], editingId: null })
    },
    getActivePage: () => resolveActivePage(store.getState().doc),
    clearSelection: () => {
      store.setState({ selection: [], selected: [], editingId: null })
      emit('select', [])
    },
    getMap,
    commitChange,
    emit,
    getTranslations: getResolvedTranslations,
  })

  // 6. Item CRUD Operations
  const itemOps = createItemOperations({
    getDoc: () => store.getState().doc,
    getActivePage: () => resolveActivePage(store.getState().doc),
    getCurrentStyle: () => store.getState().style,
    getSelection: () => store.getState().selection,
    setSelection: (sel) => {
      const derived = derivePageData(store.getState().doc, sel)
      store.setState({ selection: sel, selected: derived.selected, editingId: null })
      emit('select', derived.selected)
      emit('state')
    },
    clearEditing: () => {
      store.setState({ editingId: null })
      emit('state')
    },
    getMap,
    commitChange,
  })

  // 7. Controller Facade
  const controller: InternalController = {
    get doc(): Doc {
      return store.getState().doc
    },
    get items(): Item[] {
      return store.getState().items
    },
    get itemMap(): Record<string, Item> {
      return store.getState().itemMap
    },
    get store(): ControllerStore {
      return store
    },
    get tool(): ToolId {
      return store.getState().tool
    },
    get variant(): ToolVariant | null {
      return store.getState().variant
    },
    get style(): Style {
      return store.getState().style
    },
    get selection(): string[] {
      return store.getState().selection
    },
    get selected(): Item[] {
      return store.getState().selected
    },
    get theme(): Theme {
      return store.getState().theme
    },
    get readOnly(): boolean {
      return store.getState().readOnly
    },
    get canUndo(): boolean {
      return store.getState().canUndo
    },
    get canRedo(): boolean {
      return store.getState().canRedo
    },
    get editingId(): string | null {
      return store.getState().editingId
    },
    get translations(): TranslationTokens {
      return store.getState().translations
    },
    get pages() {
      return pageManager
    },

    getItem(id: string): Item | undefined {
      return store.getState().itemMap[id]
    },

    getTranslations(): TranslationTokens {
      return store.getState().translations
    },

    setTranslations(patch: Partial<TranslationTokens>) {
      const current = store.getState().translations
      const hasChange = Object.entries(patch).some(([k, v]) => v !== undefined && current[k] !== v)
      if (!hasChange) return
      customTranslations = { ...customTranslations, ...patch }
      const next = resolveTranslations(customTranslations)
      store.setState({ translations: next })
      emit('translations', next)
      emit('state')
    },

    subscribe(fn: (doc: Doc) => void) {
      return this.on('change', fn as (...args: unknown[]) => void)
    },

    setTheme(nextTheme: Theme) {
      if (store.getState().theme === nextTheme) return
      store.setState({ theme: nextTheme })
      emit('theme', nextTheme)
      emit('state')
    },

    setTool<T extends ToolId = ToolId>(
      tool: T,
      variant?: ToolVariantFor<T> | null,
    ) {
      let nextVariant: ToolVariant | null = null
      if (variant !== undefined) {
        nextVariant = variant ?? null
        if (nextVariant) lastVariants.set(tool, nextVariant)
        else lastVariants.delete(tool)
      } else {
        nextVariant = tool === 'arrow' || tool === 'shape' ? (lastVariants.get(tool) ?? null) : null
      }

      const updates: Partial<ControllerState> = { tool, variant: nextVariant }
      if (tool !== 'select') {
        updates.selection = []
        updates.selected = []
        updates.editingId = null
      }

      store.setState(updates)
      emit('tool', tool, nextVariant)
      emit('state')
    },

    setStyle(patch: Partial<Style>) {
      const state = store.getState()
      const prev = cloneDoc(state.doc)
      const selectedType = state.selection[0] ? state.itemMap[state.selection[0]]?.type : undefined
      const nextStyle = mergeStylePatch(state.style, patch, selectedType ?? state.tool)

      if (state.selection.length > 0) {
        let updated = false
        const patchRecord: Record<string, Partial<Item>> = {}
        for (const id of state.selection) {
          const item = state.itemMap[id]
          if (item) {
            item.style = mergeStylePatch(item.style ?? {}, patch, item.type)
            patchRecord[id] = { style: item.style }
            updated = true
          }
        }
        store.setState({ style: nextStyle })
        if (updated) commitChange('update', [...state.selection], true, prev, patchRecord)
      } else {
        store.setState({ style: nextStyle })
        emit('state')
      }
    },

    add: (item: NewItem) => itemOps.add(item),
    update: (id: string, patch: Partial<Item>, committed?: boolean) =>
      itemOps.update(id, patch, committed),
    updateMany: (patches: Array<{ id: string; patch: Partial<Item> }>, committed?: boolean) =>
      itemOps.updateMany(patches, committed),
    duplicate: (ids?: string | string[]) => itemOps.duplicate(ids),
    reorder: (ids: string | string[], action: ReorderAction) => itemOps.reorder(ids, action),
    bringToFront: (ids?: string | string[]) =>
      itemOps.reorder(ids ?? store.getState().selection, 'front'),
    sendToBack: (ids?: string | string[]) =>
      itemOps.reorder(ids ?? store.getState().selection, 'back'),
    bringForward: (ids?: string | string[]) =>
      itemOps.reorder(ids ?? store.getState().selection, 'forward'),
    sendBackward: (ids?: string | string[]) =>
      itemOps.reorder(ids ?? store.getState().selection, 'backward'),
    remove: (ids?: string | string[]) => itemOps.remove(ids),
    clear: () => itemOps.clear(),

    select(ids: string[] | string | null) {
      const raw = ids === null ? [] : Array.isArray(ids) ? ids : [ids]
      const derived = derivePageData(store.getState().doc, raw)
      store.setState({ selection: raw, selected: derived.selected, editingId: null })
      emit('select', derived.selected)
      emit('state')
    },

    selectAll() {
      const state = store.getState()
      const allIds = Object.keys(state.itemMap)
      const derived = derivePageData(state.doc, allIds)
      store.setState({ selection: allIds, selected: derived.selected, editingId: null })
      emit('select', derived.selected)
      emit('state')
    },

    edit(id: string | null) {
      const currentSelection = store.getState().selection
      const nextSelection = id && !currentSelection.includes(id) ? [id] : currentSelection
      const derived = derivePageData(store.getState().doc, nextSelection)
      store.setState({ editingId: id, selection: nextSelection, selected: derived.selected })
      emit('state')
    },

    undo: () => history.undo(),
    redo: () => history.redo(),

    fit(target: 'all' | 'selection' | string) {
      const state = store.getState()
      const set = new Set(state.selection)
      const targetItems =
        target === 'all'
          ? state.items
          : target === 'selection'
            ? state.items.filter((i) => set.has(i.id))
            : state.items.filter((i) => i.id === target)
      fitItemsToBounds(getMap(), targetItems)
    },

    load(newDoc: Doc) {
      const parsed = parseDoc(newDoc)
      history.clear()
      const derived = derivePageData(parsed, [])
      store.setState({
        ...derived,
        selection: [],
        selected: [],
        editingId: null,
        canUndo: false,
        canRedo: false,
      })
      commitChange('load', [], true)
    },

    setReadOnly(v: boolean) {
      if (store.getState().readOnly === v) return
      if (v) {
        const prev = store.getState()
        store.setState({
          readOnly: true,
          selection: [],
          selected: [],
          editingId: null,
          tool: 'select',
          variant: null,
        })
        if (prev.selection.length > 0) emit('select', [])
        if (prev.tool !== 'select' || prev.variant !== null) emit('tool', 'select', null)
      } else {
        store.setState({ readOnly: false })
      }
      emit('state')
    },

    on(
      event: 'change' | 'gesture' | 'select' | 'tool' | 'page' | 'state' | 'translations' | 'theme',
      handler: Listener,
    ) {
      if (!listeners[event]) listeners[event] = new Set()
      listeners[event].add(handler)
      return () => {
        listeners[event]?.delete(handler)
      }
    },

    _updateControlledDoc: (nextDoc: Doc) => {
      const parsed = parseDoc(nextDoc)
      const derived = derivePageData(parsed, store.getState().selection)
      store.setState(derived)
      emit('state')
    },
    _setMap: (m: L.Map | null) => {
      boundMap = m
    },
  }

  return controller
}
