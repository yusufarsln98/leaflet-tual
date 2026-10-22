import type L from 'leaflet'
import type { ScreenPoint, TextItem } from '../../types/index.js'
import { getMapDimensions } from '../../shared/geo.js'

export function clampTextPosition(
  map: L.Map,
  screenPos: ScreenPoint,
  item: TextItem,
  dynamicFontSize: number,
  isCompact: boolean,
  isDragging: boolean,
  clampToViewport = true,
): ScreenPoint {
  const mapDims = clampToViewport !== false ? getMapDimensions(map) : null
  if (!mapDims || isDragging) return screenPos

  const isAnchorNearViewport =
    screenPos.x >= -100 &&
    screenPos.x <= mapDims.width + 100 &&
    screenPos.y >= -100 &&
    screenPos.y <= mapDims.height + 100

  if (!isAnchorNearViewport) return screenPos

  const approxHalfW = isCompact
    ? 35
    : Math.max(24, ((item.text || 'Text').length * dynamicFontSize) / 3.6)
  const approxHalfH = isCompact ? 11 : dynamicFontSize / 2 + 4
  const pad = 8

  const minX = approxHalfW + pad
  const maxX = Math.max(minX, mapDims.width - approxHalfW - pad)
  const minY = approxHalfH + pad
  const maxY = Math.max(minY, mapDims.height - approxHalfH - pad)

  return {
    x: Math.max(minX, Math.min(maxX, screenPos.x)),
    y: Math.max(minY, Math.min(maxY, screenPos.y)),
  }
}

