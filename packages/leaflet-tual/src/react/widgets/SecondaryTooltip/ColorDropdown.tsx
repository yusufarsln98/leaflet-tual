'use client'

import type { ColorName } from '../../../core/types/index.js'
import { useWheelGuard } from './use-wheel-guard.js'

export interface ColorDropdownProps {
  title?: string
  mode: 'stroke' | 'fill'
  currentColor?: string
  currentFill?: 'none' | 'tint' | 'solid'
  scheme: 'light' | 'dark'
  onSelectColor: (color: ColorName, hex: string) => void
  onSelectFillMode?: (mode: 'none' | 'tint' | 'solid') => void
  onClose: () => void
}

const PRESET_COLORS: { name: ColorName; light: string; dark: string }[] = [
  { name: 'ink', light: '#1F2A30', dark: '#ECEAE6' },
  { name: 'taupe', light: '#4A5560', dark: '#9CA3AF' },
  { name: 'blue', light: '#1B4CC0', dark: '#60A5FA' },
  { name: 'red', light: '#8F2323', dark: '#F87171' },
  { name: 'green', light: '#0B6B49', dark: '#34D399' },
  { name: 'purple', light: '#4A2C80', dark: '#A78BFA' },
  { name: 'gray', light: '#6B7280', dark: '#9CA3AF' },
  { name: 'orange', light: '#EA580C', dark: '#FB923C' },
  { name: 'yellow', light: '#D97706', dark: '#FBBF24' },
  { name: 'pink', light: '#DB2777', dark: '#F472B6' },
]

export function ColorDropdown({
  mode,
  currentColor,
  currentFill = 'solid',
  scheme,
  onSelectColor,
  onSelectFillMode,
}: ColorDropdownProps) {
  const guardRef = useWheelGuard<HTMLDivElement>()

  return (
    <div
      ref={guardRef}
      className="tual-popover tual-color-popover"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="tual-color-list">
        {mode === 'fill' && onSelectFillMode && (
          <button
            type="button"
            className="tual-color-row"
            data-active={currentFill === 'none'}
            onClick={() => onSelectFillMode('none')}
          >
            <div className="tual-no-fill-swatch" />
            <span className="tual-color-label">No fill</span>
            {currentFill === 'none' && <span className="tual-check">✓</span>}
          </button>
        )}

        {PRESET_COLORS.map((c) => {
          const hex = scheme === 'dark' ? c.dark : c.light
          const isSelected = currentColor === c.name || currentColor === hex
          return (
            <button
              key={c.name}
              type="button"
              className="tual-color-row"
              data-active={isSelected && (mode !== 'fill' || currentFill !== 'none')}
              onClick={() => {
                if (mode === 'fill' && onSelectFillMode && currentFill === 'none') {
                  onSelectFillMode('solid')
                }
                onSelectColor(c.name, hex)
              }}
            >
              <div className="tual-color-swatch-box" style={{ backgroundColor: hex }} />
              <span className="tual-color-label">{hex.toUpperCase()}</span>
              {isSelected && (mode !== 'fill' || currentFill !== 'none') && (
                <span className="tual-check">✓</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
