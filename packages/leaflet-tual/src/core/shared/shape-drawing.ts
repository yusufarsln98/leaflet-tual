import type L from 'leaflet'
import type { GeoPoint, ScreenPoint } from '../types/index.js'
import { lockAspect, screenToGeo } from './coordinates.js'

/** Screen distance below which a pointer gesture counts as a click, not a drag. */
export const CLICK_DRAG_THRESHOLD_PX = 6

/** Default on-screen size used when a shape tool is clicked without dragging. */
export const DEFAULT_SHAPE_SIZE_PX = 96

export interface ShapeDragResolution {
  from: GeoPoint
  to: GeoPoint
  isClick: boolean
}

/**
 * Resolves the bounds of a shape created by a pointer gesture.
 *
 * A drag uses the dragged screen box. A click (no meaningful movement) creates a
 * shape centred on the click with a screen-constant default size, so it stays
 * visible and proportional at every zoom level.
 */
export function resolveShapeDragBounds(
  map: L.Map,
  startPt: ScreenPoint,
  currentPt: ScreenPoint,
  options: {
    shiftKey?: boolean
    defaultSize?: number
    clickThreshold?: number
  } = {},
): ShapeDragResolution {
  const clickThreshold = options.clickThreshold ?? CLICK_DRAG_THRESHOLD_PX
  const defaultSize = options.defaultSize ?? DEFAULT_SHAPE_SIZE_PX

  if (isClickGesture(startPt, currentPt, clickThreshold)) {
    const half = defaultSize / 2
    return {
      from: screenToGeo(map, { x: startPt.x - half, y: startPt.y - half }),
      to: screenToGeo(map, { x: startPt.x + half, y: startPt.y + half }),
      isClick: true,
    }
  }

  const from = screenToGeo(map, startPt)
  let to = screenToGeo(map, currentPt)
  if (options.shiftKey) to = lockAspect(from, to, 1)

  return { from, to, isClick: false }
}

export interface ShapePlacementResolution {
  at: GeoPoint
  width: number
  height: number
  isClick: boolean
}

/**
 * Resolves the placement (center and size) of a shape created by a pointer gesture.
 *
 * A drag uses the dragged screen box. A click (no meaningful movement) creates a
 * shape centred on the click with a screen-constant default size.
 */
export function resolveShapePlacement(
  map: L.Map,
  startPt: ScreenPoint,
  currentPt: ScreenPoint,
  options: {
    shiftKey?: boolean
    defaultSize?: number
    clickThreshold?: number
  } = {},
): ShapePlacementResolution {
  const clickThreshold = options.clickThreshold ?? CLICK_DRAG_THRESHOLD_PX
  const defaultSize = options.defaultSize ?? DEFAULT_SHAPE_SIZE_PX

  if (isClickGesture(startPt, currentPt, clickThreshold)) {
    return {
      at: screenToGeo(map, startPt),
      width: defaultSize,
      height: defaultSize,
      isClick: true,
    }
  }

  let dx = currentPt.x - startPt.x
  let dy = currentPt.y - startPt.y

  if (options.shiftKey) {
    const size = Math.max(Math.abs(dx), Math.abs(dy))
    dx = (dx < 0 ? -1 : 1) * size
    dy = (dy < 0 ? -1 : 1) * size
  }

  const width = Math.max(1, Math.abs(dx))
  const height = Math.max(1, Math.abs(dy))
  const minX = Math.min(startPt.x, startPt.x + dx)
  const minY = Math.min(startPt.y, startPt.y + dy)
  const centerScreen = { x: minX + width / 2, y: minY + height / 2 }

  return {
    at: screenToGeo(map, centerScreen),
    width,
    height,
    isClick: false,
  }
}

export function isClickGesture(
  startPt: ScreenPoint,
  currentPt: ScreenPoint,
  threshold = CLICK_DRAG_THRESHOLD_PX,
): boolean {
  return Math.hypot(currentPt.x - startPt.x, currentPt.y - startPt.y) < threshold
}
