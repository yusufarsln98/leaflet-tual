'use client'

import { useEffect, useId, useRef, useState } from 'react'
import type { SelectProps } from './types.js'

/**
 * Shared select control used across the editor UI.
 *
 * A visually hidden native `<select>` keeps form semantics and keyboard /
 * assistive-technology support, while the themed field and menu provide the
 * visual treatment.
 */
export function Select<T extends string | number>({
  ariaLabel,
  value,
  options,
  onChange,
  title,
  icon,
  unit,
  className,
  align = 'end',
  disabled = false,
  onOpen,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selectRef = useRef<HTMLSelectElement>(null)
  const menuId = useId()

  const selected = options.find((option) => option.value === value) ?? options[0]
  const selectedLabel = selected?.label ?? value

  const setMenuOpen = (next: boolean) => {
    if (disabled || next === open) return
    setOpen(next)
    if (next) onOpen?.()
  }

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      setOpen(false)
      selectRef.current?.focus()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const fieldClasses = [
    'tual-select-field',
    align === 'start' ? 'tual-select-field--start' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      ref={rootRef}
      className={fieldClasses}
      title={title}
      data-open={open || undefined}
      data-disabled={disabled || undefined}
      onClick={(event) => {
        event.stopPropagation()
        setMenuOpen(!open)
      }}
      onPointerDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onBlur={(event) => {
        if (!rootRef.current?.contains(event.relatedTarget as Node)) setOpen(false)
      }}
    >
      {icon && (
        <span className="tual-select-icon" aria-hidden="true">
          {icon}
        </span>
      )}

      <span className="tual-select-value">{selectedLabel}</span>

      {unit && <span className="tual-select-unit">{unit}</span>}

      <span className="tual-select-chevron" aria-hidden="true">
        <svg
          width="8"
          height="8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>

      <select
        ref={selectRef}
        className="tual-select"
        aria-label={ariaLabel}
        value={String(selected?.value ?? value)}
        onChange={(event) => {
          const next = options.find((option) => String(option.value) === event.target.value)
          if (!next) return
          onChange(next.value)
          setOpen(false)
        }}
        disabled={disabled}
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
          width: '100%',
          height: '100%',
          left: 0,
          top: 0,
        }}
      >
        {options.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>

      {open && (
        <div
          id={menuId}
          className="tual-select-menu"
          role="listbox"
          aria-label={ariaLabel}
          onPointerDown={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          {options.map((option) => {
            const isSelected = option.value === value
            return (
              <button
                key={String(option.value)}
                type="button"
                className="tual-select-menu-item"
                role="option"
                aria-selected={isSelected}
                data-active={isSelected}
                onClick={(event) => {
                  event.stopPropagation()
                  onChange(option.value)
                  setOpen(false)
                  selectRef.current?.focus()
                }}
              >
                <span>
                  {option.menuLabel ?? option.label}
                  {unit ? ` ${unit}` : ''}
                </span>
                {isSelected && <span className="tual-check">✓</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export const SelectField = Select

