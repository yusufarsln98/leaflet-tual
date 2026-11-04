import type { Base } from '../types.js'
import type { GeoPoint } from '../../../shared/types/geo.js'

export interface TextItem extends Base {
  type: 'text'
  at: GeoPoint
  text: string
}
