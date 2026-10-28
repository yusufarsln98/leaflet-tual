'use client'

import { useRef, useState } from 'react'
import type L from 'leaflet'
import type { ColorName, Style } from '../../../../core/index.js'
import { useOutsideDismiss } from '../../../ui/index.js'
import { ColorDropdown } from '../../SecondaryTooltip/color/ColorDropdown.js'

export interface ColorFieldRowProps {
  map?: L.Map
  label: string
  title: string
  mode: 'stroke' | 'fill'
  currentColor: ColorName | string
  currentFill?: Style['fill']
  scheme: 'light' | 'dark'
  colorHex: string
  value?: string
  noFill?: boolean
  onSelectColor: (color: ColorName | string) => void
  onSelectFillMode?: (fill: NonNullable<Style['fill']>) => void
}

/**
 * A labelled color swatch row with its own dropdown and outside-click
 * dismissal. Shared by every item type in the style sidebar so notes and
 * shapes use the exact same control interface.
 */
export function ColorFieldRow({
  map,
  label,
  title,
  mode,
  currentColor,
  currentFill,
  scheme,
  colorHex,
  value,
  noFill = false,
  onSelectColor,
  onSelectFillMode,
}: ColorFieldRowProps) {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useOutsideDismiss(rootRef, isOpen, () => setIsOpen(false))

  return (
    <div className="tual-sidebar-prop-row">
      <span className="tual-sidebar-prop-label">{label}</span>
      <div
        ref={rootRef}
        className="tual-sidebar-prop-control"
        style={{ position: 'relative' }}
      >
        <button
          type="button"
          className="tual-sidebar-color-field"
          title={title}
          onClick={() => setIsOpen((open) => !open)}
        >
          <span
            className={noFill ? 'tual-no-fill-swatch' : 'tual-sidebar-color-swatch'}
            style={noFill ? undefined : { backgroundColor: colorHex }}
          />
          <span className="tual-sidebar-color-hex">
            {value ?? colorHex.toUpperCase()}
          </span>
        </button>
        {isOpen && (
          <div className="tual-sidebar-popover-anchor">
            <ColorDropdown
              map={map}
              title={title}
              mode={mode}
              currentColor={currentColor}
              currentFill={currentFill}
              scheme={scheme}
              onSelectColor={onSelectColor}
              onSelectFillMode={onSelectFillMode}
              onClose={() => setIsOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
