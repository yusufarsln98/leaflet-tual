import type L from 'leaflet'
import type { GeoPoint, PenItem, PenPoint, ScreenPoint } from '../../../core/index.js'
import { fromWorld, geoToScreen, toWorld } from '../../../core/index.js'
import { translateGeo, worldDelta } from '../../../core/shared/translate.js'

export type PenHandleType = 'anchor' | 'in' | 'out'

export interface PenHandle {
  pointIndex: number
  type: PenHandleType
  x: number
  y: number
  cursor: string
}

/** Returns the anchor and control handles that are visible while a pen is selected. */
export function getPenScreenHandles(map: L.Map, pen: PenItem): PenHandle[] {
  const handles: PenHandle[] = []

  pen.points.forEach((point, pointIndex) => {
    const anchor = geoToScreen(map, point.at)
    handles.push({
      pointIndex,
      type: 'anchor',
      x: anchor.x,
      y: anchor.y,
      cursor: 'move',
    })

    for (const type of ['in', 'out'] as const) {
      const control = point[type]
      if (!control) continue
      const screen = geoToScreen(map, control)
      handles.push({
        pointIndex,
        type,
        x: screen.x,
        y: screen.y,
        cursor: 'crosshair',
      })
    }
  })

  return handles
}

export function hitTestPenHandle(
  map: L.Map,
  pen: PenItem,
  pt: ScreenPoint,
  radius = 8,
): PenHandle | null {
  const handles = getPenScreenHandles(map, pen)
  // Anchors win ties so a collapsed control point cannot steal the anchor.
  for (const h of handles) {
    if (h.type !== 'anchor') continue
    if (Math.hypot(pt.x - h.x, pt.y - h.y) <= radius) return h
  }
  for (const h of handles) {
    if (h.type === 'anchor') continue
    if (Math.hypot(pt.x - h.x, pt.y - h.y) <= radius) return h
  }
  return null
}

/** Mirror a control point across its anchor in the zoom-independent plane. */
export function mirrorPenControl(anchor: GeoPoint, control: GeoPoint): GeoPoint {
  const a = toWorld(anchor)
  const c = toWorld(control)
  return fromWorld({ x: a.x * 2 - c.x, y: a.y * 2 - c.y })
}

/**
 * Returns the edited point list for a dragged anchor or bezier control handle.
 * Dragging an anchor moves its handles with it. Dragging one control mirrors
 * the opposite handle so the curve stays smooth.
 */
export function editPenPointList(
  initialPoints: PenPoint[],
  pointIndex: number,
  handle: PenHandleType,
  startGeo: GeoPoint,
  currentGeo: GeoPoint,
): PenPoint[] {
  if (handle === 'anchor') {
    const delta = worldDelta(startGeo, currentGeo)
    return initialPoints.map((point, index) => {
      if (index !== pointIndex) return point
      return {
        at: translateGeo(point.at, delta),
        ...(point.in ? { in: translateGeo(point.in, delta) } : {}),
        ...(point.out ? { out: translateGeo(point.out, delta) } : {}),
      }
    })
  }

  return initialPoints.map((point, index) => {
    if (index !== pointIndex) return point

    const opposite = handle === 'in' ? 'out' : 'in'
    const next: PenPoint = { ...point, [handle]: currentGeo }

    if (point[opposite]) {
      next[opposite] = mirrorPenControl(point.at, currentGeo)
    }

    return next
  })
}
