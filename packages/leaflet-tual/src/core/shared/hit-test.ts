import type L from 'leaflet'
import type { Bounds, GeoPoint, Item, ScreenPoint } from '../types/index.js'
import { defaultVia, geoToScreen, toWorld } from './coordinates.js'
import {
  distanceToCubicBezier,
  distanceToQuadraticBezier,
  distanceToSegment,
} from './distances.js'
import { getPenGeometryPoints, getPenSegments } from '../entities/pen/pen-geometry.js'

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
    case 'shape':
    case 'ruler': {
      return {
        minLat: Math.min(item.from.lat, item.to.lat),
        maxLat: Math.max(item.from.lat, item.to.lat),
        minLng: Math.min(item.from.lng, item.to.lng),
        maxLng: Math.max(item.from.lng, item.to.lng),
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
    case 'note': {
      if (item.from && item.to) {
        return {
          minLat: Math.min(item.from.lat, item.to.lat),
          maxLat: Math.max(item.from.lat, item.to.lat),
          minLng: Math.min(item.from.lng, item.to.lng),
          maxLng: Math.max(item.from.lng, item.to.lng),
        }
      }
      const delta = 0.0005
      const at = item.at ?? { lat: 0, lng: 0 }
      return {
        minLat: at.lat - delta,
        maxLat: at.lat + delta,
        minLng: at.lng - delta,
        maxLng: at.lng + delta,
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

export function hitTest(
  item: Item,
  point: ScreenPoint | GeoPoint,
  tolerance = 10,
  map?: L.Map | null,
): boolean {
  const isScreen = 'x' in point
  let pt: ScreenPoint

  if (isScreen) {
    pt = point as ScreenPoint
  } else if (map) {
    pt = geoToScreen(map, point as GeoPoint)
  } else {
    const w = toWorld(point as GeoPoint)
    pt = { x: w.x, y: w.y }
  }

  const project = (geo: GeoPoint): ScreenPoint => {
    if (map) return geoToScreen(map, geo)
    const w = toWorld(geo)
    return { x: w.x, y: w.y }
  }

  switch (item.type) {
    case 'arrow':
    case 'ruler': {
      const start = project(item.from)
      const end = project(item.to)
      if (item.type === 'arrow' && item.kind === 'curved') {
        const via = item.via ? project(item.via) : project(defaultVia(item.from, item.to))
        return distanceToQuadraticBezier(pt, start, via, end) <= tolerance
      }
      if (item.type === 'arrow' && item.kind === 'elbow') {
        const corner: ScreenPoint = { x: end.x, y: start.y }
        return (
          distanceToSegment(pt, start, corner) <= tolerance ||
          distanceToSegment(pt, corner, end) <= tolerance
        )
      }
      if (item.type === 'arrow' && item.kind === 's-curve') {
        const c1: ScreenPoint = { x: start.x + (end.x - start.x) * 0.5, y: start.y }
        const c2: ScreenPoint = { x: start.x + (end.x - start.x) * 0.5, y: end.y }
        return distanceToCubicBezier(pt, start, c1, c2, end) <= tolerance
      }
      return distanceToSegment(pt, start, end) <= tolerance
    }
    case 'shape': {
      const pFrom = project(item.from)
      const pTo = project(item.to)
      const minX = Math.min(pFrom.x, pTo.x)
      const maxX = Math.max(pFrom.x, pTo.x)
      const minY = Math.min(pFrom.y, pTo.y)
      const maxY = Math.max(pFrom.y, pTo.y)

      return (
        pt.x >= minX - tolerance &&
        pt.x <= maxX + tolerance &&
        pt.y >= minY - tolerance &&
        pt.y <= maxY + tolerance
      )
    }
    case 'freedraw': {
      if (item.points.length === 0) return false
      if (item.points.length === 1) {
        const p = project(item.points[0])
        return Math.hypot(pt.x - p.x, pt.y - p.y) <= tolerance
      }
      for (let i = 0; i < item.points.length - 1; i += 1) {
        const p1 = project(item.points[i])
        const p2 = project(item.points[i + 1])
        if (distanceToSegment(pt, p1, p2) <= tolerance) return true
      }
      return false
    }
    case 'pen': {
      if (item.points.length === 0) return false
      if (item.points.length === 1) {
        const p = project(item.points[0].at)
        return Math.hypot(pt.x - p.x, pt.y - p.y) <= tolerance
      }
      for (const segment of getPenSegments(item.points, item.closed)) {
        const from = project(segment.from)
        const control1 = project(segment.control1)
        const control2 = project(segment.control2)
        const to = project(segment.to)
        if (distanceToCubicBezier(pt, from, control1, control2, to) <= tolerance) {
          return true
        }
      }
      return false
    }
    case 'note': {
      if (item.from && item.to) {
        const p1 = project(item.from)
        const p2 = project(item.to)
        const minX = Math.min(p1.x, p2.x)
        const maxX = Math.max(p1.x, p2.x)
        const minY = Math.min(p1.y, p2.y)
        const maxY = Math.max(p1.y, p2.y)
        return (
          pt.x >= minX - tolerance &&
          pt.x <= maxX + tolerance &&
          pt.y >= minY - tolerance &&
          pt.y <= maxY + tolerance
        )
      }
      if (item.at) {
        const anchor = project(item.at)
        const hw = (item.width ?? 180) / 2
        const hh = (item.height ?? 120) / 2
        return (
          pt.x >= anchor.x - hw - tolerance &&
          pt.x <= anchor.x + hw + tolerance &&
          pt.y >= anchor.y - hh - tolerance &&
          pt.y <= anchor.y + hh + tolerance
        )
      }
      return false
    }
    case 'text': {
      const anchor = project(item.at)
      return Math.hypot(pt.x - anchor.x, pt.y - anchor.y) <= Math.max(tolerance, 24)
    }
  }
}

