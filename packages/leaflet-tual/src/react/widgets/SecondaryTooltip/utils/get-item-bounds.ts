import type L from 'leaflet'
import type { GeoPoint, Item } from '../../../../core/types/index.js'
import { geoToScreen } from '../../../../core/shared/geometry/geo.js'
import { getItemZoomScale } from '../../../../core/shared/geometry/zoom.js'

export function getItemBounds(map: L.Map, item: Item) {
  if (item.type === 'arrow' || item.type === 'ruler') {
    const p1 = geoToScreen(map, item.from)
    const p2 = geoToScreen(map, item.to)
    return {
      cx: (p1.x + p2.x) / 2,
      minY: Math.min(p1.y, p2.y),
      maxY: Math.max(p1.y, p2.y),
    }
  }
  if (item.type === 'shape') {
    if (item.at) {
      const center = geoToScreen(map, item.at)
      const scale = getItemZoomScale(map, item)
      const halfH = (item.height * scale) / 2
      return {
        cx: center.x,
        minY: center.y - halfH,
        maxY: center.y + halfH,
      }
    }
    const legacy = item as unknown as { from?: GeoPoint; to?: GeoPoint }
    if (legacy.from && legacy.to) {
      const p1 = geoToScreen(map, legacy.from)
      const p2 = geoToScreen(map, legacy.to)
      return {
        cx: (p1.x + p2.x) / 2,
        minY: Math.min(p1.y, p2.y),
        maxY: Math.max(p1.y, p2.y),
      }
    }
  }
  if (item.type === 'note') {
    if (item.at) {
      const p = geoToScreen(map, item.at)
      const scale = getItemZoomScale(map, item)
      const baseHeight = item.height ?? item.width ?? 180
      const half = (baseHeight * scale) / 2
      return { cx: p.x, minY: p.y - half, maxY: p.y + half }
    }
    const legacy = item as unknown as { from?: GeoPoint; to?: GeoPoint }
    if (legacy.from && legacy.to) {
      const p1 = geoToScreen(map, legacy.from)
      const p2 = geoToScreen(map, legacy.to)
      return {
        cx: (p1.x + p2.x) / 2,
        minY: Math.min(p1.y, p2.y),
        maxY: Math.max(p1.y, p2.y),
      }
    }
  }
  if (item.type === 'text') {
    const p = geoToScreen(map, item.at)
    return { cx: p.x + 50, minY: p.y - 12, maxY: p.y + 24 }
  }
  if (item.type === 'freedraw' && item.points.length > 0) {
    const screenPoints = item.points.map((p) => geoToScreen(map, p))
    const ys = screenPoints.map((p) => p.y)
    const xs = screenPoints.map((p) => p.x)
    return {
      cx: (Math.min(...xs) + Math.max(...xs)) / 2,
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    }
  }
  if (item.type === 'pen' && item.points.length > 0) {
    const screenPoints = item.points.flatMap((point) =>
      [point.at, point.in, point.out]
        .filter((p): p is NonNullable<typeof p> => Boolean(p))
        .map((p) => geoToScreen(map, p)),
    )
    const ys = screenPoints.map((p) => p.y)
    const xs = screenPoints.map((p) => p.x)
    return {
      cx: (Math.min(...xs) + Math.max(...xs)) / 2,
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    }
  }
  return { cx: 0, minY: 0, maxY: 0 }
}

