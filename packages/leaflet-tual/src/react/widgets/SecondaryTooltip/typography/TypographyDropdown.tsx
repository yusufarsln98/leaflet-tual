'use client'

import { useState } from 'react'
import type { FontWeight, Style } from '../../../../core/types/index.js'
import { resolveSize } from '../../../../core/shared/theme/theme.js'
import { useTranslation } from '../../../features/i18n/index.js'
import { SelectField } from '../../shared/select-field/index.js'
import { useWheelGuard } from '../utils/use-wheel-guard.js'
import { THEME_PRESETS, WEIGHT_OPTIONS } from './typography-constants.js'

export { THEME_PRESETS, WEIGHT_OPTIONS } from './typography-constants.js'

export interface TypographyDropdownProps {
  currentSize?: Style['size']
  currentFontSize?: number
  currentWeight?: Style['weight']
  currentFontStyle?: Style['fontStyle']
  currentUnderline?: boolean
  currentAlign?: Style['align']
  onUpdateStyle: (patch: Partial<Style>) => void
  onClose: () => void
}

export function TypographyDropdown({
  currentSize = 'm',
  currentFontSize,
  currentWeight = 'regular',
  currentFontStyle = 'normal',
  currentUnderline = false,
  onUpdateStyle,
}: TypographyDropdownProps) {
  const { t } = useTranslation()
  const guardRef = useWheelGuard<HTMLDivElement>()
  const [activeTab, setActiveTab] = useState<'theme' | 'custom'>(
    currentFontSize ? 'custom' : 'theme',
  )

  const effectivePx = resolveSize(currentSize, currentFontSize)

  const handleSelectPreset = (presetId: NonNullable<Style['size']>) => onUpdateStyle({ size: presetId, fontSize: undefined })
  const handleCustomPxChange = (px: number) => onUpdateStyle({ fontSize: Math.max(8, Math.min(144, Math.round(px))) })
  const handleWeightChange = (w: FontWeight) => onUpdateStyle({ weight: w })
  const handleFontStyleChange = (fs: 'normal' | 'italic') => onUpdateStyle({ fontStyle: fs })
  const handleUnderlineToggle = () => onUpdateStyle({ underline: !currentUnderline, textDecoration: !currentUnderline ? 'underline' : 'none' })

  return (
    <div
      ref={guardRef}
      className="tual-popover tual-typography-popover"
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Tab Bar: Theme | Custom */}
      <div className="tual-typo-tabs">
        <button
          type="button"
          className="tual-typo-tab"
          data-active={activeTab === 'theme'}
          onClick={() => setActiveTab('theme')}
        >
          {t('theme')}
        </button>
        <button
          type="button"
          className="tual-typo-tab"
          data-active={activeTab === 'custom'}
          onClick={() => setActiveTab('custom')}
        >
          {t('custom')}
        </button>
      </div>

      {activeTab === 'theme' ? (
        <div className="tual-typo-list">
          {THEME_PRESETS.map((p) => {
            const isSelected =
              !currentFontSize && (currentSize === p.id || (p.id === 'm' && !currentSize))
            const labelKey =
              p.id === 'xl' ? 'heading1' : p.id === 'l' ? 'heading2' : p.id === 's' ? 'caption' : 'body'
            const presetLabel = t(labelKey, undefined, p.label)
            return (
              <button
                key={p.id}
                type="button"
                className="tual-typo-row"
                data-selected={isSelected}
                onClick={() => handleSelectPreset(p.id)}
              >
                <div className="tual-typo-row-label">
                  <span className="tual-typo-name">{presetLabel}</span>
                  <span className="tual-typo-px">{p.px}px</span>
                </div>
                {isSelected && (
                  <span className="tual-typo-check">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
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
          {/* Row matching mockup: Weight dropdown + px number input */}
          <div className="tual-typo-fields-row" onPointerDown={(e) => e.stopPropagation()}>
            <SelectField
              ariaLabel={t('fontWeight')}
              title={t('fontWeight')}
              value={typeof currentWeight === 'string' ? currentWeight : 'regular'}
              options={WEIGHT_OPTIONS.map((weight) => ({
                value: weight.id,
                label: t(weight.id, undefined, weight.label),
              }))}
              onChange={(weight) => handleWeightChange(weight as FontWeight)}
              align="start"
              className="tual-typo-weight-field"
            />

            <div className="tual-typo-field tual-typo-size-field">
              <input
                type="number"
                aria-label={t('fontSizePx')}
                min="8"
                max="144"
                value={effectivePx}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10)
                  if (!isNaN(val)) handleCustomPxChange(val)
                }}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                className="tual-typo-input"
              />
              <span className="tual-typo-field-unit">px</span>
            </div>
          </div>

          {/* Text Style: Normal | Italic | Underline */}
          <div className="tual-typo-styles-row">
            <button
              type="button"
              className="tual-typo-style-btn"
              data-active={!currentFontStyle || currentFontStyle === 'normal'}
              onClick={() => handleFontStyleChange('normal')}
            >
              {t('normal')}
            </button>
            <button
              type="button"
              className="tual-typo-style-btn"
              data-active={currentFontStyle === 'italic'}
              style={{ fontStyle: 'italic' }}
              onClick={() => handleFontStyleChange('italic')}
            >
              {t('italic')}
            </button>
            <button
              type="button"
              className="tual-typo-style-btn"
              data-active={currentUnderline}
              style={{ textDecoration: 'underline' }}
              onClick={handleUnderlineToggle}
            >
              {t('underline')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
