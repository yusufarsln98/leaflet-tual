import type L from 'leaflet'
import type { ScreenPoint } from '../../types/index.js'
import type { Item } from '../../../entities/item/types.js'
import { getItemBounds } from './item-bounds.js'

/**
 * Clamps a floating point position so that an element of size (width, height)
 * stays entirely within container dimensions (containerSize.x, containerSize.y) with margin.
 */
export function clampPositionToContainer(
  point: ScreenPoint,
  containerSize: ScreenPoint,
  elementSize: { width: number; height: number },
  margin = 12,
): ScreenPoint {
  const left = Math.max(
    margin,
    Math.min(point.x, Math.max(margin, containerSize.x - elementSize.width - margin)),
  )
  const top = Math.max(
    margin,
    Math.min(point.y, Math.max(margin, containerSize.y - elementSize.height - margin)),
  )
  return { x: left, y: top }
}

/**
 * Calculates the anchor position for a secondary contextual tooltip floating
 * directly above an item's bounding box.
 */
export function getSecondaryTooltipAnchor(
  map: L.Map,
  item: Item,
  offsetY = 44,
  minTop = 16,
): ScreenPoint {
  const b = getItemBounds(map, item)
  return {
    x: Math.round(b.cx),
    y: Math.round(Math.max(minTop, b.minY - offsetY)),
  }
}

