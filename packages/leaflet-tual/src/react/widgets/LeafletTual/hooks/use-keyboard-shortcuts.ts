import { useEffect } from 'react'
import type { Controller, ToolId } from '../../../../core/index.js'
import { translateItem } from '../../../../core/index.js'

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
      if (controller.readOnly) return
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
      if (isMeta && key === 'D') {
        if (controller.selection.length > 0) {
          e.preventDefault()
          controller.duplicate()
        }
        return
      }
      if (isMeta && key === 'A') {
        e.preventDefault()
        controller.selectAll()
        return
      }

      if (e.key === ']' && controller.selection.length > 0) {
        e.preventDefault()
        if (e.altKey) controller.bringForward()
        else controller.bringToFront()
        return
      }
      if (e.key === '[' && controller.selection.length > 0) {
        e.preventDefault()
        if (e.altKey) controller.sendBackward()
        else controller.sendToBack()
        return
      }

      if (
        (e.key === 'ArrowUp' ||
          e.key === 'ArrowDown' ||
          e.key === 'ArrowLeft' ||
          e.key === 'ArrowRight') &&
        controller.selection.length > 0
      ) {
        const movable = controller.selected.filter((i) => !i.locked)
        if (movable.length > 0) {
          e.preventDefault()
          const step = e.shiftKey ? 20 : 4
          const dx = e.key === 'ArrowRight' ? step : e.key === 'ArrowLeft' ? -step : 0
          const dy = e.key === 'ArrowUp' ? step : e.key === 'ArrowDown' ? -step : 0
          controller.updateMany(
            movable.map((item) => ({ id: item.id, patch: translateItem(item, { x: dx, y: dy }) })),
            true,
          )
        }
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
          !item.locked &&
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
          const unlockedIds = controller.selected.filter((i) => !i.locked).map((i) => i.id)
          if (unlockedIds.length > 0) {
            e.preventDefault()
            controller.remove(unlockedIds)
          }
        }
        return
      }

      if (!isMeta && !e.altKey) {
        const tool = KEY_TO_TOOL[key]
        if (tool) controller.setTool(tool)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [controller, onEscape, onFinishPen])
}

