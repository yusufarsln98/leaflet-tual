'use client'

import type { ReactNode } from 'react'
import { Button, ICONS } from '../../../ui/index.js'

export interface ToolbarToolButtonProps {
  label: string
  icon: ReactNode
  isActive: boolean
  hasVariants?: boolean
  isPopoverOpen?: boolean
  chevronLabel?: string
  chevronTitle?: string
  onSelect: () => void
  onToggleVariants?: () => void
}

export function ToolbarToolButton({
  label,
  icon,
  isActive,
  hasVariants,
  isPopoverOpen,
  chevronLabel,
  chevronTitle,
  onSelect,
  onToggleVariants,
}: ToolbarToolButtonProps) {
  if (!hasVariants) {
    return (
      <Button
        variant="toolbar"
        active={isActive}
        title={label}
        aria-label={label}
        onClick={onSelect}
      >
        {icon}
      </Button>
    )
  }

  return (
    <>
      <Button
        variant="toolbar"
        active={isActive}
        title={label}
        aria-label={label}
        onClick={onSelect}
      >
        {icon}
      </Button>
      <button
        type="button"
        className="tual-btn tual-chevron-btn"
        data-open={isPopoverOpen || undefined}
        aria-expanded={isPopoverOpen}
        aria-haspopup="true"
        aria-label={chevronLabel ?? `${label} options`}
        title={chevronTitle}
        onClick={(e) => {
          e.stopPropagation()
          if (onToggleVariants) {
            onToggleVariants()
          } else {
            onSelect()
          }
        }}
      >
        <span className="tual-btn-chevron">{ICONS.chevronDown(14)}</span>
      </button>
    </>
  )
}

