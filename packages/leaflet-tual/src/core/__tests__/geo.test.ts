import { describe, it, expect } from 'vitest'
import {
  distance,
  formatDistance,
  pathDistance,
  lockAspect,
  snapAngle,
  defaultVia,
  toWorld,
  fromWorld,
} from '../index.js'

describe('v2 geometry utilities & world space math', () => {
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
})
