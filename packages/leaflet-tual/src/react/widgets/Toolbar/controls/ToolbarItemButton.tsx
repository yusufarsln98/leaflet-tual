'use client'

import { useRef } from 'react'
import type { ArrowKind, Controller, ShapeKind, ToolId } from '../../../../core/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import { ICONS } from '../../../ui/index.js'
import { ToolbarToolButton } from './ToolbarToolButton.js'
import { ALL_ARROW_KINDS, ALL_SHAPE_KINDS, ToolVariantsPopover } from '../popovers/index.js'

const TOOL_SHORTCUTS: Record<ToolId, string> = {
  select: 'V',
  text: 'T',
  note: 'N',
  arrow: 'L',
  shape: 'S',
  ruler: 'R',
  freedraw: 'F',
  pen: 'P',
}

export interface ToolbarItemButtonProps {
  toolId: ToolId
  controller: Controller
  activeVariant?: string | null
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
  activeVariant,
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

  const lastVariantRef = useRef<string | null>(
    controller.tool === toolId ? controller.variant : null,
  )

  if (controller.tool === toolId && controller.variant) {
    if (isArrow && ALL_ARROW_KINDS.includes(controller.variant as ArrowKind)) {
      lastVariantRef.current = controller.variant
    } else if (isShape && ALL_SHAPE_KINDS.includes(controller.variant as ShapeKind)) {
      lastVariantRef.current = controller.variant
    }
  }

  const effectiveVariant =
    activeVariant !== undefined
      ? activeVariant
      : controller.tool === toolId
        ? controller.variant
        : lastVariantRef.current

  const isVariantValid =
    hasVariants &&
    effectiveVariant &&
    (isArrow
      ? ALL_ARROW_KINDS.includes(effectiveVariant as ArrowKind)
      : isShape
        ? ALL_SHAPE_KINDS.includes(effectiveVariant as ShapeKind)
        : false)

  const icon =
    isVariantValid && effectiveVariant
      ? (ICONS[effectiveVariant]?.() ?? (ICONS[toolId]?.() ?? ICONS.pencil()))
      : (ICONS[toolId]?.() ?? ICONS.pencil())

  const shortcut = TOOL_SHORTCUTS[toolId] ?? toolId.charAt(0).toUpperCase()
  const toolName = t(toolId, undefined, toolId.charAt(0).toUpperCase() + toolId.slice(1))
  const label = `${toolName} (${shortcut})`

  return (
    <div
      className="tual-tool-group"
      data-has-variants={hasVariants || undefined}
      style={{ position: 'relative' }}
    >
      <ToolbarToolButton
        label={label}
        icon={icon}
        isActive={isActive}
        hasVariants={hasVariants}
        isPopoverOpen={isPopoverOpen}
        chevronLabel={`${toolName} options`}
        onSelect={() => {
          const variantToRestore = isVariantValid && effectiveVariant ? effectiveVariant : undefined
          controller.setTool(toolId, variantToRestore)
          onClosePopover()
        }}
        onToggleVariants={() => {
          onTogglePopover(!isPopoverOpen)
        }}
      />

      {hasVariants && isPopoverOpen && (
        <ToolVariantsPopover
          controller={controller}
          type={toolId as 'arrow' | 'shape'}
          activeVariant={effectiveVariant}
          allowedArrowVariants={allowedArrowVariants}
          allowedShapeVariants={allowedShapeVariants}
          onClose={onClosePopover}
          className={popoverClassName}
        />
      )}
    </div>
  )
}
