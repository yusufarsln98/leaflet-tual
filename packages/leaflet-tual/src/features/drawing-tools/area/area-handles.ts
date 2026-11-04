import type L from 'leaflet'
import type { AreaItem } from '../../../entities/index.js'
import type { ScreenPoint } from '../../../shared/types/index.js'
import { geoToScreen } from '../../../shared/geometry/coordinates.js'

export function hitTestAreaHandle(
  map: L.Map,
  area: AreaItem,
  pt: ScreenPoint,
  radius = 8,
): number | null {
  for (let i = 0; i < area.points.length; i += 1) {
    const screenPt = geoToScreen(map, area.points[i])
    if (Math.hypot(pt.x - screenPt.x, pt.y - screenPt.y) <= radius) {
      return i
    }
  }
  return null
}

