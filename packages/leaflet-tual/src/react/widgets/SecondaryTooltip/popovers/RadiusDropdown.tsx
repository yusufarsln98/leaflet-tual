'use client'

import { useWheelGuard } from '../utils/use-wheel-guard.js'

export interface RadiusDropdownProps {
  currentRadius?: number
  onSelectRadius: (r: number) => void
  onClose?: () => void
}

const RADII = [
  { val: 0, label: '0px' },
  { val: 8, label: '8px' },
  { val: 16, label: '16px' },
]

export function RadiusDropdown({ currentRadius = 8, onSelectRadius }: RadiusDropdownProps) {
  const guardRef = useWheelGuard<HTMLDivElement>()

  return (
    <div
      ref={guardRef}
      className="tual-popover tual-radius-popover"
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {RADII.map((r) => {
        const isSelected = (currentRadius ?? 8) === r.val
        return (
          <button
            key={r.val}
            type="button"
            className="tual-btn tual-radius-btn"
            data-active={isSelected}
            onClick={() => onSelectRadius(r.val)}
          >
            {r.label}
          </button>
        )
      })}
    </div>
  )
}
