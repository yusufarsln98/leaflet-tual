import type { LabelPosition } from '../types/index.js'

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
