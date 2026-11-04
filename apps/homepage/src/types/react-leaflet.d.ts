declare module 'react-leaflet' {
  import type { ComponentType } from 'react'
  import type { Map } from 'leaflet'

  export function useMap(): Map
  export const MapContainer: ComponentType<Record<string, unknown>>
  export const TileLayer: ComponentType<Record<string, unknown>>
  export const ZoomControl: ComponentType<Record<string, unknown>>
}
