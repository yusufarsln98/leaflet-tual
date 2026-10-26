'use client'

import { ICONS } from '../icons/index.js'
import type { ButtonProps, ButtonVariant } from './types.js'

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  toolbar: 'tual-btn',
  'secondary-icon': 'tual-secondary-icon-btn',
  'secondary-pill': 'tual-secondary-pill-btn',
  swatch: 'tual-secondary-swatch-btn',
  'popover-action': 'tual-popover-action-btn',
  'style-toggle': 'tual-typo-style-btn',
  radius: 'tual-btn tual-radius-btn',
}

export function Button({
  variant = 'toolbar',
  active,
  hasVariants,
  chevron,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = [VARIANT_CLASS[variant], className ?? ''].filter(Boolean).join(' ')

  return (
    <button
      type={type}
      className={classes}
      data-active={active}
      data-has-variants={hasVariants || undefined}
      {...rest}
    >
      {children}
      {hasVariants && (
        <span className="tual-btn-chevron">{chevron ?? ICONS.chevronDown()}</span>
      )}
    </button>
  )
}

