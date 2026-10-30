'use client'

import type { ReactNode } from 'react'
import type { ArrowKind, Controller, DrawKind, ShapeKind } from '../../../../core/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import {
  DropdownItem,
  DropdownMenu,
  ICONS,
  Popover,
} from '../../../ui/index.js'

export interface ToolVariantsPopoverProps {
  controller: Controller
  type: 'arrow' | 'shape' | 'draw'
  activeVariant?: string | null
  allowedArrowVariants?: ArrowKind[]
  allowedShapeVariants?: ShapeKind[]
  allowedDrawVariants?: DrawKind[]
  onClose: () => void
  className?: string
}

export const ALL_ARROW_KINDS: ArrowKind[] = ['linear', 'curved', 'elbow', 's-curve']
export const ALL_SHAPE_KINDS: ShapeKind[] = [
  'square',
  'circle',
  'star',
  'actor',
  'triangle',
  'diamond',
  'hexagon',
  'marker',
]
export const ALL_DRAW_KINDS: DrawKind[] = ['freedraw', 'pen']
const DRAW_LABELS: Record<DrawKind, string> = {
  freedraw: 'Free draw',
  pen: 'Pen',
}
const DRAW_SHORTCUTS: Record<DrawKind, string> = {
  freedraw: 'P',
  pen: 'Shift+P',
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
  onClose,
  className,
}: ToolVariantsPopoverProps) {
  const { t } = useTranslation(controller)

  const effectiveArrowVariant =
    (activeVariant && ALL_ARROW_KINDS.includes(activeVariant as ArrowKind) ? activeVariant : null) ??
    (controller.tool === 'arrow' && controller.variant && ALL_ARROW_KINDS.includes(controller.variant as ArrowKind)
      ? controller.variant
      : 'linear')

  const effectiveShapeVariant =
    (activeVariant && ALL_SHAPE_KINDS.includes(activeVariant as ShapeKind) ? activeVariant : null) ??
    (controller.tool === 'shape' && controller.variant && ALL_SHAPE_KINDS.includes(controller.variant as ShapeKind)
      ? controller.variant
      : 'square')

  const effectiveDrawVariant =
    (activeVariant && ALL_DRAW_KINDS.includes(activeVariant as DrawKind) ? (activeVariant as DrawKind) : null) ??
    (controller.tool === 'pen' || controller.tool === 'freedraw' ? controller.tool : 'freedraw')

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
            label: t(v === 's-curve' ? 'sCurve' : v, undefined, v.charAt(0).toUpperCase() + v.slice(1)),
            icon: ICONS[v]?.(),
            selected: effectiveArrowVariant === v,
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
              icon: ICONS[v]?.(),
              shortcut: DRAW_SHORTCUTS[v],
              selected: effectiveDrawVariant === v,
              onSelect: () => controller.setTool(v),
            })),
          }
        : {
            header: t('shapeType'),
            minWidth: 175,
            layout: 'variant-grid',
            options: (allowedShapeVariants ?? ALL_SHAPE_KINDS).map((s) => ({
              id: s,
              label: t(s, undefined, s.charAt(0).toUpperCase() + s.slice(1)),
              icon: ICONS[s]?.(),
              selected: effectiveShapeVariant === s,
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

