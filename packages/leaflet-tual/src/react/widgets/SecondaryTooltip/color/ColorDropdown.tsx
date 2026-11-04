'use client'

import type L from 'leaflet'
import { useEffect, useState } from 'react'
import type { ColorName } from '../../../../core/index.js'
import { PRESET_COLORS } from '../../../../core/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import {
  ColorSwatchList,
  CustomColorPicker,
  Popover,
  SegmentedControl,
} from '../../../ui/index.js'

export { PRESET_COLORS } from '../../../../core/index.js'

export interface ColorDropdownProps {
  title?: string
  mode: 'stroke' | 'fill'
  allowCustom?: boolean
  currentColor?: string
  currentOpacity?: number
  currentFill?: 'none' | 'tint' | 'solid'
  map?: L.Map
  onSelectColor: (color: ColorName | string, hex?: string, opacity?: number) => void
  onSelectFillMode?: (mode: 'none' | 'tint' | 'solid') => void
  onClose?: () => void
}

export function ColorDropdown({
  mode,
  allowCustom = true,
  currentColor,
  currentOpacity = 1,
  currentFill = 'solid',
  map,
  onSelectColor,
  onSelectFillMode,
}: ColorDropdownProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'theme' | 'custom'>('theme')
  const [activeColor, setActiveColor] = useState(currentColor)
  const [activeOpacity, setActiveOpacity] = useState(currentOpacity)

  useEffect(() => {
    setActiveColor(currentColor)
  }, [currentColor])

  useEffect(() => {
    if (currentOpacity !== undefined) {
      setActiveOpacity(currentOpacity)
    }
  }, [currentOpacity])

  return (
    <Popover
      variant="color"
      className={allowCustom ? 'tual-color-popover-with-tabs' : undefined}
      disableMapDraggingOnPointerDown={() => map?.dragging?.disable()}
    >
      {allowCustom && (
        <SegmentedControl
          variant="color-tabs"
          stopPropagation
          value={activeTab}
          options={[
            { value: 'theme', label: t('theme') },
            { value: 'custom', label: t('custom') },
          ]}
          onChange={setActiveTab}
        />
      )}

      {activeTab === 'theme' ? (
        <ColorSwatchList
          variant="color-dropdown"
          items={PRESET_COLORS.map((c) => ({
            name: c.name,
            hex: c.hex,
            title: t(c.name, undefined, c.name),
          }))}
          selectedColor={activeColor}
          showNoFill={Boolean(mode === 'fill' && onSelectFillMode)}
          noFillSelected={mode === 'fill' && currentFill === 'none'}
          noFillLabel={t('noFill')}
          onSelectNoFill={
            mode === 'fill' && onSelectFillMode ? () => onSelectFillMode('none') : undefined
          }
          onSelectColor={(name, hex) => {
            if (mode === 'fill' && onSelectFillMode && currentFill === 'none') {
              onSelectFillMode('solid')
            }
            setActiveColor(hex)
            onSelectColor(name, hex, activeOpacity)
          }}
        />
      ) : (
        <CustomColorPicker
          currentColor={activeColor}
          currentOpacity={activeOpacity}
          map={map}
          onSelectColor={(hex, opacity) => {
            setActiveColor(hex)
            setActiveOpacity(opacity)
            onSelectColor(hex, hex, opacity)
          }}
        />
      )}
    </Popover>
  )
}
