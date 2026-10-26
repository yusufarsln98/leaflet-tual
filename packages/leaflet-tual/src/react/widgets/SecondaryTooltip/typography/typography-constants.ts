import type { FontWeight, Style } from '../../../../core/types/index.js'

export const THEME_PRESETS: {
  id: NonNullable<Style['size']>
  label: string
  px: number
}[] = [
  { id: 'xl', label: 'Heading 1', px: 28 },
  { id: 'l', label: 'Heading 2', px: 20 },
  { id: 'm', label: 'Body', px: 16 },
  { id: 's', label: 'Caption', px: 12 },
]

export const WEIGHT_OPTIONS: { id: FontWeight; label: string; num: number }[] = [
  { id: 'regular', label: 'Regular', num: 400 },
  { id: 'medium', label: 'Medium', num: 500 },
  { id: 'semibold', label: 'Semibold', num: 600 },
  { id: 'bold', label: 'Bold', num: 700 },
  { id: 'black', label: 'Black', num: 800 },
]
