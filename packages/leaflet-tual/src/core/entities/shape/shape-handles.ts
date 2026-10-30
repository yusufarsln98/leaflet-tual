import type L from 'leaflet'
import type { ArrowItem, GeoPoint, RulerItem, ScreenPoint, ShapeItem } from '../../types/index.js'
import { defaultVia, geoToScreen, screenToGeo } from '../../shared/geometry/coordinates.js'
import { getItemZoomScale } from '../../shared/geometry/zoom.js'

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
  const center = geoToScreen(map, shape.at)
  const scale = getItemZoomScale(map, shape)
  const halfW = (shape.width * scale) / 2
  const halfH = (shape.height * scale) / 2
  const minX = center.x - halfW
  const maxX = center.x + halfW
  const minY = center.y - halfH
  const maxY = center.y + halfH
  const cx = center.x
  const cy = center.y

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
  return (
    getShapeScreenHandles(map, shape).find((h) => Math.hypot(pt.x - h.x, pt.y - h.y) <= radius) ??
    null
  )
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
    const viaPt = geoToScreen(map, arrow.via ?? defaultVia(arrow.from, arrow.to))
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

export function resizeShape(
  map: L.Map,
  shape: ShapeItem,
  initialAt: GeoPoint,
  initialWidth: number,
  initialHeight: number,
  currentPt: ScreenPoint,
  handle: ShapeHandleType,
  lockAspect = false,
): { at: GeoPoint; width: number; height: number } {
  const scale = getItemZoomScale(map, shape)
  const center = geoToScreen(map, initialAt)
  const w = initialWidth * scale
  const h = initialHeight * scale

  let minX = center.x - w / 2
  let maxX = center.x + w / 2
  let minY = center.y - h / 2
  let maxY = center.y + h / 2

  if (handle.includes('e')) maxX = currentPt.x
  if (handle.includes('w')) minX = currentPt.x
  if (handle.includes('n')) minY = currentPt.y
  if (handle.includes('s')) maxY = currentPt.y

  let finalW = Math.max(10, Math.abs(maxX - minX))
  let finalH = Math.max(10, Math.abs(maxY - minY))

  if (lockAspect) {
    const size = Math.max(finalW, finalH)
    finalW = size
    finalH = size
  }

  return {
    at: screenToGeo(map, { x: (minX + maxX) / 2, y: (minY + maxY) / 2 }),
    width: Math.round(finalW / scale),
    height: Math.round(finalH / scale),
  }
}


