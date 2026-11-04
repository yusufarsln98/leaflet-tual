'use client'

import type { ReactNode } from 'react'
import {
  type ArrowKind,
  type Controller,
  type DrawKind,
  type MeasureKind,
  type ShapeKind,
  type ToolVariant,
  ALL_ARROW_KINDS,
  ALL_SHAPE_KINDS,
  ALL_DRAW_KINDS,
  ALL_MEASURE_KINDS,
  isArrowKind,
  isShapeKind,
  isDrawKind,
  isMeasureKind,
} from '../../../../core/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import { DropdownItem, DropdownMenu, ICONS, Popover } from '../../../ui/index.js'

export { ALL_ARROW_KINDS, ALL_SHAPE_KINDS, ALL_DRAW_KINDS, ALL_MEASURE_KINDS }

export interface ToolVariantsPopoverProps {
  controller: Controller
  type: 'arrow' | 'shape' | 'draw' | 'measure'
  activeVariant?: ToolVariant | DrawKind | MeasureKind | null
  allowedArrowVariants?: readonly ArrowKind[]
  allowedShapeVariants?: readonly ShapeKind[]
  allowedDrawVariants?: readonly DrawKind[]
  allowedMeasureVariants?: readonly MeasureKind[]
  onClose: () => void
  className?: string
}

const DRAW_LABELS: Record<DrawKind, string> = {
  freedraw: 'Free draw',
  pen: 'Pen',
}
const DRAW_SHORTCUTS: Record<DrawKind, string> = {
  freedraw: 'P',
  pen: 'Shift+P',
}

const MEASURE_LABELS: Record<MeasureKind, string> = {
  ruler: 'Distance',
  area: 'Area',
}
const MEASURE_SHORTCUTS: Record<MeasureKind, string> = {
  ruler: 'R',
  area: 'A',
}

interface VariantOption {
  id: string
  label: string
  icon: ReactNode
  shortcut?: string
  selected: boolean
  onSelect: () => void
}

export function ToolVariantsPopover({
  controller,
  type,
  activeVariant,
  allowedArrowVariants,
  allowedShapeVariants,
  allowedDrawVariants,
  allowedMeasureVariants,
  onClose,
  className,
}: ToolVariantsPopoverProps) {
  const { t } = useTranslation(controller)

  const arrowVariant =
    (isArrowKind(activeVariant) ? activeVariant : null) ??
    (controller.tool === 'arrow' && isArrowKind(controller.variant) ? controller.variant : 'linear')

  const shapeVariant =
    (isShapeKind(activeVariant) ? activeVariant : null) ??
    (controller.tool === 'shape' && isShapeKind(controller.variant) ? controller.variant : 'square')

  const drawVariant =
    (isDrawKind(activeVariant) ? activeVariant : null) ??
    (controller.tool === 'pen' || controller.tool === 'freedraw' ? controller.tool : 'freedraw')

  const measureVariant =
    (isMeasureKind(activeVariant) ? activeVariant : null) ??
    (controller.tool === 'area' || controller.tool === 'ruler' ? controller.tool : 'ruler')

  const config: {
    header: string
    minWidth: number
    layout: 'variant-list' | 'variant-grid'
    options: VariantOption[]
  } =
    type === 'arrow'
      ? {
          header: t('arrowStyle'),
          minWidth: 105,
          layout: 'variant-list',
          options: (allowedArrowVariants ?? ALL_ARROW_KINDS).map((v) => ({
            id: v,
            label: t(
              v === 's-curve' ? 'sCurve' : v,
              undefined,
              v.charAt(0).toUpperCase() + v.slice(1),
            ),
            icon: ICONS[v]?.(),
            selected: arrowVariant === v,
            onSelect: () => controller.setTool('arrow', v),
          })),
        }
      : type === 'draw'
        ? {
            header: t('draw'),
            minWidth: 140,
            layout: 'variant-list' as const,
            options: (allowedDrawVariants ?? ALL_DRAW_KINDS).map((v) => ({
              id: v,
              label: t(v, undefined, DRAW_LABELS[v]),
              icon: (v === 'freedraw' ? ICONS.pencil : ICONS[v])?.(),
              shortcut: DRAW_SHORTCUTS[v],
              selected: drawVariant === v,
              onSelect: () => controller.setTool(v),
            })),
          }
        : type === 'measure'
          ? {
              header: t('measureStyle', undefined, 'Measure Type'),
              minWidth: 140,
              layout: 'variant-list' as const,
              options: (allowedMeasureVariants ?? ALL_MEASURE_KINDS).map((v) => ({
                id: v,
                label: t(v, undefined, MEASURE_LABELS[v]),
                icon: (v === 'area' ? ICONS.area : ICONS.ruler)?.(),
                shortcut: MEASURE_SHORTCUTS[v],
                selected: measureVariant === v,
                onSelect: () => controller.setTool(v),
              })),
            }
          : {
              header: t('shapeType'),
              minWidth: 220,
              layout: 'variant-grid',
              options: (allowedShapeVariants ?? ALL_SHAPE_KINDS).map((s) => ({
                id: s,
                label: t(s, undefined, s.charAt(0).toUpperCase() + s.slice(1)),
                icon: ICONS[s]?.(),
                selected: shapeVariant === s,
                onSelect: () => controller.setTool('shape', s),
              })),
            }

  return (
    <Popover
      header={config.header}
      className={className}
      style={{
        position: 'absolute',
        top: 'calc(100% + 6px)',
        left: 0,
        minWidth: config.minWidth,
        width: 'max-content',
      }}
    >
      <DropdownMenu layout={config.layout}>
        {config.options.map((opt) => (
          <DropdownItem
            key={opt.id}
            variant="variant"
            selected={opt.selected}
            leading={opt.icon}
            label={opt.label}
            meta={opt.shortcut}
            onClick={() => {
              opt.onSelect()
              onClose()
            }}
          />
        ))}
      </DropdownMenu>
    </Popover>
  )
}
