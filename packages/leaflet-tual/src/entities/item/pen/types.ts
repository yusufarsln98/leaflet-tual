import type { Base } from '../types.js'
import type { GeoPoint } from '../../../shared/types/geo.js'

export interface PenPoint {
  at: GeoPoint
  in?: GeoPoint
  out?: GeoPoint
}

export interface PenItem extends Base {
  type: 'pen'
  points: PenPoint[]
  closed?: boolean
}
