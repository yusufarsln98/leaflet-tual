'use client'

import type L from 'leaflet'
import { useState } from 'react'
import type { ColorName } from '../../../../core/types/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import { useWheelGuard } from '../utils/use-wheel-guard.js'
import { PRESET_COLORS } from './color-utils.js'
import { CustomColorPicker } from './CustomColorPicker.js'

export { PRESET_COLORS } from './color-utils.js'

export interface ColorDropdownProps {
  title?: string
  mode: 'stroke' | 'fill'
  allowCustom?: boolean
  currentColor?: string
  currentFill?: 'none' | 'tint' | 'solid'
  scheme: 'light' | 'dark'
  map?: L.Map
  onSelectColor: (color: ColorName | string, hex: string) => void
  onSelectFillMode?: (mode: 'none' | 'tint' | 'solid') => void
  onClose?: () => void
}

export function ColorDropdown({
  mode,
  allowCustom = true,
  currentColor,
  currentFill = 'solid',
  scheme,
  map,
  onSelectColor,
  onSelectFillMode,
}: ColorDropdownProps) {
  const { t } = useTranslation()
  const guardRef = useWheelGuard<HTMLDivElement>()
  const [activeTab, setActiveTab] = useState<'theme' | 'custom'>('theme')

  return (
    <div
      ref={guardRef}
      className={`tual-popover tual-color-popover ${allowCustom ? 'tual-color-popover-with-tabs' : ''}`}
      onPointerDown={(e) => {
        e.stopPropagation()
        map?.dragging?.disable()
      }}
      onMouseDown={(e) => {
        e.stopPropagation()
        map?.dragging?.disable()
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {allowCustom && (
        <div className="tual-color-tabs" onPointerDown={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="tual-color-tab"
            data-active={activeTab === 'theme'}
            onClick={() => setActiveTab('theme')}
          >
            {t('theme')}
          </button>
          <button
            type="button"
            className="tual-color-tab"
            data-active={activeTab === 'custom'}
            onClick={() => setActiveTab('custom')}
          >
            {t('custom')}
          </button>
        </div>
      )}

      {activeTab === 'theme' ? (
        <div className="tual-color-list" onPointerDown={(e) => e.stopPropagation()}>
          {mode === 'fill' && onSelectFillMode && (
            <button
              type="button"
              className="tual-color-row"
              data-active={currentFill === 'none'}
              onClick={() => {
                onSelectFillMode('none')
              }}
            >
              <div className="tual-no-fill-swatch" />
              <span className="tual-color-label">{t('noFill')}</span>
              {currentFill === 'none' && <span className="tual-check">✓</span>}
            </button>
          )}

          {PRESET_COLORS.map((c) => {
            const hex = c.light
            const isSelected = currentColor === c.name || currentColor === hex
            return (
              <button
                key={c.name}
                type="button"
                className="tual-color-row"
                title={t(c.name, undefined, c.name)}
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
      ) : (
        <CustomColorPicker
          currentColor={currentColor}
          scheme={scheme}
          map={map}
          onSelectColor={onSelectColor}
        />
      )}
    </div>
  )
}
