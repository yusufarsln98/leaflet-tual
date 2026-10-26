'use client'

import { ICONS } from '../Toolbar/icons.js'

export interface MoreOptionsDropdownProps {
  onDuplicate: () => void
  onDelete: () => void
  onFitInView?: () => void
  onClose: () => void
}

export function MoreOptionsDropdown({
  onDuplicate,
  onDelete,
  onFitInView,
}: MoreOptionsDropdownProps) {
  return (
    <div className="tual-popover tual-options-popover" onMouseDown={(e) => e.stopPropagation()}>
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

