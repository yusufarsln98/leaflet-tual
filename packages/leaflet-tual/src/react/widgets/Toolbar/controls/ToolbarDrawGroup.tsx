'use client'

import type { Controller, DrawKind } from '../../../../core/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import { ICONS } from '../../../ui/index.js'
import { ToolbarToolButton } from './ToolbarToolButton.js'
import { ToolVariantsPopover } from '../popovers/index.js'

export interface ToolbarDrawGroupProps {
  controller: Controller
  availableDrawTools: DrawKind[]
  activePopover: string | null
  lastDrawTool: DrawKind
  popoverClassName?: string
  onTogglePopover: (open: boolean) => void
  onClosePopover: () => void
}

export function ToolbarDrawGroup({
  controller,
  availableDrawTools,
  activePopover,
  lastDrawTool,
  popoverClassName,
  onTogglePopover,
  onClosePopover,
}: ToolbarDrawGroupProps) {
  const { t } = useTranslation(controller)
  const activeDrawTool =
    controller.tool === 'freedraw' || controller.tool === 'pen'
      ? controller.tool
      : null
  const isActive = activeDrawTool !== null
  const hasVariants = availableDrawTools.length > 1
  const isPopoverOpen = activePopover === 'draw'
  const fallbackTool = availableDrawTools.includes(lastDrawTool)
    ? lastDrawTool
    : availableDrawTools[0]
  const previewTool = activeDrawTool ?? fallbackTool
  const shortcut = previewTool === 'pen' ? 'P' : 'F'
  const drawName = t('draw', undefined, 'Draw')
  const label = `${drawName} (${shortcut})`

  return (
    <div
      className="tual-tool-group"
      data-has-variants={hasVariants || undefined}
      style={{ position: 'relative' }}
    >
      <ToolbarToolButton
        label={label}
        icon={previewTool === 'freedraw' ? ICONS.pencil() : ICONS[previewTool]()}
        isActive={isActive}
        hasVariants={hasVariants}
        isPopoverOpen={isPopoverOpen}
        chevronLabel={`${drawName} options`}
        onSelect={() => {
          controller.setTool(previewTool)
          onClosePopover()
        }}
        onToggleVariants={() => {
          onTogglePopover(!isPopoverOpen)
        }}
      />

      {hasVariants && isPopoverOpen && (
        <ToolVariantsPopover
          controller={controller}
          type="draw"
          activeVariant={previewTool}
          allowedDrawVariants={availableDrawTools}
          onClose={onClosePopover}
          className={popoverClassName}
        />
      )}
    </div>
  )
}
