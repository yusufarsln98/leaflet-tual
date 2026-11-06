'use client'

import { useRef } from 'react'
import {
  getShortcutLabel,
  resolveKeyboardShortcuts,
  type ArrowKind,
  type Controller,
  type ResolvedKeyboardShortcuts,
  type ShapeKind,
  type ToolId,
  type ToolVariant,
} from '../../../../core/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import { ICONS, type IconName } from '../../../ui/index.js'
import { ToolbarToolButton } from './ToolbarToolButton.js'
import { ToolVariantsPopover } from '../popovers/index.js'

const DEFAULT_SHORTCUTS = resolveKeyboardShortcuts()

export interface ToolbarItemButtonProps {
  toolId: ToolId
  controller: Controller
  shortcuts?: ResolvedKeyboardShortcuts
  isPopoverOpen: boolean
  popoverClassName?: string
  allowedArrowVariants?: readonly ArrowKind[]
  allowedShapeVariants?: readonly ShapeKind[]
  onTogglePopover: (open: boolean) => void
  onClosePopover: () => void
}

export function ToolbarItemButton({
  toolId,
  controller,
  shortcuts = DEFAULT_SHORTCUTS,
  isPopoverOpen,
  popoverClassName,
  allowedArrowVariants,
  allowedShapeVariants,
  onTogglePopover,
  onClosePopover,
}: ToolbarItemButtonProps) {
  const { t } = useTranslation(controller)
  const isActive = controller.tool === toolId
  const isArrow = toolId === 'arrow'
  const isShape = toolId === 'shape'
  const hasVariants = isArrow || isShape

  // Remember the last active variant for arrow/shape when switched away
  const lastVariantRef = useRef<ToolVariant | null>(null)
  if (isActive && controller.variant) {
    lastVariantRef.current = controller.variant
  }

  const variant =
    (isActive ? controller.variant : lastVariantRef.current) ??
    (isArrow ? 'linear' : isShape ? 'square' : null)

  const iconKey = variant ?? toolId
  const icon = (iconKey in ICONS ? ICONS[iconKey as IconName] : ICONS.pencil)()

  const shortcut = getShortcutLabel(shortcuts, toolId)
  const toolName = t(toolId, undefined, toolId.charAt(0).toUpperCase() + toolId.slice(1))
  const label = shortcut ? `${toolName} (${shortcut})` : toolName

  return (
    <ToolbarToolButton
      label={label}
      icon={icon}
      isActive={isActive}
      hasVariants={hasVariants}
      isPopoverOpen={isPopoverOpen}
      chevronLabel={`${toolName} options`}
      onSelect={() => {
        controller.setTool(toolId)
        onClosePopover()
      }}
      onToggleVariants={() => {
        onTogglePopover(!isPopoverOpen)
      }}
    >
      {hasVariants && isPopoverOpen && (
        <ToolVariantsPopover
          controller={controller}
          type={toolId as 'arrow' | 'shape'}
          activeVariant={variant}
          allowedArrowVariants={allowedArrowVariants}
          allowedShapeVariants={allowedShapeVariants}
          shortcuts={shortcuts}
          onClose={onClosePopover}
          className={popoverClassName}
        />
      )}
    </ToolbarToolButton>
  )
}
