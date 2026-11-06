import { useEffect } from 'react'
import type { Controller } from '../../../../core/index.js'
import {
  DEFAULT_SHORTCUT_BINDINGS,
  getShortcutLabel,
  KEY_TO_TOOL,
  resolveKeyboardShortcuts,
  setupKeyboardShortcuts,
  type KeyboardShortcutsOptions,
} from '../../../../core/index.js'

export {
  DEFAULT_SHORTCUT_BINDINGS,
  getShortcutLabel,
  KEY_TO_TOOL,
  resolveKeyboardShortcuts,
  setupKeyboardShortcuts,
  type KeyboardShortcutsOptions,
}

export function useKeyboardShortcuts(
  controller: Controller,
  onEscape: () => void,
  onFinishPen?: () => void,
  onFinishArea?: () => void,
  shortcuts?: boolean | KeyboardShortcutsOptions,
) {
  useEffect(() => {
    return setupKeyboardShortcuts(
      controller,
      {
        onEscape,
        onFinishPen,
        onFinishArea,
      },
      shortcuts,
    )
  }, [controller, onEscape, onFinishPen, onFinishArea, shortcuts])
}
