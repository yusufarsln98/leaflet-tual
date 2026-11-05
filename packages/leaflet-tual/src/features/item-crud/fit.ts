import type L from 'leaflet'
import type { Item } from '../../entities/index.js'
import { bounds } from '../../shared/geometry/geo.js'

export function fitItemsToBounds(map: L.Map | null | undefined, items: Item[]) {
  if (!map || items.length === 0) return

  let minLat = Infinity
  let maxLat = -Infinity
  let minLng = Infinity
  let maxLng = -Infinity

  for (const item of items) {
    const b = bounds(item)
    if (b.minLat < minLat) minLat = b.minLat
    if (b.maxLat > maxLat) maxLat = b.maxLat
    if (b.minLng < minLng) minLng = b.minLng
    if (b.maxLng > maxLng) maxLng = b.maxLng
  }

  if (Number.isFinite(minLat) && Number.isFinite(maxLat)) {
    const minSpan = 1e-7
    if (maxLat - minLat < minSpan) {
      const midLat = (minLat + maxLat) / 2
      minLat = midLat - minSpan / 2
      maxLat = midLat + minSpan / 2
    }
    if (maxLng - minLng < minSpan) {
      const midLng = (minLng + maxLng) / 2
      minLng = midLng - minSpan / 2
      maxLng = midLng + minSpan / 2
    }

    if (typeof map.stop === 'function') map.stop()
    map.fitBounds(
      [
        [minLat, minLng],
        [maxLat, maxLng],
      ],
      { padding: [50, 50], animate: true },
    )
  }
}
