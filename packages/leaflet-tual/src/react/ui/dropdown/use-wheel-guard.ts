'use client'

import { useEffect, useRef } from 'react'
import { stopScrollPropagation } from '../../../shared/dom/wheel-guard.js'

export { stopScrollPropagation }

/**
 * Ref helper that stops wheel scroll events from bubbling out of a
 * popover into the Leaflet map container, so scrolling inside dropdown lists
 * never zooms the map.
 */
export function useWheelGuard<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    return stopScrollPropagation(ref.current)
  }, [])

  return ref
}


