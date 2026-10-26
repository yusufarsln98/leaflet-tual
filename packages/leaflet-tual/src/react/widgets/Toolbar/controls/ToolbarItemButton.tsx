'use client'

import type { ArrowKind, Controller, ShapeKind, ToolId } from '../../../../core/index.js'
import { ARROW_ICONS, ICONS, SHAPE_ICONS } from '../icons/index.js'
import { ToolbarToolButton } from './ToolbarToolButton.js'
import { ToolVariantsPopover } from '../popovers/index.js'

export interface ToolbarItemButtonProps {
  toolId: ToolId
  controller: Controller
  isPopoverOpen: boolean
  popoverClassName?: string
  allowedArrowVariants?: ArrowKind[]
  allowedShapeVariants?: ShapeKind[]
  onTogglePopover: (open: boolean) => void
  onClosePopover: () => void
}

export function ToolbarItemButton({
  toolId,
  controller,
  isPopoverOpen,
  popoverClassName,
  allowedArrowVariants,
  allowedShapeVariants,
  onTogglePopover,
  onClosePopover,
}: ToolbarItemButtonProps) {
  const isActive = controller.tool === toolId
  const hasVariants = toolId === 'arrow' || toolId === 'shape'
  const icon =
    toolId === 'arrow' && controller.variant
      ? (ARROW_ICONS[controller.variant as ArrowKind]?.() ?? ICONS.arrow())
      : toolId === 'shape' && controller.variant
        ? (SHAPE_ICONS[controller.variant as ShapeKind]?.() ?? ICONS.shape())
        : ICONS[toolId]()
  const label = `${toolId.charAt(0).toUpperCase() + toolId.slice(1)} (${toolId.charAt(0).toUpperCase()})`

  return (
    <div style={{ position: 'relative' }}>
      <ToolbarToolButton
        label={label}
        icon={icon}
        isActive={isActive}
        hasVariants={hasVariants}
        onSelect={() => {
          if (hasVariants) {
            const nextOpen = !isPopoverOpen
            if (!isActive) controller.setTool(toolId)
            onTogglePopover(nextOpen)
          } else {
            controller.setTool(toolId)
            onClosePopover()
          }
        }}
      />

      {hasVariants && isPopoverOpen && (
        <ToolVariantsPopover
          controller={controller}
          type={toolId as 'arrow' | 'shape'}
          allowedArrowVariants={allowedArrowVariants}
          allowedShapeVariants={allowedShapeVariants}
          onClose={onClosePopover}
          className={popoverClassName}
        />
      )}
    </div>
  )
}
