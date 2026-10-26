import type L from 'leaflet'
import type { ArrowItem, GeoPoint, RulerItem, ScreenPoint, ShapeItem } from '../../../../core/index.js'
import { defaultVia, geoToScreen } from '../../../../core/index.js'
import { getItemZoomScale } from '../../../../core/shared/geometry/zoom.js'

export type ShapeHandleType = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

export interface ShapeHandle {
  type: ShapeHandleType
  x: number
  y: number
  cursor: string
}

export { resizeShape, resizeShapeInWorld } from './resize-shape.js'

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
  let minX: number
  let maxX: number
  let minY: number
  let maxY: number
  let cx: number
  let cy: number

  if (shape.at) {
    const center = geoToScreen(map, shape.at)
    const scale = getItemZoomScale(map, shape)

    const halfW = (shape.width * scale) / 2
    const halfH = (shape.height * scale) / 2

    minX = center.x - halfW
    maxX = center.x + halfW
    minY = center.y - halfH
    maxY = center.y + halfH
    cx = center.x
    cy = center.y
  } else {
    const legacy = shape as unknown as { from?: GeoPoint; to?: GeoPoint }
    if (legacy.from && legacy.to) {
      const p1 = geoToScreen(map, legacy.from)
      const p2 = geoToScreen(map, legacy.to)

      minX = Math.min(p1.x, p2.x)
      maxX = Math.max(p1.x, p2.x)
      minY = Math.min(p1.y, p2.y)
      maxY = Math.max(p1.y, p2.y)
      cx = (minX + maxX) / 2
      cy = (minY + maxY) / 2
    } else {
      return []
    }
  }

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
