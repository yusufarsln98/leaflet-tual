import type L from 'leaflet'

export interface ColorSwatchProps {
  colorHex: string
  noFill?: boolean
  title?: string
  ariaLabel?: string
  selected?: boolean
  onClick?: () => void
}

export interface ColorSwatchListItem {
  hex: string
  title?: string
}

export interface ColorSwatchListProps {
  items: ReadonlyArray<ColorSwatchListItem>
  selectedColor?: string
  /** @deprecated Both variants now share the standard color list design. */
  variant?: 'color-dropdown' | 'border-flyout'
  showNoFill?: boolean
  noFillSelected?: boolean
  noFillLabel?: string
  onSelectNoFill?: () => void
  onSelectColor: (hex: string) => void
}

export interface CustomColorPickerProps {
  currentColor?: string
  currentOpacity?: number
  map?: L.Map
  onSelectColor: (hex: string, opacity: number) => void
}
