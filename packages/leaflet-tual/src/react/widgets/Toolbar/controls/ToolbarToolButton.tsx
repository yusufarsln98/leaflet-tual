'use client'

import type { ReactNode } from 'react'

export interface ToolbarToolButtonProps {
  label: string
  icon: ReactNode
  isActive: boolean
  hasVariants?: boolean
  isPopoverOpen?: boolean
  disabled?: boolean
  chevronLabel?: string
  chevronTitle?: string
  children?: ReactNode
  onSelect: () => void
  onToggleVariants?: () => void
}

/**
 * A single square toolbar control. Tools with variants get a small,
 * non-intrusive corner affordance instead of a second full-width button.
 */
export function ToolbarToolButton({
  label,
  icon,
  isActive,
  hasVariants,
  isPopoverOpen,
  disabled,
  chevronLabel,
  chevronTitle,
  children,
  onSelect,
  onToggleVariants,
}: ToolbarToolButtonProps) {
  return (
    <div
      className="tual-tool"
      data-active={isActive || undefined}
      data-has-variants={hasVariants || undefined}
    >
      <button
        type="button"
        className="tual-btn"
        data-active={isActive}
        title={label}
        aria-label={label}
        disabled={disabled}
        onClick={onSelect}
      >
        {icon}
      </button>

      {hasVariants && (
        <button
          type="button"
          className="tual-btn-variants"
          data-open={isPopoverOpen || undefined}
          aria-expanded={isPopoverOpen}
          aria-haspopup="true"
          aria-label={chevronLabel ?? `${label} options`}
          title={chevronTitle}
          onClick={(e) => {
            e.stopPropagation()
            onToggleVariants?.()
          }}
        />
      )}

      {children}
    </div>
  )
}
