'use client'

import type { ReactNode } from 'react'
import type { ArrowKind, Controller, DrawKind, ShapeKind } from '../../../../core/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import {
  ARROW_ICONS,
  DRAW_ICONS,
  DropdownItem,
  DropdownMenu,
  Popover,
  SHAPE_ICONS,
} from '../../../ui/index.js'

export interface ToolVariantsPopoverProps {
  controller: Controller
  type: 'arrow' | 'shape' | 'draw'
  allowedArrowVariants?: ArrowKind[]
  allowedShapeVariants?: ShapeKind[]
  allowedDrawVariants?: DrawKind[]
  onClose: () => void
  className?: string
}

const ALL_ARROW_KINDS: ArrowKind[] = ['linear', 'curved', 'elbow', 's-curve']
const ALL_SHAPE_KINDS: ShapeKind[] = [
  'square',
  'circle',
  'star',
  'actor',
  'triangle',
  'diamond',
  'hexagon',
  'marker',
]
const ALL_DRAW_KINDS: DrawKind[] = ['freedraw', 'pen']
const DRAW_LABELS: Record<DrawKind, string> = {
  freedraw: 'Free draw',
  pen: 'Pen',
}

interface VariantOption {
  id: string
  label: string
  icon: ReactNode
  selected: boolean
  onSelect: () => void
}

export function ToolVariantsPopover({
  controller,
  type,
  allowedArrowVariants,
  allowedShapeVariants,
  allowedDrawVariants,
  onClose,
  className,
}: ToolVariantsPopoverProps) {
  const { t } = useTranslation(controller)

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
            icon: ARROW_ICONS[v]?.(),
            selected: controller.tool === 'arrow' && controller.variant === v,
            onSelect: () => controller.setTool('arrow', v),
          })),
        }
      : type === 'draw'
        ? {
            header: t('draw'),
            minWidth: 115,
            layout: 'variant-list',
            options: (allowedDrawVariants ?? ALL_DRAW_KINDS).map((v) => ({
              id: v,
              label: t(v, undefined, DRAW_LABELS[v]),
              icon: DRAW_ICONS[v]?.(),
              selected: controller.tool === v,
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
              icon: SHAPE_ICONS[s]?.(),
              selected: controller.tool === 'shape' && controller.variant === s,
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

