import type { Base } from '../types.js'
import type { GeoPoint } from '../../../shared/types/geo.js'

export interface FreedrawItem extends Base {
  type: 'freedraw'
  points: GeoPoint[]
}
