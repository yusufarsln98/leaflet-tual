'use client'

import { useRef, useState } from 'react'
import type L from 'leaflet'
import { PropertyRow, useOutsideDismiss } from '../../../ui/index.js'
import { ColorDropdown } from '../../SecondaryTooltip/color/ColorDropdown.js'

export interface ColorFieldRowProps {
  map?: L.Map
  label: string
  title: string
  currentColor: string
  currentOpacity?: number
  colorHex: string
  value?: string
  noFill?: boolean
  allowNoFill?: boolean
  onSelectColor: (hex: string, opacity?: number) => void
  onSelectNoFill?: () => void
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
  currentColor,
  currentOpacity,
  colorHex,
  value,
  noFill = false,
  allowNoFill = false,
  onSelectColor,
  onSelectNoFill,
}: ColorFieldRowProps) {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useOutsideDismiss(rootRef, isOpen, () => setIsOpen(false))

  return (
    <PropertyRow label={label}>
      <div ref={rootRef} style={{ position: 'relative', width: '100%' }}>
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
          <span className="tual-sidebar-color-hex">{value ?? colorHex.toUpperCase()}</span>
        </button>
        {isOpen && (
          <div className="tual-sidebar-popover-anchor">
            <ColorDropdown
              map={map}
              title={title}
              currentColor={currentColor}
              currentOpacity={currentOpacity}
              allowNoFill={allowNoFill}
              noFillSelected={noFill}
              onSelectColor={onSelectColor}
              onSelectNoFill={onSelectNoFill}
              onClose={() => setIsOpen(false)}
            />
          </div>
        )}
      </div>
    </PropertyRow>
  )
}
