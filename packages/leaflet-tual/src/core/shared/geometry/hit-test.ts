import type L from 'leaflet'
import type { GeoPoint, Item, ScreenPoint } from '../../types/index.js'
import { defaultVia, geoToScreen, toWorld } from './coordinates.js'
import {
  distanceToCubicBezier,
  distanceToQuadraticBezier,
  distanceToSegment,
} from './distances.js'
import { getPenSegments } from '../../entities/pen/pen-geometry.js'
export { bounds } from './bounds.js'

export function hitTest(
  item: Item,
  point: ScreenPoint | GeoPoint,
  tolerance = 10,
  map?: L.Map | null,
): boolean {
  const project = (geo: GeoPoint): ScreenPoint => {
    if (map) return geoToScreen(map, geo)
    const w = toWorld(geo)
    return { x: w.x, y: w.y }
  }

  const pt: ScreenPoint = 'x' in point ? point : project(point)

  switch (item.type) {
    case 'arrow':
    case 'ruler': {
      const start = project(item.from)
      const end = project(item.to)
      if (item.type === 'arrow' && item.kind === 'curved') {
        const via = project(item.via ?? defaultVia(item.from, item.to))
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
        const midX = start.x + (end.x - start.x) * 0.5
        return (
          distanceToCubicBezier(pt, start, { x: midX, y: start.y }, { x: midX, y: end.y }, end) <=
          tolerance
        )
      }
      return distanceToSegment(pt, start, end) <= tolerance
    }
    case 'shape':
    case 'note': {
      const center = project(item.at)
      const scale = map && item.baseZoom != null ? Math.pow(2, map.getZoom() - item.baseZoom) : 1
      const w = item.type === 'shape' ? item.width : (item.width ?? item.height ?? 180)
      const h = item.type === 'shape' ? item.height : (item.height ?? item.width ?? 180)
      const halfW = (w * scale) / 2
      const halfH = (h * scale) / 2
      return (
        pt.x >= center.x - halfW - tolerance &&
        pt.x <= center.x + halfW + tolerance &&
        pt.y >= center.y - halfH - tolerance &&
        pt.y <= center.y + halfH + tolerance
      )
    }
    case 'freedraw': {
      if (item.points.length === 0) return false
      if (item.points.length === 1) {
        const p = project(item.points[0])
        return Math.hypot(pt.x - p.x, pt.y - p.y) <= tolerance
      }
      for (let i = 0; i < item.points.length - 1; i += 1) {
        if (distanceToSegment(pt, project(item.points[i]), project(item.points[i + 1])) <= tolerance) {
          return true
        }
      }
      return false
    }
    case 'pen': {
      if (item.points.length === 0) return false
      if (item.points.length === 1) {
        const p = project(item.points[0].at)
        return Math.hypot(pt.x - p.x, pt.y - p.y) <= tolerance
      }
      for (const seg of getPenSegments(item.points, item.closed)) {
        if (
          distanceToCubicBezier(
            pt,
            project(seg.from),
            project(seg.control1),
            project(seg.control2),
            project(seg.to),
          ) <= tolerance
        ) {
          return true
        }
      }
      return false
    }
    case 'text': {
      const anchor = project(item.at)
      return Math.hypot(pt.x - anchor.x, pt.y - anchor.y) <= Math.max(tolerance, 24)
    }
  }
}


