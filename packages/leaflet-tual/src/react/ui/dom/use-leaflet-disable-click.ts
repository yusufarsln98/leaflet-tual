'use client'

import { useEffect } from 'react'
import type { RefObject } from 'react'

/**
 * Prevents Leaflet map click handlers from firing when clicking inside the referenced element.
 * Marks `_leaflet_disable_click = true` on the DOM node so Leaflet's `_isClickDisabled` returns true.
 */
export function useLeafletDisableClick<T extends HTMLElement>(ref: RefObject<T | null>): void {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    ;(el as unknown as Record<string, unknown>)['_leaflet_disable_click'] = true
    return () => {
      delete (el as unknown as Record<string, unknown>)['_leaflet_disable_click']
    }
  }, [ref])
}

