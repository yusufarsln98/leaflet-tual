'use client'

import type { LabelPosition } from '../../../../core/types/index.js'
import { LABEL_POSITION_ICONS } from '../../Toolbar/icons/index.js'
import { useWheelGuard } from '../utils/use-wheel-guard.js'

export interface LabelPositionDropdownProps {
  currentPosition?: LabelPosition
  onSelectPosition: (p: LabelPosition) => void
  onClose: () => void
}

const POSITIONS: { id: LabelPosition; label: string }[] = [
  { id: 'top', label: 'Top' },
  { id: 'center', label: 'Center' },
  { id: 'bottom', label: 'Bottom' },
]

export function LabelPositionDropdown({
  currentPosition = 'center',
  onSelectPosition,
}: LabelPositionDropdownProps) {
  const guardRef = useWheelGuard<HTMLDivElement>()

  return (
    <div
      ref={guardRef}
      className="tual-popover tual-options-popover"
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="tual-popover-header">Label Position</div>
      <div className="tual-options-list">
        {POSITIONS.map((p) => {
          const isSelected = currentPosition === p.id
          return (
            <button
              key={p.id}
              type="button"
              className="tual-option-row"
              data-active={isSelected}
              onClick={() => onSelectPosition(p.id)}
            >
              {LABEL_POSITION_ICONS[p.id]()}
              <span className="tual-option-label">{p.label}</span>
              {isSelected && <span className="tual-check">✓</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
