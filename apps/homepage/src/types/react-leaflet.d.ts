declare module 'react-leaflet' {
  import type { ComponentType } from 'react'
  import type { Map } from 'leaflet'

  export function useMap(): Map
  export const MapContainer: ComponentType<any>
  export const TileLayer: ComponentType<any>
  export const ZoomControl: ComponentType<any>
}
