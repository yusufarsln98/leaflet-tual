import type L from 'leaflet'
import type { GeoPoint, ScreenPoint } from '../types/index.js'
import type { Item } from '../../entities/item/types.js'
import { defaultVia, geoToScreen, toWorld } from './coordinates.js'
import {
  distanceToCubicBezier,
  distanceToQuadraticBezier,
  distanceToSegment,
  getQuadraticBezierPoint,
} from './distances/index.js'
import { getPenSegments } from '../../features/drawing-tools/pen/pen-geometry.js'
import { resolveWidth } from '../theme/theme.js'
import { getItemZoomScale } from './zoom.js'

const STROKE_HIT_PADDING = 4

function getStrokeHitRadius(item: Item, map: L.Map | null | undefined, tolerance: number): number {
  const scale = getItemZoomScale(map, item)
  const lineWidth = Math.max(1, resolveWidth(item.style?.width ?? 'm') * scale)
  return lineWidth / 2 + Math.max(0, tolerance) + STROKE_HIT_PADDING
}

export function hitTest(
  item: Item,
  point: ScreenPoint | GeoPoint,
  tolerance = 0,
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
      const scale = map && item.baseZoom != null ? Math.pow(2, map.getZoom() - item.baseZoom) : 1
      const baseLineWidth = item.style?.width === 'l' ? 5 : item.style?.width === 's' ? 2 : 3.5
      const lineWidth = Math.max(1, baseLineWidth * scale)
      const strokeRadius = lineWidth / 2 + Math.max(0, tolerance)

      if (item.type === 'arrow') {
        const heads = item.heads ?? { start: 'none', end: 'triangle' }
        const headBase = item.style?.width === 'l' ? 18 : item.style?.width === 's' ? 10 : 14
        const headSize = Math.max(4, headBase * scale)
        if (heads.start && heads.start !== 'none') {
          if (Math.hypot(pt.x - start.x, pt.y - start.y) <= headSize + tolerance) {
            return true
          }
        }
        if (heads.end && heads.end !== 'none') {
          if (Math.hypot(pt.x - end.x, pt.y - end.y) <= headSize + tolerance) {
            return true
          }
        }
      }

      if (item.type === 'arrow' && item.label) {
        let labelCenter: ScreenPoint
        if (item.kind === 'curved') {
          const via = project(item.via ?? defaultVia(item.from, item.to))
          labelCenter = getQuadraticBezierPoint(start, via, end, 0.5)
        } else if (item.kind === 'elbow') {
          const corner: ScreenPoint = { x: end.x, y: start.y }
          labelCenter = { x: (corner.x + end.x) / 2, y: (corner.y + end.y) / 2 }
        } else {
          labelCenter = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 }
        }
        const fontSize = 12 * scale
        const halfW = (item.label.length * fontSize * 0.55 + 8) / 2
        const halfH = (fontSize + 6) / 2
        if (
          Math.abs(pt.x - labelCenter.x) <= halfW + tolerance &&
          Math.abs(pt.y - labelCenter.y) <= halfH + tolerance
        ) {
          return true
        }
      }
      if (item.type === 'arrow' && item.kind === 'curved') {
        const via = project(item.via ?? defaultVia(item.from, item.to))
        return distanceToQuadraticBezier(pt, start, via, end) <= strokeRadius
      }
      if (item.type === 'arrow' && item.kind === 'elbow') {
        const corner: ScreenPoint = { x: end.x, y: start.y }
        return (
          distanceToSegment(pt, start, corner) <= strokeRadius ||
          distanceToSegment(pt, corner, end) <= strokeRadius
        )
      }
      return distanceToSegment(pt, start, end) <= strokeRadius
    }
    case 'shape':
    case 'note': {
      const center = project(item.at)
      const scale = map && item.baseZoom != null ? Math.pow(2, map.getZoom() - item.baseZoom) : 1
      const w = item.type === 'shape' ? item.width : (item.width ?? item.height ?? 180)
      const h = item.type === 'shape' ? item.height : (item.height ?? item.width ?? 180)
      const halfW = (w * scale) / 2
      const halfH = (h * scale) / 2

      if (
        pt.x < center.x - halfW - tolerance ||
        pt.x > center.x + halfW + tolerance ||
        pt.y < center.y - halfH - tolerance ||
        pt.y > center.y + halfH + tolerance
      ) {
        return false
      }

      if (item.type === 'shape') {
        if (item.kind === 'circle') {
          const dx = (pt.x - center.x) / (halfW + tolerance)
          const dy = (pt.y - center.y) / (halfH + tolerance)
          return dx * dx + dy * dy <= 1
        }
        if (item.kind === 'diamond') {
          const dx = Math.abs(pt.x - center.x) / (halfW + tolerance)
          const dy = Math.abs(pt.y - center.y) / (halfH + tolerance)
          return dx + dy <= 1
        }
        if (item.kind === 'triangle') {
          const p1 = { x: center.x, y: center.y - halfH }
          const p2 = { x: center.x + halfW, y: center.y + halfH }
          const p3 = { x: center.x - halfW, y: center.y + halfH }
          const d1 = (pt.x - p2.x) * (p1.y - p2.y) - (p1.x - p2.x) * (pt.y - p2.y)
          const d2 = (pt.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (pt.y - p3.y)
          const d3 = (pt.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (pt.y - p1.y)
          const hasNeg = d1 < -tolerance || d2 < -tolerance || d3 < -tolerance
          const hasPos = d1 > tolerance || d2 > tolerance || d3 > tolerance
          return !(hasNeg && hasPos)
        }
      }
      return true
    }
    case 'freedraw': {
      if (item.points.length === 0) return false
      const hitRadius = getStrokeHitRadius(item, map, tolerance)
      const screenPoints = item.points.map(project)
      if (screenPoints.length === 1) {
        return Math.hypot(pt.x - screenPoints[0].x, pt.y - screenPoints[0].y) <= hitRadius
      }
      if (screenPoints.length === 2) {
        return distanceToSegment(pt, screenPoints[0], screenPoints[1]) <= hitRadius
      }

      // Mirror the smoothed stroke rendered on the canvas so the hit target
      // follows the visible curve instead of the raw pointer samples.
      let segmentStart = screenPoints[0]
      for (let i = 1; i < screenPoints.length - 1; i += 1) {
        const control = screenPoints[i]
        const next = screenPoints[i + 1]
        const segmentEnd = { x: (control.x + next.x) / 2, y: (control.y + next.y) / 2 }
        if (distanceToQuadraticBezier(pt, segmentStart, control, segmentEnd) <= hitRadius) {
          return true
        }
        segmentStart = segmentEnd
      }
      return distanceToSegment(pt, segmentStart, screenPoints[screenPoints.length - 1]) <= hitRadius
    }
    case 'pen': {
      if (item.points.length === 0) return false
      const hitRadius = getStrokeHitRadius(item, map, tolerance)
      if (item.points.length === 1) {
        const p = project(item.points[0].at)
        return Math.hypot(pt.x - p.x, pt.y - p.y) <= hitRadius
      }
      for (const seg of getPenSegments(item.points, item.closed)) {
        if (
          distanceToCubicBezier(
            pt,
            project(seg.from),
            project(seg.control1),
            project(seg.control2),
            project(seg.to),
          ) <= hitRadius
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
    case 'area': {
      if (item.points.length < 3) return false
      const screenPts = item.points.map(project)
      // Point-in-polygon ray casting test
      let inside = false
      for (let i = 0, j = screenPts.length - 1; i < screenPts.length; j = i++) {
        const xi = screenPts[i].x
        const yi = screenPts[i].y
        const xj = screenPts[j].x
        const yj = screenPts[j].y
        const intersect =
          yi > pt.y !== yj > pt.y && pt.x < ((xj - xi) * (pt.y - yi)) / (yj - yi) + xi
        if (intersect) inside = !inside
      }
      if (inside) return true
      // Perimeter distance test
      for (let i = 0, j = screenPts.length - 1; i < screenPts.length; j = i++) {
        if (distanceToSegment(pt, screenPts[j], screenPts[i]) <= tolerance) {
          return true
        }
      }
      return false
    }
    default:
      return false
  }
}
