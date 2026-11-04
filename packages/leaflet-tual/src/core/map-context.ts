import type L from 'leaflet'
import type { GeoPoint, ScreenPoint, WorldPoint } from '../shared/types/index.js'
import { geoToScreen, screenToGeo, toWorld, fromWorld } from '../shared/geometry/coordinates.js'

export interface MapContext {
  getMap(): L.Map | null
  setMap(map: L.Map | null): void
  geoToScreen(geo: GeoPoint): ScreenPoint
  screenToGeo(point: ScreenPoint): GeoPoint
  toWorld(geo: GeoPoint): WorldPoint
  fromWorld(point: WorldPoint): GeoPoint
  getZoom(): number
  getSize(): { x: number; y: number }
  invalidate(): void
}

export function createMapContext(initialMap?: L.Map | null): MapContext {
  let map: L.Map | null = initialMap ?? null
  return {
    getMap: () => map,
    setMap: (m: L.Map | null) => {
      map = m
    },
    geoToScreen: (geo: GeoPoint) => {
      if (!map) return { x: 0, y: 0 }
      return geoToScreen(map, geo)
    },
    screenToGeo: (point: ScreenPoint) => {
      if (!map) return { lat: 0, lng: 0 }
      return screenToGeo(map, point)
    },
    toWorld,
    fromWorld,
    getZoom: () => map?.getZoom() ?? 0,
    getSize: () => {
      if (!map) return { x: 0, y: 0 }
      const s = map.getSize()
      return { x: s.x, y: s.y }
    },
    invalidate: () => {
      map?.invalidateSize?.()
    },
  }
}
