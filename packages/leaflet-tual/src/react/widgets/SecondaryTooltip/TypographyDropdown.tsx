'use client'

import { useState } from 'react'
import type { FontWeight, Style } from '../../../core/types/index.js'
import { resolveSize } from '../../../core/shared/theme.js'

export interface TypographyDropdownProps {
  currentSize?: Style['size']
  currentFontSize?: number
  currentWeight?: Style['weight']
  currentFontStyle?: Style['fontStyle']
  currentAlign?: Style['align']
  onUpdateStyle: (patch: Partial<Style>) => void
  onClose: () => void
}

export const THEME_PRESETS: {
  id: NonNullable<Style['size']>
  label: string
  px: number
}[] = [
  { id: 'xl', label: 'Heading 1', px: 28 },
  { id: 'l', label: 'Heading 2', px: 20 },
  { id: 'm', label: 'Body', px: 16 },
  { id: 's', label: 'Caption', px: 12 },
]

export const WEIGHT_OPTIONS: { id: FontWeight; label: string; num: number }[] = [
  { id: 'regular', label: 'Regular', num: 400 },
  { id: 'medium', label: 'Medium', num: 500 },
  { id: 'semibold', label: 'Semibold', num: 600 },
  { id: 'bold', label: 'Bold', num: 700 },
  { id: 'black', label: 'Black', num: 800 },
]

const QUICK_SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 40]

export function TypographyDropdown({
  currentSize = 'm',
  currentFontSize,
  currentWeight = 'regular',
  currentFontStyle = 'normal',
  onUpdateStyle,
}: TypographyDropdownProps) {
  const [activeTab, setActiveTab] = useState<'theme' | 'custom'>('theme')

  const effectivePx = resolveSize(currentSize, currentFontSize)

  const handleSelectPreset = (presetId: NonNullable<Style['size']>) => {
    onUpdateStyle({
      size: presetId,
      fontSize: undefined,
    })
  }

  const handleCustomPxChange = (px: number) => {
    const clamped = Math.max(8, Math.min(144, Math.round(px)))
    onUpdateStyle({
      fontSize: clamped,
    })
  }

  const handleWeightChange = (w: FontWeight) => {
    onUpdateStyle({ weight: w })
  }

  const handleFontStyleChange = (fs: 'normal' | 'italic') => {
    onUpdateStyle({ fontStyle: fs })
  }

  return (
    <div
      className="tual-popover tual-typography-popover"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Top Tab Bar: Theme | Custom */}
      <div className="tual-typo-tabs">
        <button
          type="button"
          className="tual-typo-tab"
          data-active={activeTab === 'theme'}
          onClick={() => setActiveTab('theme')}
        >
          Theme
        </button>
        <button
          type="button"
          className="tual-typo-tab"
          data-active={activeTab === 'custom'}
          onClick={() => setActiveTab('custom')}
        >
          Custom
        </button>
      </div>

      {activeTab === 'theme' ? (
        <div className="tual-typo-list">
          {THEME_PRESETS.map((p) => {
            const isSelected =
              !currentFontSize && (currentSize === p.id || (p.id === 'm' && !currentSize))
            return (
              <button
                key={p.id}
                type="button"
                className="tual-typo-row"
                data-selected={isSelected}
                onClick={() => handleSelectPreset(p.id)}
              >
                <div className="tual-typo-row-label">
                  <span className="tual-typo-name">{p.label}</span>
                  <span className="tual-typo-px">{p.px}px</span>
                </div>
                {isSelected && (
                  <span className="tual-typo-check">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}
              </button>
            )
          })}
        </div>
      ) : (
        <div className="tual-typo-custom-panel">
          {/* Manual px size */}
          <div className="tual-typo-section">
            <div className="tual-typo-section-header">
              <span className="tual-typo-section-title">Font Size</span>
              <div className="tual-typo-input-group">
                <button
                  type="button"
                  className="tual-typo-step-btn"
                  onClick={() => handleCustomPxChange(effectivePx - 1)}
                  title="Decrease"
                >
                  −
                </button>
                <input
                  type="number"
                  min="8"
                  max="144"
                  value={effectivePx}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10)
                    if (!isNaN(val)) handleCustomPxChange(val)
                  }}
                  className="tual-typo-number-input"
                />
                <span className="tual-typo-unit">px</span>
                <button
                  type="button"
                  className="tual-typo-step-btn"
                  onClick={() => handleCustomPxChange(effectivePx + 1)}
                  title="Increase"
                >
                  +
                </button>
              </div>
            </div>
            {/* Quick sizes */}
            <div className="tual-typo-chips-row">
              {QUICK_SIZES.map((px) => (
                <button
                  key={px}
                  type="button"
                  className="tual-typo-chip"
                  data-active={effectivePx === px}
                  onClick={() => handleCustomPxChange(px)}
                >
                  {px}
                </button>
              ))}
            </div>
          </div>

          {/* Boldness / Weight options */}
          <div className="tual-typo-section">
            <span className="tual-typo-section-title">Weight</span>
            <div className="tual-typo-weights-grid">
              {WEIGHT_OPTIONS.map((w) => {
                const isSelected =
                  currentWeight === w.id ||
                  (w.id === 'regular' && (!currentWeight || currentWeight === 'regular'))
                return (
                  <button
                    key={w.id}
                    type="button"
                    className="tual-typo-weight-btn"
                    data-active={isSelected}
                    style={{ fontWeight: w.num }}
                    onClick={() => handleWeightChange(w.id)}
                  >
                    {w.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Text Style */}
          <div className="tual-typo-section">
            <span className="tual-typo-section-title">Style</span>
            <div className="tual-typo-styles-row">
              <button
                type="button"
                className="tual-typo-style-btn"
                data-active={!currentFontStyle || currentFontStyle === 'normal'}
                onClick={() => handleFontStyleChange('normal')}
              >
                Normal
              </button>
              <button
                type="button"
                className="tual-typo-style-btn"
                data-active={currentFontStyle === 'italic'}
                style={{ fontStyle: 'italic' }}
                onClick={() => handleFontStyleChange('italic')}
              >
                Italic
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
