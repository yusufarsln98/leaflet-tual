import type { Base } from '../types.js'
import type { GeoPoint } from '../../../shared/types/geo.js'

export interface RulerItem extends Base {
  type: 'ruler'
  from: GeoPoint
  to: GeoPoint
  unit?: 'metric' | 'imperial'
  label?: string
}
