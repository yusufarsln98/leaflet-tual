import type L from 'leaflet'
import type { ColorName } from '../../../core/index.js'

export interface ColorSwatchProps {
  colorHex: string
  noFill?: boolean
  title?: string
  ariaLabel?: string
  selected?: boolean
  variant?: 'secondary-button' | 'palette-circle' | 'border-circle'
  onClick?: () => void
}

export interface ColorPaletteGridProps {
  colors?: ReadonlyArray<ColorName>
  selectedColor?: ColorName | string
  variant?: 'palette' | 'border'
  header?: string
  onSelectColor: (color: ColorName) => void
}

export interface ColorSwatchListItem {
  name: ColorName
  hex: string
  title?: string
}

export interface ColorSwatchListProps {
  items: ReadonlyArray<ColorSwatchListItem>
  selectedColor?: string
  variant?: 'color-dropdown' | 'border-flyout'
  showNoFill?: boolean
  noFillSelected?: boolean
  noFillLabel?: string
  onSelectNoFill?: () => void
  onSelectColor: (name: ColorName, hex: string) => void
}

export interface CustomColorPickerProps {
  currentColor?: string
  map?: L.Map
  onSelectColor: (color: string, hex: string) => void
}

