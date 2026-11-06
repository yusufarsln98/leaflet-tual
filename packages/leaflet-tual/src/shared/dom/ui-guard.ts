import L from 'leaflet'

export const TUAL_UI_SELECTORS =
  '.tual-secondary-tooltip, .tual-sidebar, .tual-toolbar, .tual-popover, .tual-context-menu, .tual-inline-label-editor, .tual-note-card, .tual-text-item, .tual-control, .tual-panel'

/**
 * Checks whether an event target is inside a Tual floating UI element
 * (e.g. secondary tooltip, toolbar, popover, context menu, or overlays).
 */
export function isTualUiTarget(target: EventTarget | null | undefined): boolean {
  if (!target || !(target as Element).closest) return false
  return Boolean((target as Element).closest(TUAL_UI_SELECTORS))
}

export interface DisableDomPropagationOptions {
  stopContextMenu?: boolean
  stopWheel?: boolean
}

/**
 * Completely isolates a UI element or container from propagating DOM and Leaflet events
 * (clicks, mousedown, dblclick, wheel, and contextmenu) to parent elements and the Leaflet map.
 */
export function disableTualDomPropagation(
  element: HTMLElement | null | undefined,
  options: DisableDomPropagationOptions = {},
): (() => void) | undefined {
  if (!element) return undefined

  const { stopContextMenu = true, stopWheel = true } = options

  // Mark element so Leaflet's _isClickDisabled(el) returns true.
  // This causes Leaflet to ignore native 'click' events on this element or any of its children.
  ;(element as unknown as Record<string, unknown>)['_leaflet_disable_click'] = true

  // Apply Leaflet's DomEvent methods if available
  if (typeof L !== 'undefined' && L.DomEvent) {
    if (typeof L.DomEvent.disableClickPropagation === 'function') {
      L.DomEvent.disableClickPropagation(element)
    }
    if (stopWheel && typeof L.DomEvent.disableScrollPropagation === 'function') {
      L.DomEvent.disableScrollPropagation(element)
    }
  }

  const stop = (e: Event) => {
    e.stopPropagation()
    if (typeof L !== 'undefined' && L.DomEvent?.stopPropagation) {
      L.DomEvent.stopPropagation(e)
    }
  }

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault()
    stop(e)
  }

  if (stopContextMenu) {
    element.addEventListener('contextmenu', handleContextMenu)
  }
  element.addEventListener('mousedown', stop)
  element.addEventListener('touchstart', stop, { passive: false })
  element.addEventListener('dblclick', stop)
  if (stopWheel) {
    element.addEventListener('wheel', stop, { passive: true })
  }

  return () => {
    delete (element as unknown as Record<string, unknown>)['_leaflet_disable_click']
    if (stopContextMenu) {
      element.removeEventListener('contextmenu', handleContextMenu)
    }
    element.removeEventListener('mousedown', stop)
    element.removeEventListener('touchstart', stop)
    element.removeEventListener('dblclick', stop)
    if (stopWheel) {
      element.removeEventListener('wheel', stop)
    }
  }
}

/**
 * Utility for clients to isolate any custom DOM element (sidebar, toolbar, panel)
 * from Leaflet map interactions (clicks, drags, double-clicks, wheel zoom).
 */
export const disableMapInteractions = disableTualDomPropagation
