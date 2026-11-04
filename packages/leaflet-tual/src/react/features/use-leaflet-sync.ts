'use client'

import { useEffect, useRef, useState } from 'react'
import type L from 'leaflet'
import { observeMapMoveZoom } from '../../shared/geometry/map-sync.js'

/**
 * Synchronizes React state and canvas redraws with a Leaflet map's pan, zoom, and resize events.
 */
export function useLeafletSync(
  map: L.Map | null | undefined,
  onRedraw?: () => void,
): number {
  const [tick, setTick] = useState(0)
  const onRedrawRef = useRef(onRedraw)
  onRedrawRef.current = onRedraw

  useEffect(() => {
    return observeMapMoveZoom(
      map,
      () => {
        onRedrawRef.current?.()
        setTick((t) => (t + 1) % 1000000)
      },
      { raf: true },
    )
  }, [map])

  return tick
}

