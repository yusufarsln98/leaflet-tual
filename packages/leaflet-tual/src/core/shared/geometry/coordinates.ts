import type L from 'leaflet'
import type { GeoPoint, ScreenPoint, WorldPoint } from '../../types/index.js'

let idCounter = 0

export function createId(prefix = 'tual'): string {
  idCounter += 1
  const randomPart = Math.random().toString(36).slice(2, 8)
  return `${prefix}-${Date.now().toString(36)}-${idCounter}-${randomPart}`
}

const R = 6378137 // Earth's radius in meters
const DEG_TO_RAD = Math.PI / 180
const RAD_TO_DEG = 180 / Math.PI

/**
 * Projects a GeoPoint ({ lat, lng }) to a zoom-independent Mercator world plane in meters.
 */
export function toWorld(geo: GeoPoint): WorldPoint {
  const maxLat = 85.0511287798
  const lat = Math.max(Math.min(maxLat, geo.lat), -maxLat)
  const sin = Math.sin(lat * DEG_TO_RAD)
  return {
    x: R * geo.lng * DEG_TO_RAD,
    y: (R / 2) * Math.log((1 + sin) / (1 - sin)),
  }
}

/**
 * Unprojects a WorldPoint back to a GeoPoint ({ lat, lng }).
 */
export function fromWorld(world: WorldPoint): GeoPoint {
  const lat =
    (2 * Math.atan(Math.exp(world.y / R)) - Math.PI / 2) * RAD_TO_DEG
  const lng = (world.x / R) * RAD_TO_DEG
  return { lat, lng }
}

export function geoToScreen(map: L.Map, geo: GeoPoint): ScreenPoint {
  const pt = map.latLngToContainerPoint([geo.lat, geo.lng])
  return { x: pt.x, y: pt.y }
}

export function screenToGeo(map: L.Map, pt: ScreenPoint): GeoPoint {
  const latlng = map.containerPointToLatLng([pt.x, pt.y])
  return { lat: latlng.lat, lng: latlng.lng }
}

export function lockAspect(
  startGeo: GeoPoint,
  currentGeo: GeoPoint,
  aspectRatio = 1,
): GeoPoint {
  const ratio = aspectRatio > 0 ? aspectRatio : 1
  const wStart = toWorld(startGeo)
  const wCurr = toWorld(currentGeo)

  const dx = wCurr.x - wStart.x
  const dy = wCurr.y - wStart.y
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)

  const signX = dx >= 0 ? 1 : -1
  const signY = dy >= 0 ? 1 : -1

  let clampedWorld: WorldPoint
  if (absDx / ratio >= absDy) {
    clampedWorld = {
      x: wStart.x + signX * absDx,
      y: wStart.y + signY * (absDx / ratio),
    }
  } else {
    clampedWorld = {
      x: wStart.x + signX * (absDy * ratio),
      y: wStart.y + signY * absDy,
    }
  }

  return fromWorld(clampedWorld)
}

export function snapAngle(
  startGeo: GeoPoint,
  currentGeo: GeoPoint,
  snapDegrees = 45,
): GeoPoint {
  const wStart = toWorld(startGeo)
  const wCurr = toWorld(currentGeo)

  const dx = wCurr.x - wStart.x
  const dy = wCurr.y - wStart.y
  const len = Math.hypot(dx, dy)
  if (len === 0) return currentGeo

  const angle = Math.atan2(dy, dx)
  const snapRad = (snapDegrees * Math.PI) / 180
  const snappedAngle = Math.round(angle / snapRad) * snapRad

  const snappedWorld: WorldPoint = {
    x: wStart.x + Math.cos(snappedAngle) * len,
    y: wStart.y + Math.sin(snappedAngle) * len,
  }

  return fromWorld(snappedWorld)
}

export function defaultVia(
  from: GeoPoint,
  to: GeoPoint,
  offsetFactor = 0.25,
): GeoPoint {
  const wFrom = toWorld(from)
  const wTo = toWorld(to)

  const midX = (wFrom.x + wTo.x) / 2
  const midY = (wFrom.y + wTo.y) / 2

  const dx = wTo.x - wFrom.x
  const dy = wTo.y - wFrom.y

  const viaWorld: WorldPoint = {
    x: midX - dy * offsetFactor,
    y: midY + dx * offsetFactor,
  }

  return fromWorld(viaWorld)
}

