'use client'

import type { ArrowKind, Controller, DrawKind, ShapeKind } from '../../../../core/index.js'
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
  if (type === 'arrow') {
    const variants = allowedArrowVariants ?? ALL_ARROW_KINDS
    return (
      <div
        className={`tual-popover ${className ?? ''}`}
        style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          minWidth: 120,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tual-popover-header">Arrow Style</div>
        <div className="tual-variant-list">
          {variants.map((v) => (
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
              <span className="tual-variant-label">{v.charAt(0).toUpperCase() + v.slice(1)}</span>
            </button>
          ))}
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
          minWidth: 150,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tual-popover-header">Draw</div>
        <div className="tual-variant-list">
          {variants.map((variant) => (
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
              <span className="tual-variant-label">{DRAW_LABELS[variant]}</span>
            </button>
          ))}
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
        minWidth: 220,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="tual-popover-header">Shape Type</div>
      <div className="tual-variant-grid">
        {shapeVariants.map((s) => (
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
            <span className="tual-variant-label">{s.charAt(0).toUpperCase() + s.slice(1)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
