import type L from 'leaflet'
import type { RulerItem } from '../../../entities/index.js'
import type { ScreenPoint } from '../../../shared/types/index.js'
import { geoToScreen } from '../../../shared/geometry/coordinates.js'

export function hitTestRulerHandle(
  map: L.Map,
  ruler: RulerItem,
  pt: ScreenPoint,
  radius = 8,
): 'start' | 'end' | null {
  const startPt = geoToScreen(map, ruler.from)
  if (Math.hypot(pt.x - startPt.x, pt.y - startPt.y) <= radius) return 'start'
  const endPt = geoToScreen(map, ruler.to)
  if (Math.hypot(pt.x - endPt.x, pt.y - endPt.y) <= radius) return 'end'
  return null
}

