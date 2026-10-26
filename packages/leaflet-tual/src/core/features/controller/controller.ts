import type L from 'leaflet'
import type {
  ChangeInfo,
  ChangeReason,
  Controller,
  CreateLeafletTualOptions,
  Doc,
  InternalController,
  Item,
  NewItem,
  Style,
  Theme,
  ToolId,
} from '../../types/index.js'
import { cloneDoc, emptyDoc, parseDoc } from '../../shared/doc.js'
import { DEFAULT_TOOL_STYLES } from '../../shared/theme/theme.js'
import { resolveTranslations, type TranslationTokens } from '../../shared/i18n/index.js'
import { fitItemsToBounds } from './fit.js'
import { createPageManager } from './page-manager.js'
import { createHistoryManager } from './history-manager.js'
import { createItemOperations } from './item-crud.js'

type Listener = (...args: unknown[]) => void

export function createController(
  options: CreateLeafletTualOptions = {},
  mapGetter?: () => L.Map | null,
): Controller {
  let doc: Doc = options.value
    ? parseDoc(options.value)
    : options.defaultValue
      ? parseDoc(options.defaultValue)
      : emptyDoc()

  let activeTool: ToolId = options.tool ?? 'select'
  let activeVariant: string | null = options.variant ?? null
  const lastVariants = new Map<ToolId, string>()
  if (activeVariant) lastVariants.set(activeTool, activeVariant)
  let currentStyle: Style = { ...DEFAULT_TOOL_STYLES.shape, ...options.style }
  let selection: string[] = []
  let editingId: string | null = null
  let readOnlyState = Boolean(options.readOnly)
  let activeTheme: Theme = options.theme ?? 'system'

  function resolveSchemeFromTheme(theme: Theme): 'light' | 'dark' {
    if (theme === 'light') return 'light'
    if (theme === 'dark') return 'dark'
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  }

  let currentScheme: 'light' | 'dark' = resolveSchemeFromTheme(activeTheme)
  let translations = resolveTranslations(options.translations)

  const maxHistory = options.maxHistory ?? 100
  const listeners: Record<string, Set<Listener>> = {}
  const emit = (event: string, ...args: unknown[]) => listeners[event]?.forEach((fn) => fn(...args))
  const getActivePage = () => doc.pages.find((p) => p.id === doc.page) ?? doc.pages[0]
  const clearSelection = () => { selection = []; editingId = null }

  const history = createHistoryManager({
    getDoc: () => doc,
    setDoc: (nextDoc) => { doc = nextDoc },
    clearSelection,
    maxHistory,
    onChange: options.onChange,
    emit,
  })

  function commitChange(reason: ChangeReason, ids: string[], committed: boolean, prevDoc?: Doc) {
    if (committed && prevDoc) history.push(prevDoc)
    const info: ChangeInfo = { reason, ids, committed }
    options.onChange?.(doc, info)
    emit('change', doc, info)
    emit('state')
  }

  let boundMap: L.Map | null = null
  const getMap = () => boundMap ?? mapGetter?.() ?? null

  const pageManager = createPageManager({
    getDoc: () => doc,
    setDoc: (nextDoc) => { doc = nextDoc },
    getActivePage,
    clearSelection,
    getMap,
    commitChange,
    emit,
    getTranslations: () => translations,
  })

  const itemOps = createItemOperations({
    getDoc: () => doc,
    getActivePage,
    getCurrentStyle: () => currentStyle,
    getSelection: () => selection,
    setSelection: (sel) => { selection = sel },
    clearEditing: () => { editingId = null },
    getMap,
    commitChange,
  })

  const controller: InternalController = {
    get doc(): Doc { return doc },
    get items(): Item[] { return getActivePage().items },
    get tool(): ToolId { return activeTool },
    get variant(): string | null { return activeVariant },
    get style(): Style { return currentStyle },
    get selection(): string[] { return selection },
    get selected(): Item[] {
      const set = new Set(selection)
      return getActivePage().items.filter((i) => set.has(i.id))
    },
    get scheme(): 'light' | 'dark' { return currentScheme },
    get theme(): Theme { return activeTheme },
    get readOnly(): boolean { return readOnlyState },
    get canUndo(): boolean { return history.canUndo },
    get canRedo(): boolean { return history.canRedo },
    get editingId(): string | null { return editingId },
    get translations(): TranslationTokens { return translations },
    get pages() { return pageManager },

    getTranslations(): TranslationTokens {
      return translations
    },

    setTranslations(patch: Partial<TranslationTokens>) {
      let hasChange = false
      for (const [k, v] of Object.entries(patch)) {
        if (v !== undefined && (translations as unknown as Record<string, unknown>)[k] !== v) {
          hasChange = true
          break
        }
      }
      if (!hasChange) return
      translations = { ...translations, ...patch } as TranslationTokens
      emit('translations', translations)
      emit('state')
    },

    subscribe(fn: (doc: Doc) => void) {
      return this.on('change', fn as (...args: unknown[]) => void)
    },

    setTheme(nextTheme: Theme) {
      if (activeTheme === nextTheme) return
      activeTheme = nextTheme
      currentScheme = resolveSchemeFromTheme(nextTheme)
      emit('theme', activeTheme)
      emit('state')
    },

    setTool(tool: ToolId, variant?: string | null) {
      activeTool = tool
      if (variant !== undefined) {
        activeVariant = variant
        if (variant) lastVariants.set(tool, variant)
        else lastVariants.delete(tool)
      } else if (tool === 'arrow' || tool === 'shape') {
        activeVariant = lastVariants.get(tool) ?? null
      } else {
        activeVariant = null
      }
      if (tool !== 'select') {
        selection = []
        editingId = null
      }
      options.onToolChange?.(tool, activeVariant)
      emit('tool', tool, activeVariant)
      emit('state')
    },

    setStyle(patch: Partial<Style>) {
      const prev = cloneDoc(doc)
      currentStyle = { ...currentStyle, ...patch }
      if (selection.length > 0) {
        const set = new Set(selection)
        let updated = false
        for (const item of getActivePage().items) {
          if (set.has(item.id)) { item.style = { ...item.style, ...patch }; updated = true }
        }
        if (updated) commitChange('update', [...selection], true, prev)
      } else {
        emit('state')
      }
    },

    add: (item: NewItem) => itemOps.add(item),
    update: (id: string, patch: Partial<Item>, committed?: boolean) => itemOps.update(id, patch, committed),
    remove: (ids?: string | string[]) => itemOps.remove(ids),
    clear: () => itemOps.clear(),

    select(ids: string[] | string | null) {
      selection = ids === null ? [] : Array.isArray(ids) ? ids : [ids]
      editingId = null
      const selectedItems = controller.selected
      options.onSelect?.(selectedItems)
      emit('select', selectedItems)
      emit('state')
    },

    edit(id: string | null) {
      editingId = id
      if (id && !selection.includes(id)) selection = [id]
      emit('state')
    },

    undo: () => history.undo(),
    redo: () => history.redo(),

    fit(target: 'all' | 'selection' | string) {
      const items = getActivePage().items
      const set = new Set(selection)
      const targetItems = target === 'all' ? items : target === 'selection' ? items.filter((i) => set.has(i.id)) : items.filter((i) => i.id === target)
      fitItemsToBounds(mapGetter?.(), targetItems)
    },

    load(newDoc: Doc) {
      doc = parseDoc(newDoc)
      history.clear()
      clearSelection()
      commitChange('load', [], true)
    },

    setReadOnly(v: boolean) {
      readOnlyState = v
      emit('state')
    },

    on(
      event: 'change' | 'select' | 'tool' | 'page' | 'state' | 'translations' | 'theme',
      handler: Listener,
    ) {
      if (!listeners[event]) listeners[event] = new Set()
      listeners[event].add(handler)
      return () => { listeners[event]?.delete(handler) }
    },

    _updateControlledDoc: (nextDoc: Doc) => { doc = nextDoc; emit('state') },
    _setScheme: (s: 'light' | 'dark') => {
      if (currentScheme !== s) {
        currentScheme = s
        emit('state')
      }
    },
    _setTheme(t: Theme) {
      this.setTheme(t)
    },
    _setMap: (m: L.Map | null) => { boundMap = m },
  }

  return controller
}
