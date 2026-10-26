'use client'

import type { ColorName } from '../../../core/index.js'
import { DEFAULT_PALETTE } from '../../../core/index.js'

export const COLOR_NAMES: ColorName[] = [
  'ink',
  'gray',
  'taupe',
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple',
  'pink',
]

export function ColorPaletteSection({
  selectedColor,
  scheme,
  onSelectColor,
}: {
  selectedColor?: ColorName | string
  scheme: 'light' | 'dark'
  onSelectColor: (c: ColorName) => void
}) {
  return (
    <>
      <div className="tual-popover-header">Color</div>
      <div className="tual-palette">
        {COLOR_NAMES.map((name) => {
          const colorHex =
            scheme === 'dark' ? DEFAULT_PALETTE[name].dark : DEFAULT_PALETTE[name].light
          return (
            <button
              key={name}
              type="button"
              className="tual-swatch"
              data-selected={selectedColor === name}
              style={{
                backgroundColor: colorHex,
                outline: selectedColor === name ? '2px solid var(--tual-accent)' : undefined,
                outlineOffset: 2,
              }}
              title={name}
              onClick={() => onSelectColor(name)}
            />
          )
        })}
      </div>
    </>
  )
}

export function ButtonGroupSection<T extends string>({
  title,
  options,
  currentValue,
  onSelect,
  marginTop = 4,
  formatLabel,
}: {
  title: string
  options: readonly T[]
  currentValue: T
  onSelect: (v: T) => void
  marginTop?: number
  formatLabel?: (v: T) => string
}) {
  return (
    <>
      <div className="tual-popover-header" style={{ marginTop }}>{title}</div>
      <div style={{ display: 'flex', gap: 3 }}>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            className="tual-btn"
            data-active={currentValue === opt}
            style={{ flex: 1, height: 24, minHeight: 24, fontSize: 11 }}
            onClick={() => onSelect(opt)}
          >
            {formatLabel ? formatLabel(opt) : opt}
          </button>
        ))}
      </div>
    </>
  )
}

