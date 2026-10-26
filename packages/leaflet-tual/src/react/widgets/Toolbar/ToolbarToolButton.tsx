'use client'

import type { ReactNode } from 'react'
import { ICONS } from './icons.js'

export interface ToolbarToolButtonProps {
  label: string
  icon: ReactNode
  isActive: boolean
  hasVariants: boolean
  onSelect: () => void
}

export function ToolbarToolButton({
  label,
  icon,
  isActive,
  hasVariants,
  onSelect,
}: ToolbarToolButtonProps) {
  return (
    <button
      type="button"
      className="tual-btn"
      data-active={isActive}
      data-has-variants={hasVariants || undefined}
      title={label}
      onClick={onSelect}
    >
      {icon}
      {hasVariants && <span className="tual-btn-chevron">{ICONS.chevronDown()}</span>}
    </button>
  )
}
