'use client'

import type { ColorName, Style } from '../../../../core/types/index.js'
import { resolveColor } from '../../../../core/index.js'
import { useWheelGuard } from '../utils/use-wheel-guard.js'

export interface BorderDropdownProps {
  scheme: 'light' | 'dark'
  currentDash?: Style['dash']
  currentColor?: string
  onSelectDash: (d: NonNullable<Style['dash']>) => void
  onSelectColor: (c: ColorName) => void
  onClose: () => void
}

const DASH_STYLES: { id: NonNullable<Style['dash']>; label: string; dasharray?: string }[] = [
  { id: 'solid', label: 'Solid' },
  { id: 'dashed', label: 'Dashed', dasharray: '4 4' },
  { id: 'dotted', label: 'Dotted', dasharray: '2 3' },
]

/** Theme palette only — custom hex stays in the Color dropdown. */
const BORDER_COLORS: ColorName[] = [
  'ink',
  'gray',
  'taupe',
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple',
  'pink',
]

export function BorderDropdown({
  scheme,
  currentDash = 'solid',
  currentColor,
  onSelectDash,
  onSelectColor,
}: BorderDropdownProps) {
  const guardRef = useWheelGuard<HTMLDivElement>()

  return (
    <div
      ref={guardRef}
      className="tual-popover tual-options-popover tual-border-popover"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="tual-popover-header">Border Color</div>
      <div className="tual-border-color-row">
        {BORDER_COLORS.map((c) => {
          const hex = resolveColor(c, scheme)
          const isSelected = currentColor === c
          return (
            <button
              key={c}
              type="button"
              className="tual-border-swatch"
              data-active={isSelected || undefined}
              style={{ backgroundColor: hex }}
              title={c.charAt(0).toUpperCase() + c.slice(1)}
              aria-label={c}
              onClick={() => onSelectColor(c)}
            />
          )
        })}
      </div>

      <div className="tual-popover-divider" />

      <div className="tual-popover-header">Border Style</div>
      <div className="tual-options-list">
        {DASH_STYLES.map((d) => {
          const isSelected = currentDash === d.id
          return (
            <button
              key={d.id}
              type="button"
              className="tual-option-row"
              data-active={isSelected}
              onClick={() => onSelectDash(d.id)}
            >
              <svg width="28" height="6" style={{ overflow: 'visible' }}>
                <line
                  x1="0"
                  y1="3"
                  x2="28"
                  y2="3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={d.dasharray}
                />
              </svg>
              <span className="tual-option-label">{d.label}</span>
              {isSelected && <span className="tual-check">✓</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
