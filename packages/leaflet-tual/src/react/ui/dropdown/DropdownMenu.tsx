'use client'

import type { DropdownItemProps, DropdownMenuProps } from './types.js'

const LAYOUT_CLASSES: Record<NonNullable<DropdownMenuProps['layout']>, string> = {
  list: 'tual-options-list',
  'variant-list': 'tual-variant-list',
  'variant-grid': 'tual-variant-grid',
  'typo-list': 'tual-typo-list',
  'action-menu': 'tual-page-action-menu',
}

export function DropdownMenu({ children, layout = 'list', className }: DropdownMenuProps) {
  const classes = [LAYOUT_CLASSES[layout], className ?? ''].filter(Boolean).join(' ')
  return <div className={classes}>{children}</div>
}

export function DropdownItem({
  leading,
  label,
  meta,
  selected = false,
  danger = false,
  disabled = false,
  variant = 'option',
  title,
  onClick,
}: DropdownItemProps) {
  if (variant === 'action-menu') {
    const cls = ['tual-action-menu-item', danger ? 'tual-action-menu-item-danger' : '']
      .filter(Boolean)
      .join(' ')
    return (
      <button type="button" className={cls} title={title} disabled={disabled} onClick={onClick}>
        {label}
      </button>
    )
  }

  if (variant === 'variant') {
    return (
      <button
        type="button"
        className="tual-btn tual-variant-item"
        data-active={selected}
        title={title}
        disabled={disabled}
        onClick={onClick}
      >
        {leading && <span className="tual-variant-icon">{leading}</span>}
        <span className="tual-variant-label">{label}</span>
      </button>
    )
  }

  if (variant === 'typo') {
    return (
      <button
        type="button"
        className="tual-typo-row"
        data-selected={selected}
        title={title}
        disabled={disabled}
        onClick={onClick}
      >
        <div className="tual-typo-row-label">
          <span className="tual-typo-name">{label}</span>
          {meta && <span className="tual-typo-px">{meta}</span>}
        </div>
        {selected && (
          <span className="tual-typo-check">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        )}
      </button>
    )
  }

  const classes = ['tual-option-row', danger ? 'tual-option-danger' : ''].filter(Boolean).join(' ')

  return (
    <button
      type="button"
      className={classes}
      data-active={selected}
      title={title}
      disabled={disabled}
      onClick={onClick}
    >
      {leading}
      <span className="tual-option-label">{label}</span>
      {meta && <span className="tual-option-meta">{meta}</span>}
      {selected && <span className="tual-check">✓</span>}
    </button>
  )
}
