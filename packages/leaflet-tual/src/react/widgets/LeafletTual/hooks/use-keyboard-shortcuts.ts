import { useEffect } from 'react'
import type { Controller } from '../../../../core/index.js'
import { KEY_TO_TOOL, setupKeyboardShortcuts } from '../../../../core/index.js'

export { KEY_TO_TOOL, setupKeyboardShortcuts }

export function useKeyboardShortcuts(
  controller: Controller,
  onEscape: () => void,
  onFinishPen?: () => void,
  onFinishArea?: () => void,
) {
  useEffect(() => {
    return setupKeyboardShortcuts(controller, {
      onEscape,
      onFinishPen,
      onFinishArea,
    })
  }, [controller, onEscape, onFinishPen, onFinishArea])
}
