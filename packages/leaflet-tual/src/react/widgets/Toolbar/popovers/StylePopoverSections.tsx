'use client'

import type { ColorName } from '../../../../core/index.js'
import { DEFAULT_PALETTE } from '../../../../core/index.js'
import { useTranslation } from '../../../features/i18n/index.js'

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
  scheme: _scheme,
  onSelectColor,
}: {
  selectedColor?: ColorName | string
  scheme?: 'light' | 'dark'
  onSelectColor: (c: ColorName) => void
}) {
  const { t } = useTranslation()

  return (
    <>
      <div className="tual-popover-header">{t('color')}</div>
      <div className="tual-palette">
        {COLOR_NAMES.map((name) => {
          const colorHex = DEFAULT_PALETTE[name].light
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
              title={t(name, undefined, name)}
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
      <div className="tual-popover-header" style={{ marginTop }}>
        {title}
      </div>
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
