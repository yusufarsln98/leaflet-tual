import type L from 'leaflet'
import type { Bounds, GeoPoint, Item } from '../../types/index.js'
import { getPenGeometryPoints } from '../../entities/pen/pen-geometry.js'
import { geoToScreen } from './coordinates.js'
import { getItemZoomScale } from './zoom.js'

function pointsBounds(points: GeoPoint[]): Bounds {
  if (points.length === 0) return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 }
  const lats = points.map((p) => p.lat)
  const lngs = points.map((p) => p.lng)
  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
  }
}

export function bounds(item: Item): Bounds {
  switch (item.type) {
    case 'arrow':
      return pointsBounds(item.via ? [item.from, item.to, item.via] : [item.from, item.to])
    case 'ruler':
      return pointsBounds([item.from, item.to])
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
    case 'freedraw':
      return pointsBounds(item.points)
    case 'pen':
      return pointsBounds(getPenGeometryPoints(item))
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

function screenPointsBounds(points: { x: number; y: number }[]) {
  if (points.length === 0) return { cx: 0, minY: 0, maxY: 0 }
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  return {
    cx: (Math.min(...xs) + Math.max(...xs)) / 2,
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  }
}

export function getItemBounds(map: L.Map, item: Item) {
  if (item.type === 'arrow' || item.type === 'ruler') {
    return screenPointsBounds([geoToScreen(map, item.from), geoToScreen(map, item.to)])
  }
  if (item.type === 'shape' || item.type === 'note') {
    const center = geoToScreen(map, item.at)
    const scale = getItemZoomScale(map, item)
    const baseHeight = item.type === 'shape' ? item.height : (item.height ?? item.width ?? 180)
    const halfH = (baseHeight * scale) / 2
    return { cx: center.x, minY: center.y - halfH, maxY: center.y + halfH }
  }
  if (item.type === 'text') {
    const p = geoToScreen(map, item.at)
    return { cx: p.x + 50, minY: p.y - 12, maxY: p.y + 24 }
  }
  if (item.type === 'freedraw') {
    return screenPointsBounds(item.points.map((p) => geoToScreen(map, p)))
  }
  if (item.type === 'pen') {
    const screenPoints = item.points.flatMap((pt) =>
      [pt.at, pt.in, pt.out]
        .filter((p): p is GeoPoint => Boolean(p))
        .map((p) => geoToScreen(map, p)),
    )
    return screenPointsBounds(screenPoints)
  }
  return { cx: 0, minY: 0, maxY: 0 }
}

