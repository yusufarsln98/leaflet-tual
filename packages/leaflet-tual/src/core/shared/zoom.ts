import type L from 'leaflet'

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
  const baseZoom = item?.baseZoom ?? 13
  return Math.pow(2, currentZoom - baseZoom)
}

