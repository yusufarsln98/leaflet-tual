const TUAL_UI_SELECTORS =
  '.tual-secondary-tooltip, .tual-toolbar, .tual-popover, .tual-context-menu, .tual-sidebar'

/**
 * Checks whether an event target is inside a Tual floating UI element
 * (e.g. secondary tooltip, toolbar, popover, context menu, or sidebar).
 */
export function isTualUiTarget(target: EventTarget | null | undefined): boolean {
  if (!target || !(target as Element).closest) return false
  return Boolean((target as Element).closest(TUAL_UI_SELECTORS))
}
