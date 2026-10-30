import type L from 'leaflet'
import type { Bounds, GeoPoint, Item, ScreenPoint } from '../../types/index.js'
import { getPenGeometryPoints } from '../../entities/pen/pen-geometry.js'
import { geoToScreen } from './coordinates.js'
import { getItemZoomScale } from './zoom.js'

export interface ScreenBounds {
  cx: number
  cy: number
  minX: number
  maxX: number
  minY: number
  maxY: number
  width: number
  height: number
}

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

function screenPointsBounds(points: { x: number; y: number }[]): ScreenBounds {
  if (points.length === 0) {
    return { cx: 0, cy: 0, minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 }
  }
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  return {
    cx: (minX + maxX) / 2,
    cy: (minY + maxY) / 2,
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

export function getItemBounds(map: L.Map, item: Item): ScreenBounds {
  if (item.type === 'arrow' || item.type === 'ruler') {
    const pts = [geoToScreen(map, item.from), geoToScreen(map, item.to)]
    if (item.type === 'arrow' && item.via) {
      pts.push(geoToScreen(map, item.via))
    }
    return screenPointsBounds(pts)
  }
  if (item.type === 'shape' || item.type === 'note') {
    const center = geoToScreen(map, item.at)
    const scale = getItemZoomScale(map, item)
    const baseWidth = item.type === 'shape' ? item.width : (item.width ?? item.height ?? 180)
    const baseHeight = item.type === 'shape' ? item.height : (item.height ?? item.width ?? 180)
    const halfW = (baseWidth * scale) / 2
    const halfH = (baseHeight * scale) / 2
    return {
      cx: center.x,
      cy: center.y,
      minX: center.x - halfW,
      maxX: center.x + halfW,
      minY: center.y - halfH,
      maxY: center.y + halfH,
      width: halfW * 2,
      height: halfH * 2,
    }
  }
  if (item.type === 'text') {
    const p = geoToScreen(map, item.at)
    return {
      cx: p.x + 50,
      cy: p.y + 6,
      minX: p.x,
      maxX: p.x + 100,
      minY: p.y - 12,
      maxY: p.y + 24,
      width: 100,
      height: 36,
    }
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
  return { cx: 0, cy: 0, minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 }
}

export function getSelectionScreenBounds(map: L.Map, items: Item[]): ScreenBounds | null {
  if (items.length === 0) return null
  const boxes = items.map((item) => getItemBounds(map, item))
  const minX = Math.min(...boxes.map((b) => b.minX))
  const maxX = Math.max(...boxes.map((b) => b.maxX))
  const minY = Math.min(...boxes.map((b) => b.minY))
  const maxY = Math.max(...boxes.map((b) => b.maxY))
  return {
    cx: (minX + maxX) / 2,
    cy: (minY + maxY) / 2,
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

export function findItemsInMarquee(
  map: L.Map,
  items: Item[],
  startPt: ScreenPoint,
  endPt: ScreenPoint,
): string[] {
  const minX = Math.min(startPt.x, endPt.x)
  const maxX = Math.max(startPt.x, endPt.x)
  const minY = Math.min(startPt.y, endPt.y)
  const maxY = Math.max(startPt.y, endPt.y)

  const matched: string[] = []
  for (const item of items) {
    const b = getItemBounds(map, item)
    if (b.maxX >= minX && b.minX <= maxX && b.maxY >= minY && b.minY <= maxY) {
      matched.push(item.id)
    }
  }
  return matched
}

