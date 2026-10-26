import type L from 'leaflet'
import type { GeoPoint, ScreenPoint, ShapeItem } from '../../../../core/index.js'
import { fromWorld, geoToScreen, screenToGeo, toWorld } from '../../../../core/index.js'
import { getItemZoomScale } from '../../../../core/shared/geometry/zoom.js'
import type { ShapeHandleType } from './use-shape-handles.js'

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

  switch (handle) {
    case 'se':
      maxX = currentPt.x
      maxY = currentPt.y
      break
    case 'nw':
      minX = currentPt.x
      minY = currentPt.y
      break
    case 'ne':
      maxX = currentPt.x
      minY = currentPt.y
      break
    case 'sw':
      minX = currentPt.x
      maxY = currentPt.y
      break
    case 'n':
      minY = currentPt.y
      break
    case 's':
      maxY = currentPt.y
      break
    case 'w':
      minX = currentPt.x
      break
    case 'e':
      maxX = currentPt.x
      break
  }

  let finalW = Math.max(10, Math.abs(maxX - minX))
  let finalH = Math.max(10, Math.abs(maxY - minY))

  if (lockAspect) {
    const size = Math.max(finalW, finalH)
    finalW = size
    finalH = size
  }

  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2

  return {
    at: screenToGeo(map, { x: cx, y: cy }),
    width: Math.round(finalW / scale),
    height: Math.round(finalH / scale),
  }
}
