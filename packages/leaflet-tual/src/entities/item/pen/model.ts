import type { PenItem, PenPoint } from './types.js'

export function isPenItem(item: unknown): item is PenItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    (item as PenItem).type === 'pen'
  )
}

export function isValidPenPoint(point: unknown): boolean {
  if (typeof point !== 'object' || point === null) return false
  const p = point as Record<string, unknown>
  const isValidGeo = (g: unknown) =>
    typeof g === 'object' &&
    g !== null &&
    typeof (g as { lat?: unknown }).lat === 'number' &&
    typeof (g as { lng?: unknown }).lng === 'number'

  return (
    isValidGeo(p.at) &&
    (p.in === undefined || isValidGeo(p.in)) &&
    (p.out === undefined || isValidGeo(p.out))
  )
}

export function createDefaultPenItem(
  id: string,
  points: PenPoint[] = [],
  closed = false,
): PenItem {
  return {
    id,
    type: 'pen',
    points,
    closed,
    createdAt: Date.now(),
  }
}
