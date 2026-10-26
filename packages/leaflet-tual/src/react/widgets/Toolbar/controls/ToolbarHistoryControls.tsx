'use client'

import type { Controller } from '../../../../core/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import { IconButton, ICONS } from '../../../ui/index.js'

export interface ToolbarHistoryControlsProps {
  controller: Controller
}

export function ToolbarHistoryControls({ controller }: ToolbarHistoryControlsProps) {
  const { t } = useTranslation(controller)

  return (
    <>
      <IconButton
        disabled={!controller.canUndo}
        title={`${t('undo')} (Ctrl+Z)`}
        icon={ICONS.undo()}
        onClick={() => controller.undo()}
      />
      <IconButton
        disabled={!controller.canRedo}
        title={`${t('redo')} (Ctrl+Y)`}
        icon={ICONS.redo()}
        onClick={() => controller.redo()}
      />
    </>
  )
}
