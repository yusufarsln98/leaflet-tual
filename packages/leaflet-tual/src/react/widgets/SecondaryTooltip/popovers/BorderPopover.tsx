'use client'

import { useState } from 'react'
import type { ColorName } from '../../../../core/index.js'
import { resolveColor } from '../../../../core/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import {
  ColorSwatchList,
  ICONS,
  PillButton,
  SegmentedControl,
  Select,
  useWheelGuard,
} from '../../../ui/index.js'

export interface BorderPopoverProps {
  currentDash?: 'solid' | 'dashed' | 'dotted' | 'none'
  currentColor?: ColorName | string
  currentStrokeColor?: ColorName | string
  currentWidth?: 's' | 'm' | 'l' | number
  currentRadius?: number
  scheme: 'light' | 'dark'
  isSquareShape?: boolean
  showRadius?: boolean
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
  showRadius,
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
  const radiusVisible = showRadius ?? isSquareShape !== false
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
        <SegmentedControl
          variant="border-dash"
          value={currentDash}
          options={DASH_OPTIONS.map((opt) => ({
            value: opt.id,
            label: opt.icon,
            title: opt.id === 'none' ? t('noBorder') : t(opt.id),
          }))}
          onChange={onSelectDash}
        />

        {/* Row 2: Color Pill */}
        <PillButton
          variant="border-color"
          active={showPalette}
          title={t('borderColor')}
          onClick={() => setShowPalette((p) => !p)}
          leading={
            <div
              className="tual-border-color-pill-swatch"
              style={{ backgroundColor: strokeHex }}
            />
          }
          label={
            <span className="tual-border-color-pill-hex">{strokeHex.toUpperCase()}</span>
          }
        />

        {/* Row 3: Stroke Width & Corner Radius Selects */}
        <div className="tual-border-bottom-row">
          <Select
            ariaLabel={t('strokeWidth')}
            title={t('strokeWidth')}
            value={numWidth}
            options={STROKE_WIDTH_OPTIONS}
            onChange={onSelectWidth}
            icon={ICONS.strokeWidth()}
            unit="px"
            onOpen={() => setShowPalette(false)}
          />

          {radiusVisible && (
            <Select
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

          <ColorSwatchList
            variant="border-flyout"
            items={PALETTE_KEYS.map((key) => ({
              name: key,
              hex: resolveColor(key, 'light'),
              title: t(key),
            }))}
            selectedColor={activeStroke}
            onSelectColor={(name) => {
              onSelectStrokeColor(name)
              setShowPalette(false)
            }}
          />
        </div>
      )}
    </div>
  )
}
