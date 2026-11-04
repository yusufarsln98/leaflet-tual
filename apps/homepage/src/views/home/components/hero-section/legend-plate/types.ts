import type { LucideIcon } from 'lucide-react'
import type { LayerFilter } from '../constants'

export interface LegendLayer {
  id: LayerFilter
  label: string
  sublabel: string
  count: string
  swatchColor: string
  icon: LucideIcon
  chips: string[]
  description: string
}
