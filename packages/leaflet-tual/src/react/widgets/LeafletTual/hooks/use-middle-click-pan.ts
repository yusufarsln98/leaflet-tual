'use client'

import { useEffect } from 'react'
import type { RefObject } from 'react'
import type L from 'leaflet'
import { setupMiddleClickPan } from '../../../../core/index.js'

export { setupMiddleClickPan }

export function useMiddleClickPan(
  map: L.Map | undefined,
  containerRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!map || !containerRef.current) return
    return setupMiddleClickPan(map, containerRef.current)
  }, [containerRef, map])
}
