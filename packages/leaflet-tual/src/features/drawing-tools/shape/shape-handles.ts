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

  const initMinX = center.x - w / 2
  const initMaxX = center.x + w / 2
  const initMinY = center.y - h / 2
  const initMaxY = center.y + h / 2

  const hasE = handle.includes('e')
  const hasW = handle.includes('w')
  const hasN = handle.includes('n')
  const hasS = handle.includes('s')

  const ratio = initialWidth > 0 && initialHeight > 0 ? initialWidth / initialHeight : 1

  let cx: number
  let cy: number
  let finalW: number
  let finalH: number

  if ((hasE || hasW) && (hasN || hasS)) {
    // Corner handles ('nw', 'ne', 'se', 'sw')
    const anchorX = hasW ? initMaxX : initMinX
    const anchorY = hasN ? initMaxY : initMinY
    const dx = currentPt.x - anchorX
    const dy = currentPt.y - anchorY

    const defaultSignX = hasW ? -1 : 1
    const defaultSignY = hasN ? -1 : 1
    const signX = dx !== 0 ? (dx > 0 ? 1 : -1) : defaultSignX
    const signY = dy !== 0 ? (dy > 0 ? 1 : -1) : defaultSignY

    let width = Math.max(10, Math.abs(dx))
    let height = Math.max(10, Math.abs(dy))

    if (lockAspect) {
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)
      if (absDx / ratio >= absDy) {
        width = Math.max(10, absDx)
        height = Math.max(10 / ratio, width / ratio)
      } else {
        height = Math.max(10, absDy)
        width = Math.max(10 * ratio, height * ratio)
      }
    }

    const newX = anchorX + signX * width
    const newY = anchorY + signY * height

    cx = (anchorX + newX) / 2
    cy = (anchorY + newY) / 2
    finalW = width
    finalH = height
  } else if (hasE || hasW) {
    // Horizontal edge handles ('e', 'w')
    const anchorX = hasW ? initMaxX : initMinX
    const dx = currentPt.x - anchorX
    const defaultSignX = hasW ? -1 : 1
    const signX = dx !== 0 ? (dx > 0 ? 1 : -1) : defaultSignX

    const width = Math.max(10, Math.abs(dx))
    const height = lockAspect ? Math.max(10 / ratio, width / ratio) : h

    const newX = anchorX + signX * width
    cx = (anchorX + newX) / 2
    cy = center.y
    finalW = width
    finalH = height
  } else {
    // Vertical edge handles ('n', 's')
    const anchorY = hasN ? initMaxY : initMinY
    const dy = currentPt.y - anchorY
    const defaultSignY = hasN ? -1 : 1
    const signY = dy !== 0 ? (dy > 0 ? 1 : -1) : defaultSignY

    const height = Math.max(10, Math.abs(dy))
    const width = lockAspect ? Math.max(10 * ratio, height * ratio) : w

    const newY = anchorY + signY * height
    cx = center.x
    cy = (anchorY + newY) / 2
    finalW = width
    finalH = height
  }

  return {
    at: screenToGeo(map, { x: cx, y: cy }),
    width: Math.round(finalW / scale),
    height: Math.round(finalH / scale),
  }
}
