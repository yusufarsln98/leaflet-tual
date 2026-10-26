'use client'

import type { ArrowKind, Controller, DrawKind, ShapeKind } from '../../../../core/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import { ARROW_ICONS, DRAW_ICONS, SHAPE_ICONS } from '../icons/index.js'

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
      <div
        className={`tual-popover ${className ?? ''}`}
        style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          minWidth: 105,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tual-popover-header">{t('arrowStyle')}</div>
        <div className="tual-variant-list">
          {variants.map((v) => {
            const tokenKey = v === 's-curve' ? 'sCurve' : v
            const label = t(tokenKey, undefined, v.charAt(0).toUpperCase() + v.slice(1))
            return (
              <button
                key={v}
                type="button"
                className="tual-btn tual-variant-item"
                data-active={controller.tool === 'arrow' && controller.variant === v}
                onClick={() => {
                  controller.setTool('arrow', v)
                  onClose()
                }}
              >
                <span className="tual-variant-icon">{ARROW_ICONS[v]?.()}</span>
                <span className="tual-variant-label">{label}</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  if (type === 'draw') {
    const variants = allowedDrawVariants ?? ALL_DRAW_KINDS
    return (
      <div
        className={`tual-popover ${className ?? ''}`}
        style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          minWidth: 115,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tual-popover-header">{t('draw')}</div>
        <div className="tual-variant-list">
          {variants.map((variant) => {
            const label = t(variant, undefined, DRAW_LABELS[variant])
            return (
              <button
                key={variant}
                type="button"
                className="tual-btn tual-variant-item"
                data-active={
                  (controller.tool === 'freedraw' || controller.tool === 'pen') &&
                  controller.tool === variant
                }
                onClick={() => {
                  controller.setTool(variant)
                  onClose()
                }}
              >
                <span className="tual-variant-icon">{DRAW_ICONS[variant]?.()}</span>
                <span className="tual-variant-label">{label}</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const shapeVariants = allowedShapeVariants ?? ALL_SHAPE_KINDS
  return (
    <div
      className={`tual-popover ${className ?? ''}`}
      style={{
        position: 'absolute',
        top: 'calc(100% + 6px)',
        left: 0,
        minWidth: 175,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="tual-popover-header">{t('shapeType')}</div>
      <div className="tual-variant-grid">
        {shapeVariants.map((s) => {
          const label = t(s, undefined, s.charAt(0).toUpperCase() + s.slice(1))
          return (
            <button
              key={s}
              type="button"
              className="tual-btn tual-variant-item"
              data-active={controller.tool === 'shape' && controller.variant === s}
              onClick={() => {
                controller.setTool('shape', s)
                onClose()
              }}
            >
              <span className="tual-variant-icon">{SHAPE_ICONS[s]?.()}</span>
              <span className="tual-variant-label">{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
