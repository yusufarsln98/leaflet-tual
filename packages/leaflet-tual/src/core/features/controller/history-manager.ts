import type { ChangeInfo, Doc } from '../../types/index.js'
import { cloneDoc } from '../../shared/doc.js'

export interface HistoryManagerContext {
  getDoc: () => Doc
  setDoc: (doc: Doc) => void
  clearSelection: () => void
  maxHistory: number
  onChange?: (doc: Doc, info: ChangeInfo) => void
  emit: (event: string, ...args: unknown[]) => void
}

export function createHistoryManager(ctx: HistoryManagerContext) {
  const undoStack: Doc[] = []
  const redoStack: Doc[] = []

  return {
    get canUndo(): boolean {
      return undoStack.length > 0
    },
    get canRedo(): boolean {
      return redoStack.length > 0
    },
    push(prevSnapshot: Doc) {
      undoStack.push(prevSnapshot)
      if (undoStack.length > ctx.maxHistory) {
        undoStack.shift()
      }
      redoStack.length = 0
    },
    clear() {
      undoStack.length = 0
      redoStack.length = 0
    },
    undo() {
      if (undoStack.length === 0) return
      const prev = undoStack.pop()!
      redoStack.push(cloneDoc(ctx.getDoc()))
      ctx.setDoc(prev)
      ctx.clearSelection()

      const info: ChangeInfo = { reason: 'undo', ids: [], committed: true }
      ctx.onChange?.(prev, info)
      ctx.emit('change', prev, info)
      ctx.emit('state')
    },
    redo() {
      if (redoStack.length === 0) return
      const next = redoStack.pop()!
      undoStack.push(cloneDoc(ctx.getDoc()))
      ctx.setDoc(next)
      ctx.clearSelection()

      const info: ChangeInfo = { reason: 'redo', ids: [], committed: true }
      ctx.onChange?.(next, info)
      ctx.emit('change', next, info)
      ctx.emit('state')
    },
  }
}

