'use client'

import type { Controller } from '../../../../core/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import { ICONS } from '../icons/index.js'

export interface ToolbarHistoryControlsProps {
  controller: Controller
}

export function ToolbarHistoryControls({ controller }: ToolbarHistoryControlsProps) {
  const { t } = useTranslation(controller)

  return (
    <>
      <button
        type="button"
        className="tual-btn"
        disabled={!controller.canUndo}
        title={`${t('undo')} (Ctrl+Z)`}
        onClick={() => controller.undo()}
      >
        {ICONS.undo()}
      </button>
      <button
        type="button"
        className="tual-btn"
        disabled={!controller.canRedo}
        title={`${t('redo')} (Ctrl+Y)`}
        onClick={() => controller.redo()}
      >
        {ICONS.redo()}
      </button>
    </>
  )
}
