import { useEffect } from 'react'
import type { ArrowItem, CanvasItem, CanvasTool, ShapeItem } from '../../types/index.js'
import type { DraftArrowState, DraftRulerState, DraftShapeState } from './types.js'

export interface UseCanvasKeyboardShortcutsOptions {
  isReadOnly: boolean
  selectedId: string | null
  selectedItem?: CanvasItem | null
  items?: CanvasItem[]
  isEditingLabel?: boolean
  setEditingLabel?: (editing: boolean) => void
  deleteSelected: () => void
  setSelectedId: (id: string | null) => void
  setActiveTool: (tool: CanvasTool) => void
  setDraftArrow: (draft: DraftArrowState | null) => void
  setDraftShape: (draft: DraftShapeState | null) => void
  setDraftRuler?: (draft: DraftRulerState | null) => void
  clearDraftFreeDraw: () => void
  notifyChangeComplete?: () => void
}

export function useCanvasKeyboardShortcuts({
  isReadOnly,
  selectedId,
  selectedItem,
  items,
  isEditingLabel: _isEditingLabel,
  setEditingLabel,
  deleteSelected,
  setSelectedId,
  setActiveTool,
  setDraftArrow,
  setDraftShape,
  setDraftRuler,
  clearDraftFreeDraw,
  notifyChangeComplete,
}: UseCanvasKeyboardShortcutsOptions) {
  useEffect(() => {
    if (isReadOnly) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return
      }

      if (e.key === 'Escape') {
        setDraftArrow(null)
        setDraftShape(null)
        setDraftRuler?.(null)
        clearDraftFreeDraw()
        setSelectedId(null)
        setActiveTool('select')
        notifyChangeComplete?.()
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) {
          e.preventDefault()
          deleteSelected()
        }
      } else if (e.key === 'Enter') {
        const item = selectedItem ?? items?.find((it) => it.id === selectedId)
        if (item && item.type === 'shape') {
          const shape = item as ShapeItem
          const hasLabelMode =
            shape.labelMode !== false && (shape as any).hasLabelMode !== false
          if (hasLabelMode) {
            e.preventDefault()
            setEditingLabel?.(true)
            const focusInput = () => {
              const input = document.querySelector<HTMLInputElement>(
                `[data-rlc-shape-label-input="${shape.id}"], [data-rlc-shape-label-input], input[placeholder*="Shape label"]`,
              )
              if (input) {
                input.focus()
                input.select()
              }
            }
            focusInput()
            if (typeof requestAnimationFrame === 'function') {
              requestAnimationFrame(focusInput)
            }
            setTimeout(focusInput, 0)
          }
        } else if (item && item.type === 'text') {
          e.preventDefault()
          setEditingLabel?.(true)
          const focusInput = () => {
            const input = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(
              `[data-rlc-text="${item.id}"] textarea, [data-rlc-text="${item.id}"] input, [data-rlc-text] textarea`,
            )
            if (input) {
              input.focus()
              if ('select' in input && typeof input.select === 'function') {
                input.select()
              }
            }
          }
          focusInput()
          if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(focusInput)
          }
          setTimeout(focusInput, 0)
        } else if (item && item.type === 'note') {
          e.preventDefault()
          setEditingLabel?.(true)
          const focusInput = () => {
            const input = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(
              `[data-rlc-note="${item.id}"] textarea, [data-rlc-note="${item.id}"] input, [data-rlc-note] textarea`,
            )
            if (input) {
              input.focus()
            }
          }
          focusInput()
          if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(focusInput)
          }
          setTimeout(focusInput, 0)
        } else if (item && item.type === 'arrow') {
          const arrow = item as ArrowItem
          const hasLabelMode =
            arrow.labelMode !== false && (arrow as any).hasLabelMode !== false
          if (hasLabelMode) {
            e.preventDefault()
            setEditingLabel?.(true)
            const focusInput = () => {
              const input = document.querySelector<HTMLInputElement>(
                `[data-rlc-arrow-label-input="${arrow.id}"], [data-rlc-arrow-label-input], input[placeholder*="Arrow label"]`,
              )
              if (input) {
                input.focus()
                input.select()
              }
            }
            focusInput()
            if (typeof requestAnimationFrame === 'function') {
              requestAnimationFrame(focusInput)
            }
            setTimeout(focusInput, 0)
          }
        }
      } else if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        const key = e.key.toLowerCase()
        if (key === 'v') setActiveTool('select')
        else if (key === 'p') setActiveTool('freedraw')
        else if (key === 'r') setActiveTool('ruler')
        else if (key === 'a') setActiveTool('arrow-linear')
        else if (key === 'c') setActiveTool('arrow-curved')
        else if (key === 'b') setActiveTool('arrow-bi')
        else if (key === 'e') setActiveTool('arrow-elbow')
        else if (key === 's') setActiveTool('arrow-s-curve')
        else if (key === 'n') setActiveTool('note')
        else if (key === 't') setActiveTool('text')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    isReadOnly,
    selectedId,
    selectedItem,
    items,
    setEditingLabel,
    deleteSelected,
    setSelectedId,
    setActiveTool,
    setDraftArrow,
    setDraftShape,
    setDraftRuler,
    clearDraftFreeDraw,
    notifyChangeComplete,
  ])
}
