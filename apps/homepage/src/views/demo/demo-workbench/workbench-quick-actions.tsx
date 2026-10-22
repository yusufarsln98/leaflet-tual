'use client'

import { Redo2, RefreshCw, Undo2 } from 'lucide-react'
import type { LeafletCanvasController } from 'leaflet-canvas/react'

interface WorkbenchQuickActionsProps {
  controller: LeafletCanvasController
  readOnly: boolean
  onResetScenario: () => void
}

export function WorkbenchQuickActions({
  controller,
  readOnly,
  onResetScenario,
}: WorkbenchQuickActionsProps) {
  const quickActionClass = (enabled: boolean) =>
    `flex-1 py-1 px-1.5 rounded text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors ${
      enabled ? 'text-text-primary hover:bg-bg-sidebar cursor-pointer' : 'opacity-40 cursor-not-allowed'
    }`

  return (
    <div className="flex items-center gap-1.5 p-1 rounded-lg bg-bg-pane border border-border-primary text-xs font-mono shadow-2xs">
      <button
        type="button"
        onClick={() => controller.undo()}
        disabled={!controller.canUndo || readOnly}
        className={quickActionClass(controller.canUndo && !readOnly)}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="w-3 h-3" />
        <span>Undo</span>
      </button>
      <span className="text-text-muted/40">|</span>
      <button
        type="button"
        onClick={() => controller.redo()}
        disabled={!controller.canRedo || readOnly}
        className={quickActionClass(controller.canRedo && !readOnly)}
        title="Redo (Ctrl+Y)"
      >
        <Redo2 className="w-3 h-3" />
        <span>Redo</span>
      </button>
      <span className="text-text-muted/40">|</span>
      <button
        type="button"
        onClick={onResetScenario}
        className="flex-1 py-1 px-1.5 rounded text-[11px] font-semibold flex items-center justify-center gap-1 text-text-secondary hover:text-text-primary hover:bg-bg-sidebar transition-colors cursor-pointer"
        title="Reset Scenario"
      >
        <RefreshCw className="w-3 h-3" />
        <span>Reset</span>
      </button>
    </div>
  )
}
