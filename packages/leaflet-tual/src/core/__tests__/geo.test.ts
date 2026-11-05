import { describe, it, expect } from 'vitest'
import {
  distance,
  formatDistance,
  pathDistance,
  polygonArea,
  polygonCentroid,
  formatArea,
  lockAspect,
  snapAngle,
  defaultVia,
  toWorld,
  fromWorld,
} from '../index.js'

describe('v3 geometry utilities & world space math', () => {
  it('round-trips toWorld and fromWorld accurately', () => {
    const geo = { lat: 41.0082, lng: 28.9784 }
    const world = toWorld(geo)
    const back = fromWorld(world)
    expect(back.lat).toBeCloseTo(geo.lat, 6)
    expect(back.lng).toBeCloseTo(geo.lng, 6)
  })

  it('computes defaultVia perpendicular control point in world space', () => {
    const from = { lat: 40, lng: 28 }
    const to = { lat: 40, lng: 30 }
    const via = defaultVia(from, to, 0.25)
    expect(via.lng).toBeCloseTo(29, 1)
    expect(via.lat).toBeGreaterThan(40)
  })

  it('lockAspect locks aspect ratio in world space', () => {
    const anchor = { lat: 41, lng: 28 }
    const target = { lat: 41.05, lng: 28.1 }
    const locked = lockAspect(anchor, target, 1)
    const wAnchor = toWorld(anchor)
    const wLocked = toWorld(locked)
    expect(Math.abs(wLocked.x - wAnchor.x)).toBeCloseTo(
      Math.abs(wLocked.y - wAnchor.y),
      1,
    )
  })

  it('snapAngle snaps angle to 45 degree increments in world space', () => {
    const anchor = { lat: 41, lng: 28 }
    const target = { lat: 41.001, lng: 28.1 }
    const snapped = snapAngle(anchor, target, 45)
    const wAnchor = toWorld(anchor)
    const wSnapped = toWorld(snapped)
    const angle = Math.atan2(wSnapped.y - wAnchor.y, wSnapped.x - wAnchor.x)
    const stepRad = (45 * Math.PI) / 180
    const rem = Math.abs(angle % stepRad)
    expect(rem < 0.001 || Math.abs(rem - stepRad) < 0.001).toBe(true)
  })

  it('calculates geodesic distances and formats real world lengths correctly', () => {
    const london = { lat: 51.5074, lng: -0.1278 }
    const paris = { lat: 48.8566, lng: 2.3522 }
    const dist = distance(london, paris)
    expect(dist).toBeGreaterThan(340000)
    expect(dist).toBeLessThan(350000)

    expect(formatDistance(450)).toBe('450 m')
    expect(formatDistance(1450)).toBe('1.45 km')
    expect(formatDistance(25000)).toBe('25.0 km')

    expect(formatDistance(50, 'imperial')).toBe('164 ft')
    expect(formatDistance(3000, 'imperial')).toBe('1.86 mi')

    const intermediate = { lat: 50.0, lng: 1.0 }
    const polylineDist = pathDistance([london, intermediate, paris])
    expect(polylineDist).toBeGreaterThan(dist)
  })

  it('calculates geodesic polygon area and formats real world areas accurately', () => {
    // 0.01 deg x 0.01 deg square on equator ~ 1.11 km x 1.11 km ~ 1,236,000 m²
    const poly = [
      { lat: 0, lng: 0 },
      { lat: 0, lng: 0.01 },
      { lat: 0.01, lng: 0.01 },
      { lat: 0.01, lng: 0 },
    ]
    const areaM2 = polygonArea(poly)
    expect(areaM2).toBeGreaterThan(1200000)
    expect(areaM2).toBeLessThan(1250000)

    // Polygon centroid
    const centroid = polygonCentroid(poly)
    expect(centroid.lat).toBeCloseTo(0.005, 5)
    expect(centroid.lng).toBeCloseTo(0.005, 5)

    // Less than 3 points
    expect(polygonArea([])).toBe(0)
    expect(polygonArea([{ lat: 0, lng: 0 }])).toBe(0)
    expect(polygonArea([{ lat: 0, lng: 0 }, { lat: 0, lng: 1 }])).toBe(0)

    // Metric formatting
    expect(formatArea(500)).toBe('500 m²')
    expect(formatArea(12450)).toBe('12,450 m²')
    expect(formatArea(1500000)).toBe('1.5 km²')
    expect(formatArea(25000000)).toBe('25.0 km²')

    // Imperial formatting
    expect(formatArea(100, 'imperial')).toBe('1,076 sq ft')
    expect(formatArea(10000, 'imperial')).toBe('2.47 ac')
    expect(formatArea(5000000, 'imperial')).toBe('1.93 sq mi')
  })
})
