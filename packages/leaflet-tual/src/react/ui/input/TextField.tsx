'use client'

import type { TextFieldProps } from './types.js'

export function TextField({
  value,
  onChange,
  className = 'tual-page-rename-input',
  onKeyDown,
  ...rest
}: TextFieldProps) {
  return (
    <input
      type="text"
      className={className}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        e.stopPropagation()
        onKeyDown?.(e)
      }}
      {...rest}
    />
  )
}

