import type { ScreenPoint } from '../../types/index.js'

export function distanceToSegment(
  p: ScreenPoint,
  a: ScreenPoint,
  b: ScreenPoint,
): number {
  const l2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2
  if (l2 === 0) return Math.hypot(p.x - a.x, p.y - a.y)

  let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2
  t = Math.max(0, Math.min(1, t))

  const projX = a.x + t * (b.x - a.x)
  const projY = a.y + t * (b.y - a.y)

  return Math.hypot(p.x - projX, p.y - projY)
}

export function getQuadraticBezierPoint(
  p0: ScreenPoint,
  p1: ScreenPoint,
  p2: ScreenPoint,
  t: number,
): ScreenPoint {
  const invT = 1 - t
  return {
    x: invT * invT * p0.x + 2 * invT * t * p1.x + t * t * p2.x,
    y: invT * invT * p0.y + 2 * invT * t * p1.y + t * t * p2.y,
  }
}

export function distanceToQuadraticBezier(
  p: ScreenPoint,
  p0: ScreenPoint,
  p1: ScreenPoint,
  p2: ScreenPoint,
  samples = 24,
): number {
  let minD = Infinity
  let prev = p0
  for (let i = 1; i <= samples; i += 1) {
    const curr = getQuadraticBezierPoint(p0, p1, p2, i / samples)
    const d = distanceToSegment(p, prev, curr)
    if (d < minD) minD = d
    prev = curr
  }
  return minD
}

export function getCubicBezierPoint(
  p0: ScreenPoint,
  p1: ScreenPoint,
  p2: ScreenPoint,
  p3: ScreenPoint,
  t: number,
): ScreenPoint {
  const invT = 1 - t
  return {
    x:
      invT ** 3 * p0.x +
      3 * invT ** 2 * t * p1.x +
      3 * invT * t ** 2 * p2.x +
      t ** 3 * p3.x,
    y:
      invT ** 3 * p0.y +
      3 * invT ** 2 * t * p1.y +
      3 * invT * t ** 2 * p2.y +
      t ** 3 * p3.y,
  }
}

export function distanceToCubicBezier(
  p: ScreenPoint,
  p0: ScreenPoint,
  p1: ScreenPoint,
  p2: ScreenPoint,
  p3: ScreenPoint,
  samples = 24,
): number {
  let minD = Infinity
  let prev = p0
  for (let i = 1; i <= samples; i += 1) {
    const curr = getCubicBezierPoint(p0, p1, p2, p3, i / samples)
    const d = distanceToSegment(p, prev, curr)
    if (d < minD) minD = d
    prev = curr
  }
  return minD
}

