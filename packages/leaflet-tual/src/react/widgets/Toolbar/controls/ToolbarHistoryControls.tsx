'use client'

import type L from 'leaflet'
import type { Controller } from '../../../../core/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import { ICONS } from '../../../ui/index.js'
import { ToolbarToolButton } from './ToolbarToolButton.js'

export interface ToolbarHistoryControlsProps {
  controller: Controller
  map?: L.Map
}

export function ToolbarHistoryControls({ controller, map }: ToolbarHistoryControlsProps) {
  const { t } = useTranslation(controller)
  const hasItems = controller.items.length > 0

  return (
    <>
      <ToolbarToolButton
        label={`${t('undo')} (Ctrl+Z)`}
        icon={ICONS.undo()}
        isActive={false}
        disabled={!controller.canUndo}
        onSelect={() => controller.undo()}
      />
      <ToolbarToolButton
        label={`${t('redo')} (Ctrl+Shift+Z)`}
        icon={ICONS.redo()}
        isActive={false}
        disabled={!controller.canRedo}
        onSelect={() => controller.redo()}
      />
      <ToolbarToolButton
        label={t('fitInView')}
        icon={ICONS.fitAll()}
        isActive={false}
        disabled={!map || !hasItems}
        onSelect={() => controller.fit('all')}
      />
    </>
  )
}
