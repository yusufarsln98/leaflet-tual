import type L from 'leaflet'
import type { NoteItem, ScreenPoint } from '../../types/index.js'
import { NOTE_COLOR_THEMES } from '../../shared/constants.js'
import { getMapDimensions } from '../../shared/geo.js'

export interface ResolvedNoteTheme {
  name: string
  bg: string
  border: string
  header: string
  text: string
}

export function resolveNoteTheme(backgroundColor: string): ResolvedNoteTheme {
  const matchedTheme = NOTE_COLOR_THEMES.find((t) => t.bg === backgroundColor)
  if (matchedTheme) return matchedTheme

  const isDarkBg =
    (backgroundColor?.startsWith('#') &&
      backgroundColor.length === 7 &&
      parseInt(backgroundColor.slice(1), 16) < 0x888888) ||
    backgroundColor === '#111827' ||
    backgroundColor === '#1e293b' ||
    backgroundColor === '#0f172a'

  return {
    name: 'Custom',
    bg: backgroundColor,
    border: isDarkBg ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.12)',
    header: isDarkBg ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    text: isDarkBg ? '#f8fafc' : '#0f172a',
  }
}

export function clampNotePosition(
  map: L.Map,
  screenPos: ScreenPoint,
  item: NoteItem,
  isCompact: boolean,
  isDragging: boolean,
  clampToViewport = true,
): ScreenPoint {
  const mapDims = clampToViewport !== false ? getMapDimensions(map) : null
  if (!mapDims || isDragging) return screenPos

  const isAnchorNearViewport =
    screenPos.x >= -120 &&
    screenPos.x <= mapDims.width + 120 &&
    screenPos.y >= -120 &&
    screenPos.y <= mapDims.height + 120

  if (!isAnchorNearViewport) return screenPos

  const cardWidth = isCompact ? 95 : (item.width ?? 230)
  const cardHeight = isCompact ? 22 : (item.height ?? 100)
  const pad = 8
  const minX = 16 + pad
  const maxX = Math.max(minX, mapDims.width - cardWidth + 16 - pad)
  const minY = 12 + pad
  const maxY = Math.max(minY, mapDims.height - cardHeight + 12 - pad)

  return {
    x: Math.max(minX, Math.min(maxX, screenPos.x)),
    y: Math.max(minY, Math.min(maxY, screenPos.y)),
  }
}

