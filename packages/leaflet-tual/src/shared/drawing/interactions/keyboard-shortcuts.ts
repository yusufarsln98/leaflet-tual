import type { Controller } from '../../../core/types.js'
import { isEscapeHandled } from '../../dom/escape-handled.js'
import { shouldIgnoreShortcutEvent } from '../../dom/shortcut-guard.js'
import { translateItem } from '../../geometry/translate.js'
import {
  resolveKeyboardShortcuts,
  SHORTCUT_TOOL_ACTIONS,
  type KeyboardShortcutsOptions,
  type ShortcutAction,
} from './shortcut-config.js'
import { matchesShortcut } from './shortcut-match.js'

export {
  DEFAULT_SHORTCUT_BINDINGS,
  getShortcutLabel,
  KEY_TO_TOOL,
  resolveKeyboardShortcuts,
  type KeyboardShortcutsOptions,
  type ResolvedKeyboardShortcuts,
  type ShortcutAction,
  type ShortcutBinding,
  type ShortcutCommandAction,
} from './shortcut-config.js'

export interface KeyboardShortcutHandlers {
  onEscape?: () => void
  onFinishPen?: () => void
  onFinishArea?: () => void
}

export function setupKeyboardShortcuts(
  controller: Controller,
  handlers: KeyboardShortcutHandlers = {},
  shortcuts?: boolean | KeyboardShortcutsOptions,
): () => void {
  const resolved = resolveKeyboardShortcuts(shortcuts)
  const matches = (event: KeyboardEvent, action: ShortcutAction) =>
    matchesShortcut(event, resolved[action])

  const onKeyDown = (e: KeyboardEvent) => {
    if (controller.readOnly) return
    if (shouldIgnoreShortcutEvent(e)) return

    if (matches(e, 'undo')) {
      if (controller.canUndo) {
        e.preventDefault()
        controller.undo()
      }
      return
    }
    if (matches(e, 'redo')) {
      if (controller.canRedo) {
        e.preventDefault()
        controller.redo()
      }
      return
    }
    if (controller.selection.length > 0 && matches(e, 'duplicate')) {
      e.preventDefault()
      controller.duplicate()
      return
    }
    if (matches(e, 'selectAll')) {
      if (controller.items.length > 0) {
        e.preventDefault()
        controller.selectAll()
      }
      return
    }

    if (controller.selection.length > 0) {
      if (matches(e, 'bringForward')) {
        e.preventDefault()
        controller.bringForward()
        return
      }
      if (matches(e, 'bringToFront')) {
        e.preventDefault()
        controller.bringToFront()
        return
      }
      if (matches(e, 'sendBackward')) {
        e.preventDefault()
        controller.sendBackward()
        return
      }
      if (matches(e, 'sendToBack')) {
        e.preventDefault()
        controller.sendToBack()
        return
      }

      const movable = controller.selected.filter((i) => !i.locked)
      if (movable.length > 0) {
        const step = e.shiftKey ? 20 : 4
        const dx = matches(e, 'nudgeRight') ? step : matches(e, 'nudgeLeft') ? -step : 0
        const dy = matches(e, 'nudgeUp') ? step : matches(e, 'nudgeDown') ? -step : 0

        if (dx !== 0 || dy !== 0) {
          e.preventDefault()
          controller.updateMany(
            movable.map((item) => ({ id: item.id, patch: translateItem(item, { x: dx, y: dy }) })),
            true,
          )
          return
        }
      }
    }

    if (matches(e, 'finish')) {
      if (controller.tool === 'pen' && handlers.onFinishPen) {
        e.preventDefault()
        handlers.onFinishPen()
        return
      }
      if (controller.tool === 'area' && handlers.onFinishArea) {
        e.preventDefault()
        handlers.onFinishArea()
        return
      }
    }

    if (matches(e, 'escape')) {
      if (isEscapeHandled(e)) return
      handlers.onEscape?.()
      controller.select(null)
      controller.setTool('select')
      return
    }

    if (controller.selection.length > 0 && matches(e, 'delete')) {
      const unlockedIds = controller.selected.filter((i) => !i.locked).map((i) => i.id)
      if (unlockedIds.length > 0) {
        e.preventDefault()
        controller.remove(unlockedIds)
      }
      return
    }

    if (e.repeat) return

    for (const tool of SHORTCUT_TOOL_ACTIONS) {
      if (matches(e, tool)) {
        e.preventDefault()
        controller.setTool(tool)
        return
      }
    }
  }

  window.addEventListener('keydown', onKeyDown)
  return () => {
    window.removeEventListener('keydown', onKeyDown)
  }
}
