'use client'

import type { NumberFieldProps } from './types.js'

export function NumberField({
  value,
  onChange,
  unit,
  wrapperClassName = 'tual-typo-field tual-typo-size-field',
  unitClassName = 'tual-typo-field-unit',
  className = 'tual-typo-input',
  ...rest
}: NumberFieldProps) {
  return (
    <div className={wrapperClassName}>
      <input
        type="number"
        value={value}
        className={className}
        onChange={(e) => {
          const parsed = parseInt(e.target.value, 10)
          if (!isNaN(parsed)) onChange(parsed)
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        {...rest}
      />
      {unit && <span className={unitClassName}>{unit}</span>}
    </div>
  )
}

