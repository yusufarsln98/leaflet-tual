'use client'

import { useWheelGuard } from './use-wheel-guard.js'

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
      className="tual-popover"
      style={{
        bottom: 'calc(100% + 8px)',
        top: 'auto',
        left: 0,
        padding: 3,
        display: 'flex',
        gap: 3,
        borderRadius: 8,
        backgroundColor: 'var(--tual-surface)',
        border: '1px solid var(--tual-border)',
        boxShadow: '0 8px 20px -4px rgba(0,0,0,0.12)',
      }}
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
            className="tual-btn"
            style={{
              padding: '3px 8px',
              fontSize: 11,
              fontWeight: isSelected ? 600 : 400,
              backgroundColor: isSelected ? 'var(--tual-surface-hover)' : 'transparent',
              color: 'var(--tual-text)',
              borderRadius: 6,
              border: isSelected ? '1px solid var(--tual-border)' : '1px solid transparent',
              cursor: 'pointer',
            }}
            onClick={() => onSelectRadius(r.val)}
          >
            {r.label}
          </button>
        )
      })}
    </div>
  )
}
