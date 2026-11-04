import type { Item } from 'leaflet-tual/react'

export interface ShowcasePreset {
  id: string
  name: string
  region: string
  center: [number, number]
  zoom: number
  description: string
  items: Item[]
}
