'use client'

import { type Controller, type MeasureKind, isMeasureKind } from '../../../../core/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import { ICONS } from '../../../ui/index.js'
import { ToolbarToolButton } from './ToolbarToolButton.js'
import { ToolVariantsPopover } from '../popovers/index.js'

export interface ToolbarMeasureGroupProps {
  controller: Controller
  availableMeasureTools: MeasureKind[]
  activePopover: string | null
  lastMeasureTool: MeasureKind
  popoverClassName?: string
  onTogglePopover: (open: boolean) => void
  onClosePopover: () => void
}

export function ToolbarMeasureGroup({
  controller,
  availableMeasureTools,
  activePopover,
  lastMeasureTool,
  popoverClassName,
  onTogglePopover,
  onClosePopover,
}: ToolbarMeasureGroupProps) {
  const { t } = useTranslation(controller)
  const activeMeasureTool = isMeasureKind(controller.tool) ? controller.tool : null
  const isActive = activeMeasureTool !== null
  const hasVariants = availableMeasureTools.length > 1
  const isPopoverOpen = activePopover === 'measure'
  const fallbackTool = availableMeasureTools.includes(lastMeasureTool)
    ? lastMeasureTool
    : availableMeasureTools[0]
  const previewTool = activeMeasureTool ?? fallbackTool
  const shortcut = previewTool === 'area' ? 'A' : 'R'
  const toolName =
    previewTool === 'area' ? t('area', undefined, 'Area') : t('ruler', undefined, 'Ruler')
  const groupLabel = t('measure', undefined, 'Measure')
  const label = `${toolName} (${shortcut})`

  return (
    <ToolbarToolButton
      label={label}
      icon={previewTool === 'area' ? ICONS.area() : ICONS.ruler()}
      isActive={isActive}
      hasVariants={hasVariants}
      isPopoverOpen={isPopoverOpen}
      chevronLabel={`${groupLabel} options`}
      onSelect={() => {
        controller.setTool(previewTool)
        onClosePopover()
      }}
      onToggleVariants={() => {
        onTogglePopover(!isPopoverOpen)
      }}
    >
      {hasVariants && isPopoverOpen && (
        <ToolVariantsPopover
          controller={controller}
          type="measure"
          activeVariant={previewTool}
          allowedMeasureVariants={availableMeasureTools}
          onClose={onClosePopover}
          className={popoverClassName}
        />
      )}
    </ToolbarToolButton>
  )
}
