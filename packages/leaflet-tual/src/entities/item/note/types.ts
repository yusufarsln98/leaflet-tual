import type { Base } from '../types.js'
import type { GeoPoint } from '../../../shared/types/geo.js'

export interface NoteItem extends Base {
  type: 'note'
  at: GeoPoint
  width?: number
  height?: number
  text: string
  title?: string
}
