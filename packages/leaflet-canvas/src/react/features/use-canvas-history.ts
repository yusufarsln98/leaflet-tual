import { useCallback, useRef, useState } from 'react'
import type { CanvasItem, UseLeafletCanvasOptions } from '../types/index.js'

interface HistoryState {
  past: CanvasItem[][]
  present: CanvasItem[]
  future: CanvasItem[][]
}

export function useCanvasHistory(options: UseLeafletCanvasOptions) {
  const { initialItems = [], items: controlledItems, maxHistory = 50 } = options
  const maxPast = Math.max(0, maxHistory - 1)

  const callbacksRef = useRef(options)
  callbacksRef.current = options

  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: initialItems,
    future: [],
  })
  const historyRef = useRef(history)
  historyRef.current = history

  const items = controlledItems ?? history.present
  const currentItemsRef = useRef<CanvasItem[]>(items)
  currentItemsRef.current = items

  // Items as of the last completed edit — the snapshot pushed into `past`.
  const committedItemsRef = useRef<CanvasItem[]>(items)

  const triggerChange = useCallback((next: CanvasItem[]) => {
    callbacksRef.current.onItemsChange?.(next)
    callbacksRef.current.onChange?.(next)
  }, [])

  const triggerChangeComplete = useCallback(
    (finalItems: CanvasItem[], targetItem?: CanvasItem | null) => {
      callbacksRef.current.onItemsChangeComplete?.(finalItems, targetItem)
      callbacksRef.current.onChangeComplete?.(finalItems, targetItem)
      callbacksRef.current.onEditEnd?.(finalItems, targetItem)
      callbacksRef.current.onEditComplete?.(finalItems, targetItem)
      if (targetItem) callbacksRef.current.onItemChangeComplete?.(targetItem)
    },
    [],
  )

  const commitItems = useCallback(
    (updater: (prev: CanvasItem[]) => CanvasItem[]) => {
      const next = updater(currentItemsRef.current)
      currentItemsRef.current = next
      triggerChange(next)
      setHistory((prev) => ({ ...prev, present: next }))
      return next
    },
    [triggerChange],
  )

  // Records one history snapshot per completed edit (drag, style tweak, add,
  // delete, import, ...) and then reports it. No-op when nothing changed since
  // the last completion.
  const notifyChangeComplete = useCallback(
    (targetItem?: CanvasItem | null) => {
      const current = currentItemsRef.current
      if (current === committedItemsRef.current) return
      const anchor = committedItemsRef.current
      committedItemsRef.current = current
      setHistory((prev) => ({
        past: [...prev.past, anchor].slice(-maxPast),
        present: current,
        future: [],
      }))
      triggerChangeComplete(current, targetItem)
    },
    [maxPast, triggerChangeComplete],
  )

  const undo = useCallback(
    (readOnly: boolean) => {
      if (readOnly) return
      setHistory((prev) => {
        if (prev.past.length === 0) return prev
        const restored = prev.past[prev.past.length - 1]
        currentItemsRef.current = restored
        committedItemsRef.current = restored
        triggerChange(restored)
        triggerChangeComplete(restored, null)
        return {
          past: prev.past.slice(0, -1),
          present: restored,
          future: [prev.present, ...prev.future],
        }
      })
    },
    [triggerChange, triggerChangeComplete],
  )

  const redo = useCallback(
    (readOnly: boolean) => {
      if (readOnly) return
      setHistory((prev) => {
        if (prev.future.length === 0) return prev
        const restored = prev.future[0]
        currentItemsRef.current = restored
        committedItemsRef.current = restored
        triggerChange(restored)
        triggerChangeComplete(restored, null)
        return {
          past: [...prev.past, prev.present],
          present: restored,
          future: prev.future.slice(1),
        }
      })
    },
    [triggerChange, triggerChangeComplete],
  )

  return {
    items,
    history,
    historyRef,
    callbacksRef,
    commitItems,
    notifyChangeComplete,
    undo,
    redo,
  }
}
