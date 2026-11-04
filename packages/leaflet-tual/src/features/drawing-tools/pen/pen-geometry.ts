import type { PenItem, PenPoint } from '../../../entities/index.js'
import type { GeoPoint, ScreenPoint } from '../../../shared/types/index.js'

export interface PenDraftState {
  type: 'pen-draft'
  points: PenPoint[]
  activeIndex: number | null
  dragging: boolean
  currentPt: ScreenPoint
  currentGeo: GeoPoint
}

export function updatePenDraftOnMove<T extends PenDraftState>(
  gesture: T,
  pt: ScreenPoint,
  geo: GeoPoint,
): T {
  const points =
    gesture.dragging && gesture.activeIndex !== null
      ? gesture.points.map((point, index) => {
          if (index !== gesture.activeIndex) return point
          return {
            at: point.at,
            in: {
              lat: point.at.lat * 2 - geo.lat,
              lng: point.at.lng * 2 - geo.lng,
            },
            out: geo,
          }
        })
      : gesture.points

  return { ...gesture, points, currentPt: pt, currentGeo: geo }
}

/** One cubic segment of a pen path, expressed in geographic coordinates. */
export interface PenSegment {
  from: GeoPoint
  control1: GeoPoint
  control2: GeoPoint
  to: GeoPoint
}

/**
 * Expands a pen path into cubic segments. Anchors without handles produce
 * straight segments because both control points collapse onto the anchors.
 */
export function getPenSegments(
  points: PenPoint[],
  closed = false,
): PenSegment[] {
  if (points.length < 2) return []

  const segmentCount = closed ? points.length : points.length - 1
  const segments: PenSegment[] = []

  for (let i = 0; i < segmentCount; i += 1) {
    const from = points[i]
    const to = points[(i + 1) % points.length]
    segments.push({
      from: from.at,
      control1: from.out ?? from.at,
      control2: to.in ?? to.at,
      to: to.at,
    })
  }

  return segments
}

/** Every geographic point that influences a pen path's bounds. */
export function getPenGeometryPoints(item: PenItem): GeoPoint[] {
  const points: GeoPoint[] = []
  for (const point of item.points) {
    points.push(point.at)
    if (point.in) points.push(point.in)
    if (point.out) points.push(point.out)
  }
  return points
}
