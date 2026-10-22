import React from 'react'
import type {
  CanvasIcons,
  CanvasLabels,
  LeafletCanvasClassNames,
  LeafletCanvasStyles,
  ShapeKind,
  ToolbarOrientation,
  ToolbarPosition,
} from '../../types/index.js'
import { DEFAULT_ICONS } from './icons.js'
import type { ShapeOption } from './types.js'
import { getDropdownChevronRotation } from './utils.js'
import { getPopupPlacementStyle } from './toolbar-helpers.js'
import { ShapesModalGrid } from './ShapesModalGrid.js'

export interface ShapesModalProps {
  isOpen: boolean
  readOnly: boolean
  isShapeToolActive: boolean
  activeShape: ShapeKind
  shapeOptions: readonly ShapeOption[]
  shapesGroupLabel: string
  currentShapeIcon: React.ReactNode
  showToolLabels?: boolean
  labels?: CanvasLabels
  icons?: CanvasIcons
  unstyled?: boolean
  classNames?: LeafletCanvasClassNames
  styles?: LeafletCanvasStyles
  position?: ToolbarPosition
  orientation?: ToolbarOrientation
  shapesGroupRef: React.RefObject<HTMLDivElement | null>
  getButtonClassName: (isActive: boolean) => string
  getButtonStyle: (isActive: boolean) => React.CSSProperties
  onToggle: () => void
  onSelectShape: (kind: ShapeKind) => void
}

export function ShapesModal({
  isOpen,
  readOnly,
  isShapeToolActive,
  activeShape,
  shapeOptions,
  shapesGroupLabel,
  currentShapeIcon,
  showToolLabels,
  labels,
  icons,
  unstyled,
  classNames,
  styles,
  position = 'top-center',
  orientation = 'horizontal',
  shapesGroupRef,
  getButtonClassName,
  getButtonStyle,
  onToggle,
  onSelectShape,
}: ShapesModalProps) {
  const isVertical = orientation === 'vertical'
  const popupPlacementStyle = getPopupPlacementStyle(position, orientation)
  const chevronRotation = getDropdownChevronRotation(isOpen, position, orientation)
  const chevronIcon = icons?.dropdownChevron ?? DEFAULT_ICONS.dropdownChevron

  return (
    <div
      ref={shapesGroupRef}
      className={['rlc-shapes-group', classNames?.shapesGroupWrapper].filter(Boolean).join(' ')}
      style={{
        position: 'relative',
        display: isVertical ? 'flex' : 'inline-flex',
        width: isVertical ? (showToolLabels ? '100%' : '30px') : 'auto',
        height: isVertical ? (showToolLabels ? 'auto' : '30px') : 'auto',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        ...styles?.shapesGroupWrapper,
      }}
    >
      <button
        type="button"
        disabled={readOnly}
        aria-disabled={readOnly || undefined}
        aria-pressed={isShapeToolActive}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        data-tool="shape-group"
        data-active={isShapeToolActive || undefined}
        title={`${shapesGroupLabel} — open shapes modal`}
        className={getButtonClassName(isShapeToolActive)}
        onClick={onToggle}
        style={getButtonStyle(isShapeToolActive)}
      >
        {isVertical && showToolLabels ? (
          <>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px' }}>
              {currentShapeIcon}
            </span>
            <span style={{ whiteSpace: 'nowrap' }}>{shapesGroupLabel}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', opacity: 0.9, transform: chevronRotation, transition: 'transform 0.15s ease' }}>
              {chevronIcon}
            </span>
          </>
        ) : (
          <>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: showToolLabels ? '6px' : '0px',
                ...(isVertical && !showToolLabels ? { transform: 'translate(-1px, -1px)' } : undefined),
              }}
            >
              {currentShapeIcon}
              {showToolLabels && <span>{shapesGroupLabel}</span>}
            </span>
            <span
              aria-hidden="true"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.85,
                ...(isVertical && !showToolLabels
                  ? {
                      position: 'absolute',
                      right: '2px',
                      bottom: '2px',
                      width: '8px',
                      height: '8px',
                      lineHeight: 0,
                      pointerEvents: 'none',
                    }
                  : { marginLeft: showToolLabels ? '6px' : '2px' }),
                transform: isVertical && !showToolLabels
                  ? (isOpen ? 'rotate(180deg)' : 'rotate(0deg)')
                  : chevronRotation,
                transition: 'transform 0.15s ease',
              }}
            >
              {isVertical && !showToolLabels && React.isValidElement(chevronIcon)
                ? React.cloneElement(chevronIcon as React.ReactElement<any>, {
                    width: '100%',
                    height: '100%',
                    style: {
                      width: '100%',
                      height: '100%',
                      display: 'block',
                      ...((chevronIcon as React.ReactElement<any>).props?.style ?? {}),
                    },
                  })
                : chevronIcon}
            </span>
          </>
        )}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label={labels?.shapesModalTitle ?? 'Select a Shape'}
          className={['rlc-shapes-modal', classNames?.shapesModal].filter(Boolean).join(' ')}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.stopPropagation()
              onToggle()
            }
          }}
          style={{
            position: 'absolute',
            zIndex: 1020,
            ...popupPlacementStyle,
            ...(unstyled
              ? {}
              : {
                  width: '240px',
                  maxWidth: 'calc(100vw - 24px)',
                  maxHeight: 'calc(100vh - 80px)',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  padding: '4px',
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #767676',
                  borderRadius: '2px',
                  boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.25)',
                  color: 'inherit',
                  boxSizing: 'border-box',
                }),
            ...styles?.shapesModal,
          }}
        >
          {labels?.shapesModalTitle && (
            <div
              className={['rlc-shapes-modal-header', classNames?.shapesModalHeader].filter(Boolean).join(' ')}
              style={{
                ...(unstyled
                  ? {}
                  : {
                      padding: '2px 4px 4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      color: '#000000',
                      textTransform: 'uppercase',
                      borderBottom: '1px solid #767676',
                      marginBottom: '4px',
                    }),
                ...styles?.shapesModalHeader,
              }}
            >
              {labels.shapesModalTitle}
            </div>
          )}

          <ShapesModalGrid
            shapeOptions={shapeOptions}
            activeShape={activeShape}
            isShapeToolActive={isShapeToolActive}
            unstyled={unstyled}
            classNames={classNames}
            styles={styles}
            onSelectShape={onSelectShape}
          />
        </div>
      )}
    </div>
  )
}
