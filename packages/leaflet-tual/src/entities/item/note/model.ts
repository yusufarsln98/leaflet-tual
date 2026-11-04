import type { NoteItem } from './types.js'
import type { GeoPoint } from '../../../shared/types/geo.js'

export function isNoteItem(item: unknown): item is NoteItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    (item as NoteItem).type === 'note'
  )
}

export function createDefaultNoteItem(
  id: string,
  at: GeoPoint,
  text = '',
  title = '',
  width = 180,
  height = 140,
): NoteItem {
  return {
    id,
    type: 'note',
    at,
    text,
    title,
    width,
    height,
    createdAt: Date.now(),
  }
}
