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
      if (item.at) {
        const center = project(item.at)
        let scale = 1
        if (map && item.baseZoom != null) {
          scale = Math.pow(2, map.getZoom() - item.baseZoom)
        }
        const halfW = (item.width * scale) / 2
        const halfH = (item.height * scale) / 2

        return (
          pt.x >= center.x - halfW - tolerance &&
          pt.x <= center.x + halfW + tolerance &&
          pt.y >= center.y - halfH - tolerance &&
          pt.y <= center.y + halfH + tolerance
        )
      } else if ((item as any).from && (item as any).to) {
        const a = project((item as any).from)
        const b = project((item as any).to)
        return (
          pt.x >= Math.min(a.x, b.x) - tolerance &&
          pt.x <= Math.max(a.x, b.x) + tolerance &&
          pt.y >= Math.min(a.y, b.y) - tolerance &&
          pt.y <= Math.max(a.y, b.y) + tolerance
        )
      }
      return false
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
      const anchor = project(item.at)
      let scale = 1
      if (map && item.baseZoom != null) {
        scale = Math.pow(2, map.getZoom() - item.baseZoom)
      }
      const side = Math.max(item.width ?? 180, item.height ?? 180) * scale
      const half = side / 2
      return (
        pt.x >= anchor.x - half - tolerance &&
        pt.x <= anchor.x + half + tolerance &&
        pt.y >= anchor.y - half - tolerance &&
        pt.y <= anchor.y + half + tolerance
      )
    }
    case 'text': {
      const anchor = project(item.at)
      return Math.hypot(pt.x - anchor.x, pt.y - anchor.y) <= Math.max(tolerance, 24)
    }
  }
}

