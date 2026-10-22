import { describe, it, expect } from 'vitest'
import {
  computeDefaultControlGeoPoint,
  constrainToAspectRatio,
  constrainAngleTo45Degrees,
  distanceToSegment,
  distanceToQuadraticBezier,
  calculateGeodesicDistance,
  formatRealWorldDistance,
  calculateLineDistance,
} from '../index.js'

describe('geo math & geometry utilities', () => {
  it('computes perpendicular control point for curved arrows', () => {
    const start = { lat: 40, lng: 28 }
    const end = { lat: 40, lng: 30 }
    const ctrl = computeDefaultControlGeoPoint(start, end, 0.25)
    expect(ctrl.lng).toBe(29)
    expect(ctrl.lat).toBeCloseTo(40.5)
  })

  it('calculates segment and quadratic Bezier distances accurately', () => {
    const dSeg = distanceToSegment({ x: 5, y: 3 }, { x: 0, y: 0 }, { x: 10, y: 0 })
    expect(dSeg).toBeCloseTo(3)

    const dCurve = distanceToQuadraticBezier(
      { x: 5, y: 5 },
      { x: 0, y: 0 },
      { x: 5, y: 10 },
      { x: 10, y: 0 },
    )
    expect(dCurve).toBeLessThan(1)
  })

  it('constrains shape bounding box to 1:1 or custom aspect ratio when Shift is active', () => {
    const anchor = { x: 100, y: 100 }
    const locked1to1 = constrainToAspectRatio(anchor, { x: 180, y: 130 }, 1)
    expect(Math.abs(locked1to1.x - anchor.x)).toBeCloseTo(
      Math.abs(locked1to1.y - anchor.y),
    )
    expect(locked1to1.x).toBe(180)
    expect(locked1to1.y).toBe(180)

    // Preserve 2:1 aspect ratio
    const locked2to1 = constrainToAspectRatio(anchor, { x: 150, y: 160 }, 2)
    expect(
      Math.abs(locked2to1.x - anchor.x) / Math.abs(locked2to1.y - anchor.y),
    ).toBeCloseTo(2)
  })

  it('snaps arrow angles to 45-degree increments when Shift is active', () => {
    const anchor = { x: 0, y: 0 }
    const snappedHorizontal = constrainAngleTo45Degrees(anchor, { x: 100, y: 8 })
    expect(snappedHorizontal.y).toBeCloseTo(0, 5)
    expect(snappedHorizontal.x).toBeCloseTo(Math.hypot(100, 8), 4)

    const snappedDiagonal = constrainAngleTo45Degrees(anchor, { x: 95, y: 100 })
    expect(snappedDiagonal.x).toBeCloseTo(snappedDiagonal.y, 4)
  })

  it('calculates geodesic distances and formats real world lengths correctly', () => {
    // Distance between London (51.5074, -0.1278) and Paris (48.8566, 2.3522) is approx 343-344 km
    const london = { lat: 51.5074, lng: -0.1278 }
    const paris = { lat: 48.8566, lng: 2.3522 }
    const dist = calculateGeodesicDistance(london, paris)
    expect(dist).toBeGreaterThan(340000)
    expect(dist).toBeLessThan(350000)

    // Formatted metric
    expect(formatRealWorldDistance(450)).toBe('450 m')
    expect(formatRealWorldDistance(1450)).toBe('1.45 km')
    expect(formatRealWorldDistance(25000)).toBe('25.0 km')

    // Formatted imperial
    expect(formatRealWorldDistance(50, 'imperial')).toBe('164 ft')
    expect(formatRealWorldDistance(3000, 'imperial')).toBe('1.86 mi')

    // Polyline distance
    const intermediate = { lat: 50.0, lng: 1.0 }
    const polylineDist = calculateLineDistance([london, intermediate, paris])
    expect(polylineDist).toBeGreaterThan(dist)
  })
})
