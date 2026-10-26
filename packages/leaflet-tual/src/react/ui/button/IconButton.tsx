'use client'

import { Button } from './Button.js'
import type { IconButtonProps } from './types.js'

export function IconButton({
  icon,
  label,
  title,
  'aria-label': ariaLabel,
  ...rest
}: IconButtonProps) {
  return (
    <Button
      title={title ?? label}
      aria-label={ariaLabel ?? label}
      {...rest}
    >
      {icon}
    </Button>
  )
}

