import type { Base } from '../types.js'
import type { GeoPoint } from '../../../shared/types/geo.js'

export interface AreaItem extends Base {
  type: 'area'
  points: GeoPoint[]
  unit?: 'metric' | 'imperial'
  label?: string
}
