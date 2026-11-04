import type { GeoPoint } from '../../shared/types/geo.js'
import type { Item } from '../item/types.js'

export interface Page {
  id: string
  name: string
  view?: { center: GeoPoint; zoom: number }
  items: Record<string, Item>
  order: string[]
}

export interface Doc {
  activePageId: string
  pages: Page[]
}
