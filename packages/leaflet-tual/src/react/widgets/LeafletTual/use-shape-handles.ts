import type L from 'leaflet'
import type { ArrowItem, GeoPoint, RulerItem, ScreenPoint, ShapeItem } from '../../../core/index.js'
import { defaultVia, fromWorld, geoToScreen, toWorld } from '../../../core/index.js'

export type ShapeHandleType = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

export interface ShapeHandle {
  type: ShapeHandleType
  x: number
  y: number
  cursor: string
}

const HANDLE_CURSORS: Record<ShapeHandleType, string> = {
  nw: 'nwse-resize',
  se: 'nwse-resize',
  ne: 'nesw-resize',
  sw: 'nesw-resize',
  n: 'ns-resize',
  s: 'ns-resize',
  e: 'ew-resize',
  w: 'ew-resize',
}

export function getShapeScreenHandles(map: L.Map, shape: ShapeItem): ShapeHandle[] {
  const p1 = geoToScreen(map, shape.from)
  const p2 = geoToScreen(map, shape.to)

  const minX = Math.min(p1.x, p2.x)
  const maxX = Math.max(p1.x, p2.x)
  const minY = Math.min(p1.y, p2.y)
  const maxY = Math.max(p1.y, p2.y)
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2

  return [
    { type: 'nw', x: minX, y: minY, cursor: HANDLE_CURSORS.nw },
    { type: 'n', x: cx, y: minY, cursor: HANDLE_CURSORS.n },
    { type: 'ne', x: maxX, y: minY, cursor: HANDLE_CURSORS.ne },
    { type: 'e', x: maxX, y: cy, cursor: HANDLE_CURSORS.e },
    { type: 'se', x: maxX, y: maxY, cursor: HANDLE_CURSORS.se },
    { type: 's', x: cx, y: maxY, cursor: HANDLE_CURSORS.s },
    { type: 'sw', x: minX, y: maxY, cursor: HANDLE_CURSORS.sw },
    { type: 'w', x: minX, y: cy, cursor: HANDLE_CURSORS.w },
  ]
}

export function hitTestShapeHandle(
  map: L.Map,
  shape: ShapeItem,
  pt: ScreenPoint,
  radius = 8,
): ShapeHandle | null {
  const handles = getShapeScreenHandles(map, shape)
  for (const h of handles) {
    if (Math.hypot(pt.x - h.x, pt.y - h.y) <= radius) {
      return h
    }
  }
  return null
}

export function hitTestArrowHandle(
  map: L.Map,
  arrow: ArrowItem,
  pt: ScreenPoint,
  radius = 8,
): 'start' | 'end' | 'via' | null {
  const startPt = geoToScreen(map, arrow.from)
  if (Math.hypot(pt.x - startPt.x, pt.y - startPt.y) <= radius) return 'start'
  const endPt = geoToScreen(map, arrow.to)
  if (Math.hypot(pt.x - endPt.x, pt.y - endPt.y) <= radius) return 'end'
  if (arrow.kind === 'curved') {
    const via = arrow.via ?? defaultVia(arrow.from, arrow.to)
    const viaPt = geoToScreen(map, via)
    if (Math.hypot(pt.x - viaPt.x, pt.y - viaPt.y) <= radius) return 'via'
  }
  return null
}

export function hitTestRulerHandle(
  map: L.Map,
  ruler: RulerItem,
  pt: ScreenPoint,
  radius = 8,
): 'start' | 'end' | null {
  const startPt = geoToScreen(map, ruler.from)
  if (Math.hypot(pt.x - startPt.x, pt.y - startPt.y) <= radius) return 'start'
  const endPt = geoToScreen(map, ruler.to)
  if (Math.hypot(pt.x - endPt.x, pt.y - endPt.y) <= radius) return 'end'
  return null
}

export function resizeShapeInWorld(
  initialFrom: GeoPoint,
  initialTo: GeoPoint,
  currentGeo: GeoPoint,
  handle: ShapeHandleType,
  lockAspect = false,
): { from: GeoPoint; to: GeoPoint } {
  const w1 = toWorld(initialFrom)
  const w2 = toWorld(initialTo)
  let wMinX = Math.min(w1.x, w2.x)
  let wMaxX = Math.max(w1.x, w2.x)
  let wMinY = Math.min(w1.y, w2.y)
  let wMaxY = Math.max(w1.y, w2.y)

  const curWorld = toWorld(currentGeo)

  // World Y grows northwards, so north handles move wMaxY and south handles
  // move wMinY (the inverse of screen coordinates).
  switch (handle) {
    case 'se':
      wMaxX = curWorld.x
      wMinY = curWorld.y
      break
    case 'nw':
      wMinX = curWorld.x
      wMaxY = curWorld.y
      break
    case 'ne':
      wMaxX = curWorld.x
      wMaxY = curWorld.y
      break
    case 'sw':
      wMinX = curWorld.x
      wMinY = curWorld.y
      break
    case 'n':
      wMaxY = curWorld.y
      break
    case 's':
      wMinY = curWorld.y
      break
    case 'w':
      wMinX = curWorld.x
      break
    case 'e':
      wMaxX = curWorld.x
      break
  }

  if (lockAspect) {
    const cx = (wMinX + wMaxX) / 2
    const cy = (wMinY + wMaxY) / 2
    const size = Math.max(Math.abs(wMaxX - wMinX), Math.abs(wMaxY - wMinY))
    const east = handle === 'e' || handle === 'ne' || handle === 'se'
    const west = handle === 'w' || handle === 'nw' || handle === 'sw'
    const north = handle === 'n' || handle === 'ne' || handle === 'nw'
    const south = handle === 's' || handle === 'se' || handle === 'sw'

    if (east) wMaxX = wMinX + size
    if (west) wMinX = wMaxX - size
    if (north) wMaxY = wMinY + size
    if (south) wMinY = wMaxY - size

    // Side handles grow symmetrically on their free axis.
    if (handle === 'e' || handle === 'w') {
      wMinY = cy - size / 2
      wMaxY = cy + size / 2
    } else if (handle === 'n' || handle === 's') {
      wMinX = cx - size / 2
      wMaxX = cx + size / 2
    }
  }

  return {
    from: fromWorld({ x: wMinX, y: wMinY }),
    to: fromWorld({ x: wMaxX, y: wMaxY }),
  }
}

