import type { GeoPoint } from '../../types/index.js'
import type { TranslationTokens } from '../../i18n/types.js'
import { getDefaultTranslations } from '../../i18n/translations.js'

const DEG_TO_RAD = Math.PI / 180

export function distance(a: GeoPoint, b: GeoPoint): number {
  const dLat = (b.lat - a.lat) * DEG_TO_RAD
  const dLng = (b.lng - a.lng) * DEG_TO_RAD
  const lat1 = a.lat * DEG_TO_RAD
  const lat2 = b.lat * DEG_TO_RAD

  const sinHalfLat = Math.sin(dLat / 2)
  const sinHalfLng = Math.sin(dLng / 2)

  const h =
    sinHalfLat * sinHalfLat +
    Math.cos(lat1) * Math.cos(lat2) * sinHalfLng * sinHalfLng

  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

export function pathDistance(points: GeoPoint[]): number {
  let total = 0
  for (let i = 0; i < points.length - 1; i += 1) {
    total += distance(points[i], points[i + 1])
  }
  return total
}

export function formatDistance(
  meters: number,
  unit: 'metric' | 'imperial' = 'metric',
  tokens?: Partial<TranslationTokens>,
): string {
  const currentTokens = { ...getDefaultTranslations(), ...tokens }
  if (unit === 'imperial') {
    const feet = meters * 3.28084
    if (feet < 1000) return `${Math.round(feet)} ${currentTokens.ft}`
    const miles = feet / 5280
    const val = miles >= 10 ? miles.toFixed(1) : parseFloat(miles.toFixed(2))
    return `${val} ${currentTokens.mi}`
  }
  if (meters < 1000) return `${Math.round(meters)} ${currentTokens.m}`
  const km = meters / 1000
  const val = km >= 10 ? km.toFixed(1) : parseFloat(km.toFixed(2))
  return `${val} ${currentTokens.km}`
}

/**
 * Calculates the geodesic surface area of a polygon defined by GeoPoints in square meters.
 * Uses the Chamberlain-Duquette spherical excess surveyor formula.
 */
export function polygonArea(points: GeoPoint[]): number {
  if (points.length < 3) return 0
  const RADIUS = 6371000 // Earth mean radius in meters
  let total = 0
  const len = points.length

  for (let i = 0; i < len; i += 1) {
    const p1 = points[i]
    const p2 = points[(i + 1) % len]

    const lambda1 = (p1.lng * Math.PI) / 180
    const lambda2 = (p2.lng * Math.PI) / 180
    const phi1 = (p1.lat * Math.PI) / 180
    const phi2 = (p2.lat * Math.PI) / 180

    let dLambda = lambda2 - lambda1
    if (dLambda > Math.PI) dLambda -= 2 * Math.PI
    if (dLambda < -Math.PI) dLambda += 2 * Math.PI

    total += dLambda * (2 + Math.sin(phi1) + Math.sin(phi2))
  }

  return Math.abs((total * RADIUS * RADIUS) / 2)
}

/**
 * Calculates the geographic centroid (center of mass) of a polygon.
 */
export function polygonCentroid(points: GeoPoint[]): GeoPoint {
  if (points.length === 0) return { lat: 0, lng: 0 }
  let sumLat = 0
  let sumLng = 0
  for (const p of points) {
    sumLat += p.lat
    sumLng += p.lng
  }
  return { lat: sumLat / points.length, lng: sumLng / points.length }
}

/**
 * Formats a square meter area value into a readable localized string (e.g. "1,250 m²", "4.50 km²", "2.10 ac").
 */
export function formatArea(
  sqMeters: number,
  unit: 'metric' | 'imperial' = 'metric',
  tokens?: Partial<TranslationTokens>,
): string {
  const currentTokens = { ...getDefaultTranslations(), ...tokens }
  const sqM = currentTokens.sqM || 'm²'
  const sqKm = currentTokens.sqKm || 'km²'
  const sqFt = currentTokens.sqFt || 'sq ft'
  const ac = currentTokens.ac || 'ac'
  const sqMi = currentTokens.sqMi || 'sq mi'

  if (unit === 'imperial') {
    const sqFeet = sqMeters * 10.7639
    if (sqFeet < 43560) {
      return `${Math.round(sqFeet).toLocaleString()} ${sqFt}`
    }
    const acres = sqFeet / 43560
    if (acres < 640) {
      const val = acres >= 10 ? acres.toFixed(1) : parseFloat(acres.toFixed(2))
      return `${val} ${ac}`
    }
    const squareMiles = acres / 640
    const val = squareMiles >= 10 ? squareMiles.toFixed(1) : parseFloat(squareMiles.toFixed(2))
    return `${val} ${sqMi}`
  }

  if (sqMeters < 1_000_000) {
    return `${Math.round(sqMeters).toLocaleString()} ${sqM}`
  }
  const km2 = sqMeters / 1_000_000
  const val = km2 >= 10 ? km2.toFixed(1) : parseFloat(km2.toFixed(2))
  return `${val} ${sqKm}`
}

