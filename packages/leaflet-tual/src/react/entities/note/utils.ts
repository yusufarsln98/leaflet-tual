import type React from 'react'
import type L from 'leaflet'
import type { NoteItem, ScreenPoint } from '../../types/index.js'
import { NOTE_COLOR_THEMES } from '../../shared/constants.js'
import { getMapDimensions } from '../../shared/geo.js'
import type { ResolvedNoteTheme } from './types.js'

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

export function getDefaultNoteCardStyle(
  item: NoteItem,
  theme: ResolvedNoteTheme,
  isCompact: boolean,
  isSelected: boolean,
  readOnly: boolean,
  isDragging: boolean,
  unstyled: boolean,
): React.CSSProperties {
  if (unstyled) return { transform: 'translate(-16px, -12px)' }

  if (isCompact) {
    return {
      transform: 'translate(-16px, -12px)',
      width: 'auto',
      minWidth: '24px',
      maxWidth: '130px',
      height: '22px',
      boxSizing: 'border-box',
      backgroundColor: item.backgroundColor,
      color: item.textColor || theme.text,
      border: `1px solid ${!readOnly && isSelected ? '#4b5563' : theme.border}`,
      borderRadius: '9999px',
      overflow: 'hidden',
      boxShadow:
        !readOnly && isSelected
          ? '0 2px 6px rgba(0, 0, 0, 0.25)'
          : '0 1px 3px rgba(0, 0, 0, 0.12)',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0 8px',
      gap: '4px',
      cursor: readOnly ? 'default' : isDragging ? 'grabbing' : 'grab',
      transition: 'none',
    }
  }

  return {
    transform: 'translate(-16px, -12px)',
    width: `${item.width ?? 230}px`,
    boxSizing: 'border-box',
    backgroundColor: item.backgroundColor,
    color: item.textColor || theme.text,
    border: `1px solid ${!readOnly && isSelected ? '#4b5563' : theme.border}`,
    borderRadius: '2px',
    overflow: 'hidden',
    boxShadow:
      !readOnly && isSelected
        ? '0 2px 6px rgba(0, 0, 0, 0.2)'
        : '0 1px 3px rgba(0, 0, 0, 0.12)',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    transition: 'none',
  }
}

