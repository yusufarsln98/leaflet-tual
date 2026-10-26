'use client'

import type L from 'leaflet'
import { useState } from 'react'
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
  const [activeTab, setActiveTab] = useState<'theme' | 'custom'>('theme')

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
            hex: c.light,
            title: t(c.name, undefined, c.name),
          }))}
          selectedColor={currentColor}
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
            onSelectColor(name, hex)
          }}
        />
      ) : (
        <CustomColorPicker
          currentColor={currentColor}
          scheme={scheme}
          map={map}
          onSelectColor={onSelectColor}
        />
      )}
    </Popover>
  )
}
