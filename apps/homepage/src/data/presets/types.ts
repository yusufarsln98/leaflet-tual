import type { CanvasItem } from 'leaflet-canvas/react'

export interface ShowcasePreset {
  id: string
  name: string
  region: string
  center: [number, number]
  zoom: number
  description: string
  items: CanvasItem[]
}

