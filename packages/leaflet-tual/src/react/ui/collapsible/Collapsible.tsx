'use client'

import { useState } from 'react'
import { ICONS } from '../icons/index.js'
import type { CollapsibleProps } from './types.js'

export function Collapsible({
  title,
  defaultOpen = true,
  open: controlledOpen,
  onOpenChange,
  className,
  headerClassName,
  contentClassName,
  children,
}: CollapsibleProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen

  const handleToggle = () => {
    const next = !isOpen
    setInternalOpen(next)
    onOpenChange?.(next)
  }

  return (
    <div
      className={`tual-collapsible ${className ?? ''}`}
      data-open={isOpen}
    >
      <button
        type="button"
        className={`tual-collapsible-header ${headerClassName ?? ''}`}
        aria-expanded={isOpen}
        onClick={handleToggle}
      >
        <span className="tual-collapsible-title">{title}</span>
        <span className="tual-collapsible-chevron">
          {isOpen ? ICONS.chevronDown() : ICONS.chevronRight()}
        </span>
      </button>

      {isOpen && (
        <div className={`tual-collapsible-content ${contentClassName ?? ''}`}>
          {children}
        </div>
      )}
    </div>
  )
}

