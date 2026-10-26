import type { GeoPoint, Item, WorldPoint } from '../types/index.js'
import { fromWorld, toWorld } from './coordinates.js'

/** Returns the world-plane displacement between two geographic points. */
export function worldDelta(from: GeoPoint, to: GeoPoint): WorldPoint {
  const a = toWorld(from)
  const b = toWorld(to)
  return { x: b.x - a.x, y: b.y - a.y }
}

/** Translates a geographic point by a world-plane displacement. */
export function translateGeo(geo: GeoPoint, delta: WorldPoint): GeoPoint {
  const p = toWorld(geo)
  return fromWorld({ x: p.x + delta.x, y: p.y + delta.y })
}

/**
 * Returns the patch that moves an item by a world-plane displacement.
 * Translating in world space keeps the item's shape and size intact at any latitude.
 */
export function translateItem(item: Item, delta: WorldPoint): Partial<Item> {
  const translate = (geo: GeoPoint) => translateGeo(geo, delta)

  if (item.type === 'arrow') {
    return item.via
      ? { from: translate(item.from), to: translate(item.to), via: translate(item.via) }
      : { from: translate(item.from), to: translate(item.to) }
  }

  if (item.type === 'ruler') {
    return { from: translate(item.from), to: translate(item.to) }
  }

  if (item.type === 'shape') {
    if (item.at) return { at: translate(item.at) }
    if ((item as any).from && (item as any).to) {
      return { from: translate((item as any).from), to: translate((item as any).to) }
    }
  }

  if (item.type === 'note') {
    if (item.at) return { at: translate(item.at) }
    if ((item as any).from && (item as any).to) {
      return { from: translate((item as any).from), to: translate((item as any).to) }
    }
  }

  if (item.type === 'freedraw') {
    return { points: item.points.map(translate) }
  }

  if (item.type === 'pen') {
    return {
      points: item.points.map((point) => ({
        at: translate(point.at),
        ...(point.in ? { in: translate(point.in) } : {}),
        ...(point.out ? { out: translate(point.out) } : {}),
      })),
    }
  }

  return { at: translate(item.at) }
}
