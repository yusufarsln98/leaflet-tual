import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  CanvasItem,
  CanvasTool,
  LeafletCanvasController,
  UseLeafletCanvasOptions,
} from '../types/index.js'
import { useCanvasHistory } from './use-canvas-history.js'
import { useCanvasStyles } from './use-canvas-styles.js'

export function useLeafletCanvas(
  options: UseLeafletCanvasOptions = {},
): LeafletCanvasController {
  const {
    items: controlledItems,
    initialTool = 'select',
    defaultColor,
    defaultStrokeWidth,
    defaultNoteColor,
    defaultFontSize,
    defaultShape,
  } = options

  const {
    items,
    history,
    historyRef,
    callbacksRef,
    commitItems,
    notifyChangeComplete,
    undo: rawUndo,
    redo: rawRedo,
  } = useCanvasHistory(options)

  const [activeToolState, setActiveToolState] = useState<CanvasTool>(initialTool)
  const [readOnly, setReadOnly] = useState<boolean>(Boolean(options.readOnly ?? false))
  const prevOptionReadOnly = useRef(options.readOnly)
  useEffect(() => {
    if (options.readOnly !== undefined && options.readOnly !== prevOptionReadOnly.current) {
      prevOptionReadOnly.current = options.readOnly
      setReadOnly(Boolean(options.readOnly))
    }
  }, [options.readOnly])

  const [selectedId, setSelectedIdState] = useState<string | null>(null)
  const [isEditingLabel, setIsEditingLabel] = useState<boolean>(false)

  const styles = useCanvasStyles({
    defaultColor,
    defaultStrokeWidth,
    defaultNoteColor,
    defaultFontSize,
    defaultShape,
    readOnly,
    selectedId,
    commitItems,
  })

  const setSelectedId = useCallback(
    (idOrUpdater: string | null | ((prev: string | null) => string | null)) => {
      setSelectedIdState((prev) => {
        const nextId = typeof idOrUpdater === 'function' ? idOrUpdater(prev) : idOrUpdater
        if (prev !== nextId) {
          setIsEditingLabel(false)
          if (prev !== null && nextId === null) notifyChangeComplete()
          const currentList = controlledItems ?? historyRef.current.present
          callbacksRef.current.onItemSelect?.(currentList.find((it) => it.id === nextId) ?? null)
        }
        return nextId
      })
    },
    [controlledItems, notifyChangeComplete, historyRef, callbacksRef],
  )

  const setActiveTool = useCallback(
    (tool: CanvasTool) => {
      if (readOnly && tool !== 'select') return
      setActiveToolState(tool)
      callbacksRef.current.onToolChange?.(tool)
    },
    [readOnly, callbacksRef],
  )

  const addItem = useCallback(
    (item: CanvasItem) => {
      if (readOnly) return
      commitItems((prev) => [...prev, item])
      setSelectedId(item.id)
      callbacksRef.current.onItemCreate?.(item)
    },
    [readOnly, commitItems, setSelectedId, callbacksRef],
  )

  const updateItem = useCallback(
    (id: string, patch: Partial<CanvasItem>) => {
      if (readOnly) {
        const patchKeys = Object.keys(patch)
        if (patchKeys.length !== 1 || patchKeys[0] !== 'minimized') return
      }
      let updated: CanvasItem | undefined
      commitItems((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            updated = { ...item, ...patch } as CanvasItem
            return updated
          }
          return item
        }),
      )
      if (updated) callbacksRef.current.onItemChange?.(updated)
    },
    [readOnly, commitItems, callbacksRef],
  )

  const removeItem = useCallback(
    (id: string) => {
      if (readOnly) return
      commitItems((prev) => prev.filter((item) => item.id !== id))
      setSelectedId((prev) => (prev === id ? null : prev))
      callbacksRef.current.onItemDelete?.(id)
      notifyChangeComplete()
    },
    [readOnly, commitItems, setSelectedId, notifyChangeComplete, callbacksRef],
  )

  const deleteSelected = useCallback(() => {
    if (!readOnly && selectedId) removeItem(selectedId)
  }, [readOnly, selectedId, removeItem])

  const clearAll = useCallback(() => {
    if (readOnly) return
    commitItems(() => [])
    setSelectedId(null)
    notifyChangeComplete()
  }, [readOnly, commitItems, setSelectedId, notifyChangeComplete])

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  )

  const exportJSON = useCallback(() => JSON.stringify(items, null, 2), [items])

  const importJSON = useCallback(
    (json: string): boolean => {
      if (readOnly) return false
      try {
        const parsed = JSON.parse(json)
        if (!Array.isArray(parsed)) return false
        commitItems(() => parsed as CanvasItem[])
        setSelectedId(null)
        notifyChangeComplete()
        return true
      } catch {
        return false
      }
    },
    [readOnly, commitItems, setSelectedId, notifyChangeComplete],
  )

  return {
    items,
    activeTool: activeToolState,
    setActiveTool,
    readOnly,
    setReadOnly,
    ...styles,
    selectedId,
    setSelectedId,
    selectedItem,
    isEditingLabel,
    setEditingLabel: setIsEditingLabel,
    labelEditMode: isEditingLabel,
    setLabelEditMode: setIsEditingLabel,
    addItem,
    updateItem,
    removeItem,
    deleteSelected,
    clearAll,
    clear: clearAll,
    deleteItem: removeItem,
    setTool: setActiveTool,
    selectItem: setSelectedId,
    undo: useCallback(() => rawUndo(readOnly), [rawUndo, readOnly]),
    redo: useCallback(() => rawRedo(readOnly), [rawRedo, readOnly]),
    canUndo: !readOnly && history.past.length > 0,
    canRedo: !readOnly && history.future.length > 0,
    notifyChangeComplete,
    exportJSON,
    importJSON,
  }
}

export const useLeafletTual = useLeafletCanvas

