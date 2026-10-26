'use client'

import type { ColorName } from '../../../../core/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import {
  ColorPaletteGrid,
  DEFAULT_COLOR_NAMES,
  SegmentedControl,
} from '../../../ui/index.js'

export const COLOR_NAMES: ColorName[] = DEFAULT_COLOR_NAMES

export function ColorPaletteSection({
  selectedColor,
  scheme = 'light',
  onSelectColor,
}: {
  selectedColor?: ColorName | string
  scheme?: 'light' | 'dark'
  onSelectColor: (c: ColorName) => void
}) {
  const { t } = useTranslation()

  return (
    <ColorPaletteGrid
      colors={COLOR_NAMES}
      selectedColor={selectedColor}
      scheme={scheme}
      variant="palette"
      header={t('color')}
      onSelectColor={onSelectColor}
    />
  )
}

export function ButtonGroupSection<T extends string>({
  title,
  options,
  currentValue,
  onSelect,
  marginTop = 4,
  formatLabel,
}: {
  title: string
  options: readonly T[]
  currentValue: T
  onSelect: (v: T) => void
  marginTop?: number
  formatLabel?: (v: T) => string
}) {
  return (
    <SegmentedControl
      variant="button-group"
      title={title}
      marginTop={marginTop}
      value={currentValue}
      options={options.map((opt) => ({
        value: opt,
        label: formatLabel ? formatLabel(opt) : opt,
      }))}
      onChange={onSelect}
    />
  )
}
