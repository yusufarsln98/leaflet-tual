'use client'

import { useEffect, useRef } from 'react'

/**
 * Ref helper that stops wheel (and touch scroll) events from bubbling out of a
 * popover into the Leaflet map container, so scrolling inside ColorDropdown-like
 * lists never zooms the map.
 */
export function useWheelGuard<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const stop = (event: Event) => event.stopPropagation()
    el.addEventListener('wheel', stop, { passive: true })
    el.addEventListener('touchmove', stop, { passive: true })
    return () => {
      el.removeEventListener('wheel', stop)
      el.removeEventListener('touchmove', stop)
    }
  }, [])

  return ref
}
