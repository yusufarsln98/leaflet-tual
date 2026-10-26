'use client'

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

  if (type === 'arrow') {
    const variants = allowedArrowVariants ?? ALL_ARROW_KINDS
    return (
      <Popover
        header={t('arrowStyle')}
        className={className}
        style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          minWidth: 105,
        }}
      >
        <DropdownMenu layout="variant-list">
          {variants.map((v) => {
            const tokenKey = v === 's-curve' ? 'sCurve' : v
            const label = t(tokenKey, undefined, v.charAt(0).toUpperCase() + v.slice(1))
            return (
              <DropdownItem
                key={v}
                variant="variant"
                selected={controller.tool === 'arrow' && controller.variant === v}
                leading={ARROW_ICONS[v]?.()}
                label={label}
                onClick={() => {
                  controller.setTool('arrow', v)
                  onClose()
                }}
              />
            )
          })}
        </DropdownMenu>
      </Popover>
    )
  }

  if (type === 'draw') {
    const variants = allowedDrawVariants ?? ALL_DRAW_KINDS
    return (
      <Popover
        header={t('draw')}
        className={className}
        style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          minWidth: 115,
        }}
      >
        <DropdownMenu layout="variant-list">
          {variants.map((variant) => {
            const label = t(variant, undefined, DRAW_LABELS[variant])
            return (
              <DropdownItem
                key={variant}
                variant="variant"
                selected={
                  (controller.tool === 'freedraw' || controller.tool === 'pen') &&
                  controller.tool === variant
                }
                leading={DRAW_ICONS[variant]?.()}
                label={label}
                onClick={() => {
                  controller.setTool(variant)
                  onClose()
                }}
              />
            )
          })}
        </DropdownMenu>
      </Popover>
    )
  }

  const shapeVariants = allowedShapeVariants ?? ALL_SHAPE_KINDS
  return (
    <Popover
      header={t('shapeType')}
      className={className}
      style={{
        position: 'absolute',
        top: 'calc(100% + 6px)',
        left: 0,
        minWidth: 175,
      }}
    >
      <DropdownMenu layout="variant-grid">
        {shapeVariants.map((s) => {
          const label = t(s, undefined, s.charAt(0).toUpperCase() + s.slice(1))
          return (
            <DropdownItem
              key={s}
              variant="variant"
              selected={controller.tool === 'shape' && controller.variant === s}
              leading={SHAPE_ICONS[s]?.()}
              label={label}
              onClick={() => {
                controller.setTool('shape', s)
                onClose()
              }}
            />
          )
        })}
      </DropdownMenu>
    </Popover>
  )
}
