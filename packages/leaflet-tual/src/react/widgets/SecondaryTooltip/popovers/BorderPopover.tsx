'use client'

import { useState } from 'react'
import type { ColorName } from '../../../../core/index.js'
import { resolveColor } from '../../../../core/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import { ICONS } from '../../Toolbar/icons/index.js'
import { SelectField } from '../../shared/select-field/index.js'
import { useWheelGuard } from '../utils/use-wheel-guard.js'

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

const DASH_OPTIONS: Array<{
  id: 'none' | 'solid' | 'dashed' | 'dotted'
  label: string
  icon: string
}> = [
  { id: 'none', label: 'No Border', icon: '⊘' },
  { id: 'solid', label: 'Solid', icon: '—' },
  { id: 'dashed', label: 'Dashed', icon: '– – –' },
  { id: 'dotted', label: 'Dotted', icon: '····' },
]

const PALETTE_KEYS: ColorName[] = [
  'ink',
  'gray',
  'blue',
  'red',
  'green',
  'purple',
  'taupe',
  'orange',
  'yellow',
  'pink',
]

const STROKE_WIDTH_OPTIONS = [0, 1, 2, 4].map((width) => ({
  value: width,
  label: String(width),
}))

const RADIUS_OPTIONS = [0, 8, 16].map((radius) => ({
  value: radius,
  label: String(radius),
}))

export function BorderPopover({
  currentDash = 'solid',
  currentColor,
  currentStrokeColor,
  currentWidth = 'm',
  currentRadius = 8,
  scheme,
  isSquareShape,
  onSelectDash,
  onSelectStrokeColor,
  onSelectWidth,
  onSelectRadius,
}: BorderPopoverProps) {
  const { t } = useTranslation()
  const guardRef = useWheelGuard<HTMLDivElement>()
  const [showPalette, setShowPalette] = useState(false)

  const activeStroke = currentStrokeColor ?? currentColor ?? 'blue'
  const strokeHex = resolveColor(activeStroke, scheme)
  const numWidth =
    typeof currentWidth === 'number'
      ? currentWidth
      : currentWidth === 's'
        ? 1
        : currentWidth === 'l'
          ? 4
          : 2

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
          {DASH_OPTIONS.map((opt) => {
            const label = opt.id === 'none' ? t('noBorder') : t(opt.id)
            return (
              <button
                key={opt.id}
                type="button"
                className="tual-border-dash-btn"
                data-active={currentDash === opt.id}
                title={label}
                onClick={() => onSelectDash(opt.id)}
              >
                {opt.icon}
              </button>
            )
          })}
        </div>

        {/* Row 2: Color Pill */}
        <button
          type="button"
          className="tual-border-color-pill"
          data-active={showPalette}
          title={t('borderColor')}
          onClick={() => setShowPalette((p) => !p)}
        >
          <div className="tual-border-color-pill-swatch" style={{ backgroundColor: strokeHex }} />
          <span className="tual-border-color-pill-hex">{strokeHex.toUpperCase()}</span>
        </button>

        {/* Row 3: Stroke Width & Corner Radius Selects */}
        <div className="tual-border-bottom-row">
          <SelectField
            ariaLabel={t('strokeWidth')}
            title={t('strokeWidth')}
            value={numWidth}
            options={STROKE_WIDTH_OPTIONS}
            onChange={onSelectWidth}
            icon={ICONS.strokeWidth()}
            unit="px"
            onOpen={() => setShowPalette(false)}
          />

          {isSquareShape !== false && (
            <SelectField
              ariaLabel={t('cornerRadius')}
              title={t('cornerRadius')}
              value={currentRadius}
              options={RADIUS_OPTIONS}
              onChange={(radius) => onSelectRadius?.(radius)}
              icon={ICONS.radius ? ICONS.radius() : ICONS.dash()}
              unit="px"
              onOpen={() => setShowPalette(false)}
            />
          )}
        </div>
      </div>

      {/* Flyout Nested Color Palette */}
      {showPalette && (
        <div className="tual-border-nested-palette">
          <div className="tual-border-palette-header">
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--tual-text, #111827)' }}>
              {t('colors')}
            </span>
            <button
              type="button"
              className="tual-border-palette-close"
              title={t('close')}
              onClick={() => setShowPalette(false)}
            >
              ×
            </button>
          </div>

          <div className="tual-border-palette-list">
            {PALETTE_KEYS.map((key) => {
              const hex = resolveColor(key, 'light')
              return (
                <button
                  key={key}
                  type="button"
                  className="tual-border-palette-item"
                  data-selected={activeStroke === key}
                  title={t(key)}
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
