import React from 'react'
import type {
  TualIcons,
  TualLabels,
  LeafletTualClassNames,
  LeafletTualStyles,
  ToolbarOrientation,
  ToolbarPosition,
} from '../../types/index.js'
import { DEFAULT_ICONS } from './icons.js'
import type { ArrowOption, ArrowToolId } from './types.js'
import { getDropdownChevronRotation } from './utils.js'
import { getPopupPlacementStyle } from './toolbar-helpers.js'

export interface ArrowDropdownProps {
  isOpen: boolean
  readOnly: boolean
  isArrowToolActive: boolean
  activeTool: string
  arrowOptions: readonly ArrowOption[]
  arrowGroupLabel: string
  currentArrowIcon: React.ReactNode
  showToolLabels?: boolean
  labels?: TualLabels
  icons?: TualIcons
  unstyled?: boolean
  classNames?: LeafletTualClassNames
  styles?: LeafletTualStyles
  position?: ToolbarPosition
  orientation?: ToolbarOrientation
  arrowGroupRef: React.RefObject<HTMLDivElement | null>
  getButtonClassName: (isActive: boolean) => string
  getButtonStyle: (isActive: boolean) => React.CSSProperties
  onToggle: () => void
  onSelectOption: (id: ArrowToolId) => void
}

export function ArrowDropdown({
  isOpen,
  readOnly,
  isArrowToolActive,
  activeTool,
  arrowOptions,
  arrowGroupLabel,
  currentArrowIcon,
  showToolLabels,
  icons,
  unstyled,
  classNames,
  styles,
  position = 'top-center',
  orientation = 'horizontal',
  arrowGroupRef,
  getButtonClassName,
  getButtonStyle,
  onToggle,
  onSelectOption,
}: ArrowDropdownProps) {
  const [hoveredOption, setHoveredOption] = React.useState<string | null>(null)
  const isVertical = orientation === 'vertical'
  const popupPlacementStyle = getPopupPlacementStyle(position, orientation)
  const chevronRotation = getDropdownChevronRotation(isOpen, position, orientation)
  const chevronIcon = icons?.dropdownChevron ?? DEFAULT_ICONS.dropdownChevron

  return (
    <div
      ref={arrowGroupRef}
      className={['rlc-arrow-group', classNames?.arrowGroupWrapper].filter(Boolean).join(' ')}
      style={{
        position: 'relative',
        display: isVertical ? 'flex' : 'inline-flex',
        width: isVertical ? (showToolLabels ? '100%' : '30px') : 'auto',
        height: isVertical ? (showToolLabels ? 'auto' : '30px') : 'auto',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        ...styles?.arrowGroupWrapper,
      }}
    >
      <button
        type="button"
        disabled={readOnly}
        aria-disabled={readOnly || undefined}
        aria-pressed={isArrowToolActive}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        data-tool="arrow-group"
        data-active={isArrowToolActive || undefined}
        title={`${arrowGroupLabel} — click to choose arrow type`}
        className={getButtonClassName(isArrowToolActive)}
        onClick={onToggle}
        style={getButtonStyle(isArrowToolActive)}
      >
        {isVertical && showToolLabels ? (
          <>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px' }}>
              {currentArrowIcon}
            </span>
            <span style={{ whiteSpace: 'nowrap' }}>{arrowGroupLabel}</span>
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
              {currentArrowIcon}
              {showToolLabels && <span>{arrowGroupLabel}</span>}
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
          role="menu"
          aria-label="Arrow type options"
          className={['rlc-arrow-dropdown', classNames?.arrowDropdownMenu].filter(Boolean).join(' ')}
          style={{
            position: 'absolute',
            zIndex: 1020,
            ...popupPlacementStyle,
            ...(unstyled
              ? {}
              : {
                  minWidth: '190px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  padding: '4px',
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #767676',
                  borderRadius: '2px',
                  boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.25)',
                  color: 'inherit',
                  boxSizing: 'border-box',
                }),
            ...styles?.arrowDropdownMenu,
          }}
        >
          {arrowOptions.map((option) => {
            const isOptionActive = activeTool === option.id
            const isHovered = hoveredOption === option.id
            return (
              <button
                key={option.id}
                type="button"
                role="menuitemradio"
                aria-checked={isOptionActive}
                data-tool={option.id}
                data-active={isOptionActive || undefined}
                className={[
                  'rlc-arrow-dropdown-item',
                  classNames?.arrowDropdownItem,
                  isOptionActive ? classNames?.arrowDropdownItemActive : undefined,
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onSelectOption(option.id)}
                onPointerEnter={() => setHoveredOption(option.id)}
                onPointerLeave={() => setHoveredOption(null)}
                style={{
                  ...(unstyled
                    ? {}
                    : {
                        display: 'grid',
                        gridTemplateColumns: '20px 1fr auto',
                        alignItems: 'center',
                        columnGap: '10px',
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: '2px',
                        border: isOptionActive ? '1px solid #4f4f4f' : '1px solid #767676',
                        boxSizing: 'border-box',
                        backgroundColor: isOptionActive ? '#e0e0e0' : isHovered ? '#e8e8e8' : '#efefef',
                        color: 'inherit',
                        fontSize: '12px',
                        fontWeight: 'normal',
                        cursor: 'pointer',
                        textAlign: 'left',
                        boxShadow: isOptionActive ? 'inset 1px 1px 2px rgba(0, 0, 0, 0.2)' : 'none',
                      }),
                  ...styles?.arrowDropdownItem,
                  ...(isOptionActive ? styles?.arrowDropdownItemActive : undefined),
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px' }}>
                  {option.icon}
                </span>
                <span style={{ whiteSpace: 'nowrap' }}>{option.label}</span>
                <span style={{ fontSize: '11px', opacity: isOptionActive ? 0.9 : 0.65, fontWeight: 500 }}>
                  {option.shortcut}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
