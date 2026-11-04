import type L from 'leaflet'
import type { Item } from '../../../entities/item/types.js'
import { bounds, getItemBounds } from './item-bounds.js'

/**
 * Checks whether an item's rendered screen bounding box intersects with the map viewport
 * (with optional pixel padding to prevent pop-in on edges).
 */
export function isItemInViewport(map: L.Map, item: Item, padding = 100): boolean {
  if (!map || typeof map.getSize !== 'function') return true
  const size = map.getSize()
  const b = getItemBounds(map, item)
  return (
    b.maxX >= -padding &&
    b.minX <= size.x + padding &&
    b.maxY >= -padding &&
    b.minY <= size.y + padding
  )
}

/**
 * Checks whether an item's geographic bounding box intersects with geographic bounds (e.g. map.getBounds()).
 */
export function isItemInGeoBounds(geoBounds: L.LatLngBounds, item: Item): boolean {
  if (!geoBounds || typeof geoBounds.intersects !== 'function') return true
  const b = bounds(item)
  const itemBounds: L.LatLngBoundsLiteral = [
    [b.minLat, b.minLng],
    [b.maxLat, b.maxLng],
  ]
  return geoBounds.intersects(itemBounds)
}

