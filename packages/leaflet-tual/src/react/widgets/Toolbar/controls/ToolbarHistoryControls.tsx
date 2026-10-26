'use client'

import type { Controller } from '../../../../core/index.js'
import { ICONS } from '../icons/index.js'

export interface ToolbarHistoryControlsProps {
  controller: Controller
}

export function ToolbarHistoryControls({ controller }: ToolbarHistoryControlsProps) {
  return (
    <>
      <button
        type="button"
        className="tual-btn"
        disabled={!controller.canUndo}
        title="Undo (Ctrl+Z)"
        onClick={() => controller.undo()}
      >
        {ICONS.undo()}
      </button>
      <button
        type="button"
        className="tual-btn"
        disabled={!controller.canRedo}
        title="Redo (Ctrl+Y)"
        onClick={() => controller.redo()}
      >
        {ICONS.redo()}
      </button>
    </>
  )
}

