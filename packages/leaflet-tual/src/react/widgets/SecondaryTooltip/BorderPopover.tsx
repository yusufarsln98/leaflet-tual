'use client'

import { useState } from 'react'
import type { ColorName } from '../../../core/index.js'
import { resolveColor } from '../../../core/index.js'
import { ICONS } from '../Toolbar/icons.js'
import { useWheelGuard } from './use-wheel-guard.js'

export interface BorderPopoverProps {
  currentDash?: 'solid' | 'dashed' | 'dotted' | 'none'
  currentColor?: ColorName | string
  currentStrokeColor?: ColorName | string
  currentWidth?: 's' | 'm' | 'l' | number
  currentRadius?: number
  scheme: 'light' | 'dark'
  isSquareShape?: boolean
  onSelectDash: (dash: 'solid' | 'dashed' | 'dotted' | 'none') => void
  onSelectStrokeColor: (color: ColorName | string) => void
  onSelectWidth: (width: 's' | 'm' | 'l' | number) => void
  onSelectRadius?: (radius: number) => void
  onClose: () => void
}

const DASH_OPTIONS: Array<{ id: 'none' | 'solid' | 'dashed' | 'dotted'; label: string; icon: string }> = [
  { id: 'none', label: 'No Border', icon: '⊘' },
  { id: 'solid', label: 'Solid', icon: '—' },
  { id: 'dashed', label: 'Dashed', icon: '– – –' },
  { id: 'dotted', label: 'Dotted', icon: '····' },
]

const PALETTE_KEYS: ColorName[] = ['ink', 'gray', 'blue', 'red', 'green', 'purple', 'taupe', 'orange', 'yellow', 'pink']

export function BorderPopover({
  currentDash = 'solid', currentColor, currentStrokeColor,
  currentWidth = 'm', currentRadius = 8, scheme, isSquareShape,
  onSelectDash, onSelectStrokeColor, onSelectWidth, onSelectRadius,
}: BorderPopoverProps) {
  const guardRef = useWheelGuard<HTMLDivElement>()
  const [showPalette, setShowPalette] = useState(false)

  const activeStroke = currentStrokeColor ?? currentColor ?? 'blue'
  const strokeHex = resolveColor(activeStroke, scheme)
  const numWidth = typeof currentWidth === 'number' ? currentWidth : currentWidth === 's' ? 1 : currentWidth === 'l' ? 4 : 2

  return (
    <div
      ref={guardRef}
      className="tual-border-popover-wrapper"
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="tual-border-main-card">
        {/* Row 1: Segmented Dash Group */}
        <div className="tual-border-dash-group">
          {DASH_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className="tual-border-dash-btn"
              data-active={currentDash === opt.id}
              title={opt.label}
              onClick={() => onSelectDash(opt.id)}
            >
              {opt.icon}
            </button>
          ))}
        </div>

        {/* Row 2: Color Pill */}
        <button
          type="button"
          className="tual-border-color-pill"
          data-active={showPalette}
          title="Border Color"
          onClick={() => setShowPalette((p) => !p)}
        >
          <div className="tual-border-color-pill-swatch" style={{ backgroundColor: strokeHex }} />
          <span className="tual-border-color-pill-hex">{strokeHex.toUpperCase()}</span>
        </button>

        {/* Row 3: Stroke Width & Corner Radius Selects */}
        <div className="tual-border-bottom-row">
          <div className="tual-select-field" title="Stroke Width">
            <span className="tual-select-icon">{ICONS.strokeWidth()}</span>
            <select
              className="tual-select"
              aria-label="Stroke Width"
              value={numWidth}
              onChange={(e) => onSelectWidth(Number(e.target.value))}
            >
              <option value={0}>0</option>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={4}>4</option>
            </select>
            <span className="tual-select-unit">px</span>
          </div>

          {isSquareShape !== false && (
            <div className="tual-select-field" title="Corner Radius" style={{ maxWidth: 64 }}>
              <span className="tual-select-icon">{ICONS.dash()}</span>
              <select
                className="tual-select"
                aria-label="Corner Radius"
                value={currentRadius}
                onChange={(e) => onSelectRadius?.(Number(e.target.value))}
              >
                <option value={0}>0</option>
                <option value={8}>8</option>
                <option value={16}>16</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Flyout Nested Color Palette (No custom theme) */}
      {showPalette && (
        <div className="tual-border-nested-palette">
          <div className="tual-border-palette-header">
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--tual-text, #111827)' }}>Colors</span>
            <button
              type="button"
              className="tual-border-palette-close"
              title="Close"
              onClick={() => setShowPalette(false)}
            >
              ×
            </button>
          </div>

          <div className="tual-border-palette-list">
            {PALETTE_KEYS.map((key) => {
              const hex = resolveColor(key, scheme)
              return (
                <button
                  key={key}
                  type="button"
                  className="tual-border-palette-item"
                  data-selected={activeStroke === key}
                  onClick={() => {
                    onSelectStrokeColor(key)
                    setShowPalette(false)
                  }}
                >
                  <div className="tual-border-palette-swatch" style={{ backgroundColor: hex }} />
                  <span className="tual-border-palette-hex">{hex.toUpperCase()}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
