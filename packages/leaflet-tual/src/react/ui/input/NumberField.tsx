'use client'

import type { NumberFieldProps } from './types.js'

export function NumberField({
  value,
  onChange,
  unit,
  step = 1,
  stepIcons = true,
  min,
  max,
  disabled,
  readOnly,
  wrapperClassName = 'tual-typo-field tual-typo-size-field',
  unitClassName = 'tual-typo-field-unit',
  className = 'tual-typo-input',
  ...rest
}: NumberFieldProps) {
  const stepNum = typeof step === 'number' ? step : (parseFloat(String(step)) || 1)
  const minNum = min !== undefined ? Number(min) : -Infinity
  const maxNum = max !== undefined ? Number(max) : Infinity
  const precision = stepNum.toString().split('.')[1]?.length ?? 0

  const handleStepUp = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (disabled || readOnly) return
    const next = Math.min(maxNum, Math.max(minNum, Number((value + stepNum).toFixed(precision))))
    onChange(next)
  }

  const handleStepDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (disabled || readOnly) return
    const next = Math.max(minNum, Math.min(maxNum, Number((value - stepNum).toFixed(precision))))
    onChange(next)
  }

  return (
    <div className={wrapperClassName}>
      <input
        type="number"
        value={value}
        step={step}
        min={min}
        max={max}
        disabled={disabled}
        readOnly={readOnly}
        className={className}
        onChange={(e) => {
          const parsed = parseFloat(e.target.value)
          if (!isNaN(parsed)) onChange(parsed)
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        {...rest}
      />
      {unit && <span className={unitClassName}>{unit}</span>}
      {stepIcons && (
        <div className="tual-number-stepper" onPointerDown={(e) => e.stopPropagation()}>
          <button
            type="button"
            tabIndex={-1}
            aria-label="Increment"
            className="tual-number-step-btn tual-number-step-up"
            disabled={disabled || readOnly || (max !== undefined && value >= Number(max))}
            onClick={handleStepUp}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <svg
              width="7"
              height="7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m18 15-6-6-6 6" />
            </svg>
          </button>
          <button
            type="button"
            tabIndex={-1}
            aria-label="Decrement"
            className="tual-number-step-btn tual-number-step-down"
            disabled={disabled || readOnly || (min !== undefined && value <= Number(min))}
            onClick={handleStepDown}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <svg
              width="7"
              height="7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}


