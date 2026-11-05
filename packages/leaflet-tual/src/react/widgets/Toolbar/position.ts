import type { ToolbarOrientation, ToolbarPosition } from '../../../core/index.js'

export type ToolbarEdge = 'top' | 'right' | 'bottom' | 'left' | 'center' | 'inline'
export type ToolbarAlignment = 'start' | 'center' | 'end'

export interface ResolvedToolbarPosition {
  edge: ToolbarEdge
  align: ToolbarAlignment
  orientation: ToolbarOrientation
}

const ALIGNMENTS: Record<string, ToolbarAlignment> = {
  top: 'start',
  left: 'start',
  start: 'start',
  center: 'center',
  middle: 'center',
  bottom: 'end',
  right: 'end',
  end: 'end',
}

const ORIENTATIONS: Record<ToolbarEdge, ToolbarOrientation> = {
  top: 'horizontal',
  right: 'vertical',
  bottom: 'horizontal',
  left: 'vertical',
  center: 'horizontal',
  inline: 'vertical',
}

function isToolbarEdge(value: string): value is Exclude<ToolbarEdge, 'center' | 'inline'> {
  return value === 'top' || value === 'right' || value === 'bottom' || value === 'left'
}

/**
 * Resolves a toolbar position into the map edge it is anchored to, its
 * alignment along that edge, and the resulting menu orientation.
 */
export function resolveToolbarPosition(
  position: ToolbarPosition,
  inlineOrientation: ToolbarOrientation = 'vertical',
): ResolvedToolbarPosition {
  if (position === 'inline') {
    return { edge: 'inline', align: 'center', orientation: inlineOrientation }
  }

  if (position === 'center') {
    return { edge: 'center', align: 'center', orientation: ORIENTATIONS.center }
  }

  const [edgePart, alignPart] = position.split('-')
  const edge = isToolbarEdge(edgePart) ? edgePart : 'top'
  const align = alignPart ? ALIGNMENTS[alignPart] ?? 'center' : 'center'

  return { edge, align, orientation: ORIENTATIONS[edge] }
}
