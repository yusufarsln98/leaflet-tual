'use client'

import type { Style } from '../../../../core/types/index.js'

export interface DashDropdownProps {
  currentDash?: Style['dash']
  onSelectDash: (d: NonNullable<Style['dash']>) => void
  onClose: () => void
}

const DASH_STYLES: { id: NonNullable<Style['dash']>; label: string; dasharray?: string }[] = [
  { id: 'solid', label: 'Solid' },
  { id: 'dashed', label: 'Dashed', dasharray: '4 4' },
  { id: 'dotted', label: 'Dotted', dasharray: '2 3' },
]

export function DashDropdown({ currentDash = 'solid', onSelectDash }: DashDropdownProps) {
  return (
    <div className="tual-popover tual-options-popover" onMouseDown={(e) => e.stopPropagation()}>
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

