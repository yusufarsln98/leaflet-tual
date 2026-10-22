import type { ToolbarOrientation, ToolbarPosition } from '../../types/index.js'
import { ARROW_TOOL_IDS, type ArrowToolId } from './types.js'

export function isArrowTool(tool: string): tool is ArrowToolId {
  return (ARROW_TOOL_IDS as readonly string[]).includes(tool)
}

/**
 * Returns rotation transform for dropdown indicator chevron (base shape: points down `v`).
 * When closed: points towards the opening direction.
 * When open: flips 180 degrees.
 */
export function getDropdownChevronRotation(
  isOpen: boolean,
  position: ToolbarPosition = 'top-center',
  orientation: ToolbarOrientation = 'horizontal',
): string {
  if (orientation === 'vertical') {
    const isRight = position === 'right' || position === 'right-center'
    if (isRight) {
      // Menu opens to the left
      return isOpen ? 'rotate(-90deg)' : 'rotate(90deg)'
    }
    // Menu opens to the right
    return isOpen ? 'rotate(90deg)' : 'rotate(-90deg)'
  }

  const isBottom = position === 'bottom' || position === 'bottom-center'
  if (isBottom) {
    // Menu opens upwards
    return isOpen ? 'rotate(0deg)' : 'rotate(180deg)'
  }
  // Menu opens downwards
  return isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
}

/**
 * Returns rotation transform for collapse button chevron (base shape: points up `^`).
 * Points towards the screen edge the toolbar collapses into.
 */
export function getCollapseChevronRotation(
  position: ToolbarPosition = 'top-center',
  orientation: ToolbarOrientation = 'horizontal',
): string {
  if (orientation === 'vertical') {
    const isRight = position === 'right' || position === 'right-center'
    return isRight ? 'rotate(90deg)' : 'rotate(-90deg)'
  }

  const isBottom = position === 'bottom' || position === 'bottom-center'
  return isBottom ? 'rotate(180deg)' : 'rotate(0deg)'
}

/**
 * Returns rotation transform for expand button chevron (base shape: points down `v`).
 * Points towards the map interior where the toolbar will expand into.
 */
export function getExpandChevronRotation(
  position: ToolbarPosition = 'top-center',
  orientation: ToolbarOrientation = 'horizontal',
): string {
  if (orientation === 'vertical') {
    const isRight = position === 'right' || position === 'right-center'
    return isRight ? 'rotate(90deg)' : 'rotate(-90deg)'
  }

  const isBottom = position === 'bottom' || position === 'bottom-center'
  return isBottom ? 'rotate(180deg)' : 'rotate(0deg)'
}
