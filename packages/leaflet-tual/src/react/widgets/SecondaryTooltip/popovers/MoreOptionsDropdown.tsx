'use client'

import { ICONS } from '../../Toolbar/icons/index.js'
import { useWheelGuard } from '../utils/use-wheel-guard.js'

export interface MoreOptionsDropdownProps {
  onDuplicate: () => void
  onDelete: () => void
  onFitInView?: () => void
  onClose?: () => void
}

export function MoreOptionsDropdown({
  onDuplicate,
  onDelete,
  onFitInView,
}: MoreOptionsDropdownProps) {
  const guardRef = useWheelGuard<HTMLDivElement>()

  return (
    <div
      ref={guardRef}
      className="tual-popover tual-options-popover"
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="tual-options-list">
        <button type="button" className="tual-option-row" onClick={onDuplicate}>
          {ICONS.copy ? ICONS.copy() : <span>⧉</span>}
          <span className="tual-option-label">Duplicate</span>
        </button>

        {onFitInView && (
          <button type="button" className="tual-option-row" onClick={onFitInView}>
            <span>⛶</span>
            <span className="tual-option-label">Fit in View</span>
          </button>
        )}

        <div className="tual-popover-divider" />

        <button
          type="button"
          className="tual-option-row tual-option-danger"
          onClick={onDelete}
        >
          {ICONS.trash ? ICONS.trash() : <span>🗑</span>}
          <span className="tual-option-label">Delete</span>
        </button>
      </div>
    </div>
  )
}

