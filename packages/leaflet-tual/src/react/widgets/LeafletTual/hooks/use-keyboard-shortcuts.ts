import { useEffect } from 'react'
import type { Controller, ToolId } from '../../../../core/index.js'

const KEY_TO_TOOL: Record<string, ToolId> = {
  V: 'select',
  T: 'text',
  N: 'note',
  F: 'freedraw',
  P: 'pen',
  L: 'arrow',
  S: 'shape',
  R: 'ruler',
}

export function useKeyboardShortcuts(
  controller: Controller,
  onEscape: () => void,
  onFinishPen?: () => void,
) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null
      if (el?.tagName === 'INPUT' || el?.tagName === 'TEXTAREA' || el?.isContentEditable) {
        return
      }

      const key = e.key.toUpperCase()
      const isMeta = e.metaKey || e.ctrlKey

      if (isMeta && key === 'Z') {
        e.preventDefault()
        if (e.shiftKey) controller.redo()
        else controller.undo()
        return
      }
      if (isMeta && key === 'Y') {
        e.preventDefault()
        controller.redo()
        return
      }

      if (e.key === 'Enter') {
        if (controller.tool === 'pen' && onFinishPen) {
          e.preventDefault()
          onFinishPen()
          return
        }
        const [item] = controller.selected
        if (
          controller.selected.length === 1 &&
          (item.type === 'shape' || item.type === 'arrow' || item.type === 'text')
        ) {
          e.preventDefault()
          controller.edit(item.id)
          return
        }
      }

      if (e.key === 'Escape') {
        onEscape()
        controller.select(null)
        controller.setTool('select')
        return
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (controller.selection.length > 0) {
          e.preventDefault()
          controller.remove()
        }
        return
      }

      const tool = KEY_TO_TOOL[key]
      if (tool) controller.setTool(tool)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [controller, onEscape, onFinishPen])
}

