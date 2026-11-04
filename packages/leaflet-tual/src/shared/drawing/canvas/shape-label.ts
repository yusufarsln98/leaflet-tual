import type L from 'leaflet'
import type { ArrowItem, LabelPosition, ShapeItem } from '../../../entities/index.js'
import {
  defaultVia,
  geoToScreen,
  getCubicBezierPoint,
  getQuadraticBezierPoint,
} from '../../geometry/index.js'
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

export function getArrowLabelCenter(
  map: L.Map,
  arrow: ArrowItem,
): { x: number; y: number } {
  const start = geoToScreen(map, arrow.from)
  const end = geoToScreen(map, arrow.to)

  if (arrow.kind === 'curved') {
    const viaGeo = arrow.via ?? defaultVia(arrow.from, arrow.to)
    const viaScreen = geoToScreen(map, viaGeo)
    const pt = getQuadraticBezierPoint(start, viaScreen, end, 0.5)
    return { x: Math.round(pt.x), y: Math.round(pt.y) }
  }

  if (arrow.kind === 'elbow') {
    const corner = { x: end.x, y: start.y }
    return {
      x: Math.round((corner.x + end.x) / 2),
      y: Math.round((corner.y + end.y) / 2),
    }
  }

  if (arrow.kind === 's-curve') {
    const c1 = { x: start.x + (end.x - start.x) * 0.5, y: start.y }
    const c2 = { x: start.x + (end.x - start.x) * 0.5, y: end.y }
    const pt = getCubicBezierPoint(start, c1, c2, end, 0.5)
    return { x: Math.round(pt.x), y: Math.round(pt.y) }
  }

  // linear or fallback
  return {
    x: Math.round((start.x + end.x) / 2),
    y: Math.round((start.y + end.y) / 2),
  }
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
    return { x: Math.round(center.x), y: Math.round(cy) }
  }

  return getArrowLabelCenter(map, target)
}

