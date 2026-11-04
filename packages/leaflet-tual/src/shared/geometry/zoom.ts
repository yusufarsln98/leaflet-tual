import type L from 'leaflet'

export const BASE_ZOOM = 13

export const ZOOM_PRESETS = [25, 50, 100, 200] as const

export function getZoomPercent(zoom: number | undefined): number {
  return zoom !== undefined ? Math.round(Math.pow(2, zoom - BASE_ZOOM) * 100) : 100
}

export function zoomPercentToLevel(percent: number): number {
  return BASE_ZOOM + Math.log2(percent / 100)
}

/**
 * Calculates the 1:1 zoom scale factor for an item based on the map's current zoom.
 * When the map zooms in by 1 level, scale doubles (2x).
 * When the map zooms out by 1 level, scale halves (0.5x).
 */
export function getItemZoomScale(
  map: L.Map | null | undefined,
  item?: { baseZoom?: number } | null,
): number {
  if (!map || typeof map.getZoom !== 'function') return 1
  const currentZoom = map.getZoom()
  const baseZoom = item?.baseZoom ?? BASE_ZOOM
  return Math.pow(2, currentZoom - baseZoom)
}
