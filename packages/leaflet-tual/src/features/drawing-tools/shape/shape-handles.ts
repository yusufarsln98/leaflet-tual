import type L from 'leaflet'
import type { ShapeItem } from '../../../entities/index.js'
import type { GeoPoint, ScreenPoint } from '../../../shared/types/index.js'
import { geoToScreen, screenToGeo } from '../../../shared/geometry/coordinates.js'
import { getItemZoomScale } from '../../../shared/geometry/zoom.js'

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
  const scale = getItemZoomScale(map, shape)
  const center = geoToScreen(map, shape.at)
  const halfW = ((shape.width ?? 96) / 2) * scale
  const halfH = ((shape.height ?? 96) / 2) * scale

  return [
    { type: 'nw', x: center.x - halfW, y: center.y - halfH, cursor: HANDLE_CURSORS.nw },
    { type: 'n', x: center.x, y: center.y - halfH, cursor: HANDLE_CURSORS.n },
    { type: 'ne', x: center.x + halfW, y: center.y - halfH, cursor: HANDLE_CURSORS.ne },
    { type: 'e', x: center.x + halfW, y: center.y, cursor: HANDLE_CURSORS.e },
    { type: 'se', x: center.x + halfW, y: center.y + halfH, cursor: HANDLE_CURSORS.se },
    { type: 's', x: center.x, y: center.y + halfH, cursor: HANDLE_CURSORS.s },
    { type: 'sw', x: center.x - halfW, y: center.y + halfH, cursor: HANDLE_CURSORS.sw },
    { type: 'w', x: center.x - halfW, y: center.y, cursor: HANDLE_CURSORS.w },
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
