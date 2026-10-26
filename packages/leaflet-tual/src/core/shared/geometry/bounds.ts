import type L from 'leaflet'
import type { Bounds, GeoPoint, Item } from '../../types/index.js'
import { getPenGeometryPoints } from '../../entities/pen/pen-geometry.js'
import { geoToScreen } from './coordinates.js'
import { getItemZoomScale } from './zoom.js'

export function bounds(item: Item): Bounds {
  switch (item.type) {
    case 'arrow': {
      const lats = [item.from.lat, item.to.lat]
      const lngs = [item.from.lng, item.to.lng]
      if (item.via) {
        lats.push(item.via.lat)
        lngs.push(item.via.lng)
      }
      return {
        minLat: Math.min(...lats),
        maxLat: Math.max(...lats),
        minLng: Math.min(...lngs),
        maxLng: Math.max(...lngs),
      }
    }
    case 'ruler': {
      return {
        minLat: Math.min(item.from.lat, item.to.lat),
        maxLat: Math.max(item.from.lat, item.to.lat),
        minLng: Math.min(item.from.lng, item.to.lng),
        maxLng: Math.max(item.from.lng, item.to.lng),
      }
    }
    case 'shape':
    case 'note': {
      const delta = 0.001
      return {
        minLat: item.at.lat - delta,
        maxLat: item.at.lat + delta,
        minLng: item.at.lng - delta,
        maxLng: item.at.lng + delta,
      }
    }
    case 'freedraw': {
      if (item.points.length === 0) {
        return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 }
      }
      const lats = item.points.map((p) => p.lat)
      const lngs = item.points.map((p) => p.lng)
      return {
        minLat: Math.min(...lats),
        maxLat: Math.max(...lats),
        minLng: Math.min(...lngs),
        maxLng: Math.max(...lngs),
      }
    }
    case 'pen': {
      const points = getPenGeometryPoints(item)
      if (points.length === 0) {
        return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 }
      }
      const lats = points.map((p) => p.lat)
      const lngs = points.map((p) => p.lng)
      return {
        minLat: Math.min(...lats),
        maxLat: Math.max(...lats),
        minLng: Math.min(...lngs),
        maxLng: Math.max(...lngs),
      }
    }
    case 'text': {
      const delta = 0.0005
      return {
        minLat: item.at.lat - delta,
        maxLat: item.at.lat + delta,
        minLng: item.at.lng - delta,
        maxLng: item.at.lng + delta,
      }
    }
  }
}

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

export const getItemScreenBounds = getItemBounds
