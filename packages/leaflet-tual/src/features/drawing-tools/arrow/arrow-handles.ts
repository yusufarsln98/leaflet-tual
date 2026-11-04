import type L from 'leaflet'
import type { ArrowItem } from '../../../entities/index.js'
import type { ScreenPoint } from '../../../shared/types/index.js'
import { defaultVia, geoToScreen } from '../../../shared/geometry/coordinates.js'

export function hitTestArrowHandle(
  map: L.Map,
  arrow: ArrowItem,
  pt: ScreenPoint,
  radius = 8,
): 'start' | 'end' | 'via' | null {
  const startPt = geoToScreen(map, arrow.from)
  if (Math.hypot(pt.x - startPt.x, pt.y - startPt.y) <= radius) return 'start'
  const endPt = geoToScreen(map, arrow.to)
  if (Math.hypot(pt.x - endPt.x, pt.y - endPt.y) <= radius) return 'end'
  if (arrow.kind === 'curved') {
    const viaPt = geoToScreen(map, arrow.via ?? defaultVia(arrow.from, arrow.to))
    if (Math.hypot(pt.x - viaPt.x, pt.y - viaPt.y) <= radius) return 'via'
  }
  return null
}

