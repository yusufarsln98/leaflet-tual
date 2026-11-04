'use client'

import type L from 'leaflet'
import { useEffect, useState } from 'react'
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
  allowCustom?: boolean
  allowNoFill?: boolean
  currentColor?: string
  currentOpacity?: number
  noFillSelected?: boolean
  map?: L.Map
  onSelectColor: (hex: string, opacity?: number) => void
  onSelectNoFill?: () => void
  onClose?: () => void
}

export function ColorDropdown({
  allowCustom = true,
  allowNoFill = false,
  currentColor,
  currentOpacity = 1,
  noFillSelected = false,
  map,
  onSelectColor,
  onSelectNoFill,
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
            hex: c.hex,
            title: t(c.name, undefined, c.name),
          }))}
          selectedColor={noFillSelected ? undefined : activeColor}
          showNoFill={allowNoFill && Boolean(onSelectNoFill)}
          noFillSelected={noFillSelected}
          noFillLabel={t('noFill')}
          onSelectNoFill={onSelectNoFill}
          onSelectColor={(hex) => {
            setActiveColor(hex)
            onSelectColor(hex, activeOpacity)
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
            onSelectColor(hex, opacity)
          }}
        />
      )}
    </Popover>
  )
}
