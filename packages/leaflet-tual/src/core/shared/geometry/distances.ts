import type { GeoPoint, ScreenPoint } from '../../types/index.js'

const DEG_TO_RAD = Math.PI / 180

export function distance(a: GeoPoint, b: GeoPoint): number {
  const dLat = (b.lat - a.lat) * DEG_TO_RAD
  const dLng = (b.lng - a.lng) * DEG_TO_RAD
  const lat1 = a.lat * DEG_TO_RAD
  const lat2 = b.lat * DEG_TO_RAD

  const sinHalfLat = Math.sin(dLat / 2)
  const sinHalfLng = Math.sin(dLng / 2)

  const h =
    sinHalfLat * sinHalfLat +
    Math.cos(lat1) * Math.cos(lat2) * sinHalfLng * sinHalfLng

  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

export function pathDistance(points: GeoPoint[]): number {
  let total = 0
  for (let i = 0; i < points.length - 1; i += 1) {
    total += distance(points[i], points[i + 1])
  }
  return total
}

export function formatDistance(
  meters: number,
  unit: 'metric' | 'imperial' = 'metric',
): string {
  if (unit === 'imperial') {
    const feet = meters * 3.28084
    if (feet < 1000) return `${Math.round(feet)} ft`
    const miles = feet / 5280
    return `${miles >= 10 ? miles.toFixed(1) : miles.toFixed(2)} mi`
  }
  if (meters < 1000) return `${Math.round(meters)} m`
  const km = meters / 1000
  return `${km >= 10 ? km.toFixed(1) : km.toFixed(2)} km`
}

export function distanceToSegment(
  p: ScreenPoint,
  a: ScreenPoint,
  b: ScreenPoint,
): number {
  const l2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2
  if (l2 === 0) return Math.hypot(p.x - a.x, p.y - a.y)

  let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2
  t = Math.max(0, Math.min(1, t))

  const projX = a.x + t * (b.x - a.x)
  const projY = a.y + t * (b.y - a.y)

  return Math.hypot(p.x - projX, p.y - projY)
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

export function distanceToQuadraticBezier(
  p: ScreenPoint,
  p0: ScreenPoint,
  p1: ScreenPoint,
  p2: ScreenPoint,
  samples = 24,
): number {
  let minD = Infinity
  let prev = p0
  for (let i = 1; i <= samples; i += 1) {
    const curr = getQuadraticBezierPoint(p0, p1, p2, i / samples)
    const d = distanceToSegment(p, prev, curr)
    if (d < minD) minD = d
    prev = curr
  }
  return minD
}

export function getCubicBezierPoint(
  p0: ScreenPoint,
  p1: ScreenPoint,
  p2: ScreenPoint,
  p3: ScreenPoint,
  t: number,
): ScreenPoint {
  const invT = 1 - t
  return {
    x:
      invT ** 3 * p0.x +
      3 * invT ** 2 * t * p1.x +
      3 * invT * t ** 2 * p2.x +
      t ** 3 * p3.x,
    y:
      invT ** 3 * p0.y +
      3 * invT ** 2 * t * p1.y +
      3 * invT * t ** 2 * p2.y +
      t ** 3 * p3.y,
  }
}

export function distanceToCubicBezier(
  p: ScreenPoint,
  p0: ScreenPoint,
  p1: ScreenPoint,
  p2: ScreenPoint,
  p3: ScreenPoint,
  samples = 24,
): number {
  let minD = Infinity
  let prev = p0
  for (let i = 1; i <= samples; i += 1) {
    const curr = getCubicBezierPoint(p0, p1, p2, p3, i / samples)
    const d = distanceToSegment(p, prev, curr)
    if (d < minD) minD = d
    prev = curr
  }
  return minD
}

