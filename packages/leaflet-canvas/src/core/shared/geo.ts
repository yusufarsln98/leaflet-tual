import type L from 'leaflet'
import type { GeoPoint, ScreenPoint } from '../types/index.js'

let idCounter = 0

export function createId(prefix = 'rlc'): string {
  idCounter += 1
  const randomPart = Math.random().toString(36).slice(2, 8)
  return `${prefix}-${Date.now().toString(36)}-${idCounter}-${randomPart}`
}

export function geoToScreen(map: L.Map, point: GeoPoint): ScreenPoint {
  const containerPt = map.latLngToContainerPoint([point.lat, point.lng])
  return { x: containerPt.x, y: containerPt.y }
}

export function screenToGeo(map: L.Map, point: ScreenPoint): GeoPoint {
  const latLng = map.containerPointToLatLng([point.x, point.y])
  return { lat: latLng.lat, lng: latLng.lng }
}

export function constrainToAspectRatio(
  anchor: ScreenPoint,
  target: ScreenPoint,
  aspectRatio = 1,
): ScreenPoint {
  const safeRatio = aspectRatio > 0 ? aspectRatio : 1
  const dx = target.x - anchor.x
  const dy = target.y - anchor.y
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)
  const signX = dx >= 0 ? 1 : -1
  const signY = dy >= 0 ? 1 : -1

  if (absDx / safeRatio >= absDy) {
    return {
      x: anchor.x + signX * absDx,
      y: anchor.y + signY * (absDx / safeRatio),
    }
  }
  return {
    x: anchor.x + signX * (absDy * safeRatio),
    y: anchor.y + signY * absDy,
  }
}

export function constrainAngleTo45Degrees(
  anchor: ScreenPoint,
  target: ScreenPoint,
): ScreenPoint {
  const dx = target.x - anchor.x
  const dy = target.y - anchor.y
  const dist = Math.hypot(dx, dy)
  if (dist === 0) return target
  const angle = Math.atan2(dy, dx)
  const snapStep = Math.PI / 4
  const snappedAngle = Math.round(angle / snapStep) * snapStep
  return {
    x: anchor.x + Math.cos(snappedAngle) * dist,
    y: anchor.y + Math.sin(snappedAngle) * dist,
  }
}

export function computeDefaultControlGeoPoint(
  start: GeoPoint,
  end: GeoPoint,
  curvature = 0.25,
): GeoPoint {
  const midLat = (start.lat + end.lat) / 2
  const midLng = (start.lng + end.lng) / 2
  const dLat = end.lat - start.lat
  const dLng = end.lng - start.lng
  return {
    lat: midLat + dLng * curvature,
    lng: midLng - dLat * curvature,
  }
}

export function getQuadraticBezierPoint(
  p0: ScreenPoint,
  p1: ScreenPoint,
  p2: ScreenPoint,
  t: number,
): ScreenPoint {
  const invT = 1 - t
  return {
    x: invT * invT * p0.x + 2 * invT * t * p1.x + t * t * p2.x,
    y: invT * invT * p0.y + 2 * invT * t * p1.y + t * t * p2.y,
  }
}

export function getQuadraticEndAngle(
  p0: ScreenPoint,
  p1: ScreenPoint,
  p2: ScreenPoint,
): number {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  if (Math.hypot(dx, dy) < 0.001) {
    return Math.atan2(p2.y - p0.y, p2.x - p0.x)
  }
  return Math.atan2(dy, dx)
}

export function distanceToSegment(
  p: ScreenPoint,
  v: ScreenPoint,
  w: ScreenPoint,
): number {
  const l2 = (w.x - v.x) ** 2 + (w.y - v.y) ** 2
  if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y)
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2
  t = Math.max(0, Math.min(1, t))
  const projX = v.x + t * (w.x - v.x)
  const projY = v.y + t * (w.y - v.y)
  return Math.hypot(p.x - projX, p.y - projY)
}

export function distanceToQuadraticBezier(
  p: ScreenPoint,
  p0: ScreenPoint,
  p1: ScreenPoint,
  p2: ScreenPoint,
  steps = 24,
): number {
  let minDistance = Infinity
  let prev = p0
  for (let i = 1; i <= steps; i += 1) {
    const curr = getQuadraticBezierPoint(p0, p1, p2, i / steps)
    const dist = distanceToSegment(p, prev, curr)
    if (dist < minDistance) minDistance = dist
    prev = curr
  }
  return minDistance
}

export function getMapDimensions(
  map: L.Map | null | undefined,
): { width: number; height: number } | null {
  if (!map) return null
  try {
    const size = map.getSize?.()
    if (size && size.x > 0 && size.y > 0) return { width: size.x, height: size.y }
  } catch { /* ignore */ }
  try {
    const rect = map.getContainer?.()?.getBoundingClientRect?.()
    if (rect && rect.width > 0 && rect.height > 0) return { width: rect.width, height: rect.height }
  } catch { /* ignore */ }
  return null
}

export function truncateCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string {
  if (!text || maxWidth <= 0) return ''
  if (ctx.measureText(text).width <= maxWidth) return text

  const ellipsis = '…'
  if (ctx.measureText(ellipsis).width >= maxWidth) return ''

  let low = 0
  let high = text.length
  let best = ''
  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    const candidate = text.slice(0, mid) + ellipsis
    if (ctx.measureText(candidate).width <= maxWidth) {
      best = candidate
      low = mid + 1
    } else {
      high = mid - 1
    }
  }
  return best || ellipsis
}

export function calculateZoomFontSize(
  initialFontSize = 16,
  currentZoom: number | null,
  baseZoom = 14,
  options?: { min?: number; max?: number; scaleFactor?: number },
): number {
  if (currentZoom === null || typeof currentZoom !== 'number') return initialFontSize
  const factor = options?.scaleFactor ?? 1.22
  const min = options?.min ?? 9
  const max = options?.max ?? 72
  const scaled = initialFontSize * Math.pow(factor, currentZoom - baseZoom)
  return Math.round(Math.max(min, Math.min(max, scaled)))
}

export function calculateGeodesicDistance(p1: GeoPoint, p2: GeoPoint): number {
  const R = 6371000 // Earth radius in meters
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180
  const lat1 = (p1.lat * Math.PI) / 180
  const lat2 = (p2.lat * Math.PI) / 180

  const sinDLat = Math.sin(dLat / 2)
  const sinDLng = Math.sin(dLng / 2)
  const a = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function formatRealWorldDistance(
  meters: number,
  unit: 'metric' | 'imperial' = 'metric',
): string {
  if (unit === 'imperial') {
    const feet = meters * 3.28084
    if (feet < 1000) {
      return `${Math.round(feet)} ft`
    }
    const miles = feet / 5280
    return `${miles >= 10 ? miles.toFixed(1) : miles.toFixed(2)} mi`
  }

  if (meters < 1000) {
    return `${Math.round(meters)} m`
  }
  const km = meters / 1000
  return `${km >= 10 ? km.toFixed(1) : km.toFixed(2)} km`
}

export function calculateLineDistance(points: GeoPoint[]): number {
  let total = 0
  for (let i = 0; i < points.length - 1; i += 1) {
    total += calculateGeodesicDistance(points[i], points[i + 1])
  }
  return total
}
