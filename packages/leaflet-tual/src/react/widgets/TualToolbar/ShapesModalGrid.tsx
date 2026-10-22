import React from 'react'
import type {
  LeafletTualClassNames,
  LeafletTualStyles,
  ShapeKind,
} from '../../types/index.js'
import type { ShapeOption } from './types.js'

export interface ShapesModalGridProps {
  shapeOptions: readonly ShapeOption[]
  activeShape: ShapeKind
  isShapeToolActive: boolean
  unstyled?: boolean
  classNames?: LeafletTualClassNames
  styles?: LeafletTualStyles
  onSelectShape: (kind: ShapeKind) => void
}

export function ShapesModalGrid({
  shapeOptions,
  activeShape,
  isShapeToolActive,
  unstyled,
  classNames,
  styles,
  onSelectShape,
}: ShapesModalGridProps) {
  const [hoveredKind, setHoveredKind] = React.useState<string | null>(null)

  return (
    <div
      className={['rlc-shapes-modal-grid', classNames?.shapesModalGrid].filter(Boolean).join(' ')}
      style={{
        ...(unstyled
          ? {}
          : {
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '4px',
              width: '100%',
              boxSizing: 'border-box',
            }),
        ...styles?.shapesModalGrid,
      }}
    >
      {shapeOptions.map((shapeOpt) => {
        const isSelectedShape = isShapeToolActive && activeShape === shapeOpt.kind
        const isHovered = hoveredKind === shapeOpt.kind
        return (
          <button
            key={shapeOpt.kind}
            type="button"
            data-shape={shapeOpt.kind}
            data-active={isSelectedShape || undefined}
            className={[
              'rlc-shapes-modal-item',
              classNames?.shapesModalItem,
              isSelectedShape ? classNames?.shapesModalItemActive : undefined,
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onSelectShape(shapeOpt.kind)}
            onPointerEnter={() => setHoveredKind(shapeOpt.kind)}
            onPointerLeave={() => setHoveredKind(null)}
            style={{
              ...(unstyled
                ? {}
                : {
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    minWidth: 0,
                    padding: '6px 8px',
                    borderRadius: '2px',
                    border: isSelectedShape ? '1px solid #4f4f4f' : '1px solid #767676',
                    boxSizing: 'border-box',
                    backgroundColor: isSelectedShape ? '#e0e0e0' : isHovered ? '#e8e8e8' : '#efefef',
                    color: '#000000',
                    fontSize: '12px',
                    fontWeight: isSelectedShape ? 600 : 'normal',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.1s ease',
                    boxShadow: isSelectedShape ? 'inset 1px 1px 2px rgba(0, 0, 0, 0.2)' : 'none',
                  }),
              ...styles?.shapesModalItem,
              ...(isSelectedShape ? styles?.shapesModalItemActive : undefined),
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, width: '18px', height: '18px' }}>
              {shapeOpt.icon}
            </span>
            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>
              {shapeOpt.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

