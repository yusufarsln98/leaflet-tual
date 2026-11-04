import type { ScreenPoint } from '../../types/index.js'

export const DRAFT_THRESHOLDS = {
  PEN_CLOSE_HIT_RADIUS: 10,
  AREA_CLOSE_HIT_RADIUS: 12,
  DOUBLE_CLICK_MS: 320,
  DOUBLE_CLICK_DISTANCE: 6,
} as const

/**
 * Checks whether two screen points are within a threshold Euclidean distance.
 */
export function isPointNearPoint(p1: ScreenPoint, p2: ScreenPoint, radius: number): boolean {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y) <= radius
}

/**
 * Checks whether two successive clicks satisfy double-click time and distance thresholds.
 */
export function isDoubleClickTiming(
  lastClick: { at: number; pt: ScreenPoint } | null | undefined,
  currentPt: ScreenPoint,
  now = Date.now(),
  maxTimeMs = DRAFT_THRESHOLDS.DOUBLE_CLICK_MS,
  maxDistance = DRAFT_THRESHOLDS.DOUBLE_CLICK_DISTANCE,
): boolean {
  if (!lastClick) return false
  if (now - lastClick.at > maxTimeMs) return false
  return isPointNearPoint(lastClick.pt, currentPt, maxDistance)
}

