'use client'

import type { Controller, DrawKind } from '../../../../core/index.js'
import { DRAW_ICONS } from '../icons/index.js'
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
  const label = `Draw (${previewTool === 'pen' ? 'P' : 'F'})`

  return (
    <div style={{ position: 'relative' }}>
      <ToolbarToolButton
        label={label}
        icon={DRAW_ICONS[previewTool]()}
        isActive={isActive}
        hasVariants={hasVariants}
        onSelect={() => {
          if (hasVariants) {
            const nextOpen = activePopover !== 'draw'
            if (!isActive) controller.setTool(fallbackTool)
            onTogglePopover(nextOpen)
          } else {
            controller.setTool(fallbackTool)
            onClosePopover()
          }
        }}
      />

      {hasVariants && isPopoverOpen && (
        <ToolVariantsPopover
          controller={controller}
          type="draw"
          allowedDrawVariants={availableDrawTools}
          onClose={onClosePopover}
          className={popoverClassName}
        />
      )}
    </div>
  )
}
