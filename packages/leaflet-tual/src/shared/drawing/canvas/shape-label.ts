import type L from 'leaflet'
import type { ArrowItem, LabelPosition, ShapeItem } from '../../../entities/index.js'
import { defaultVia, geoToScreen, getQuadraticBezierPoint } from '../../geometry/index.js'
import { getItemZoomScale } from '../../geometry/zoom.js'

/** Screen-space height of the shape label pill (10px text + 2px padding per side). */
export const SHAPE_LABEL_PILL_HEIGHT = 14

/** Screen-space gap between a shape edge and a label placed outside it. */
export const SHAPE_LABEL_GAP = 4

/** Distance from the shape edge to the center of an outside label pill. */
export const SHAPE_LABEL_EDGE_OFFSET = SHAPE_LABEL_PILL_HEIGHT / 2 + SHAPE_LABEL_GAP

/**
 * Vertical center for a shape label. Top and bottom positions sit outside the
 * shape's bounding box; center stays on the shape's midpoint.
 */
export function getShapeLabelY(
  position: LabelPosition,
  minY: number,
  maxY: number,
  cy: number,
): number {
  if (position === 'top') return minY - SHAPE_LABEL_EDGE_OFFSET
  if (position === 'bottom') return maxY + SHAPE_LABEL_EDGE_OFFSET
  return cy
}

export function getLabelAnchor(
  map: L.Map,
  target: ShapeItem | ArrowItem,
): { x: number; y: number } {
  if (target.type === 'shape') {
    const center = geoToScreen(map, target.at)
    const scale = getItemZoomScale(map, target)
    const halfH = ((target.height ?? 100) * scale) / 2
    const cy = getShapeLabelY(
      target.labelPosition ?? 'center',
      center.y - halfH,
      center.y + halfH,
      center.y,
    )
    return { x: center.x, y: cy }
  }

  const start = geoToScreen(map, target.from)
  const end = geoToScreen(map, target.to)
  const viaGeo = target.via ?? defaultVia(target.from, target.to)
  const viaScreen = geoToScreen(map, viaGeo)
  const mid = getQuadraticBezierPoint(start, viaScreen, end, 0.5)
  return { x: mid.x, y: mid.y }
}

