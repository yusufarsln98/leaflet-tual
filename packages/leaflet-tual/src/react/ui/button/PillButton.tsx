'use client'

import type { PillButtonProps } from './types.js'

const PILL_VARIANT_CLASS: Record<NonNullable<PillButtonProps['variant']>, string> = {
  page: 'tual-page-pill',
  secondary: 'tual-secondary-pill-btn',
  'border-color': 'tual-border-color-pill',
  zoom: 'tual-btn tual-zoom-pill',
}

export function PillButton({
  variant = 'secondary',
  active,
  leading,
  label,
  trailing,
  className,
  type = 'button',
  ...rest
}: PillButtonProps) {
  const classes = [PILL_VARIANT_CLASS[variant], className ?? ''].filter(Boolean).join(' ')

  return (
    <button
      type={type}
      className={classes}
      data-active={active}
      {...rest}
    >
      {leading}
      {label}
      {trailing}
    </button>
  )
}

