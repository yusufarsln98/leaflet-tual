'use client'

import { useEffect, useState } from 'react'
import type L from 'leaflet'

/**
 * Synchronizes React state and canvas redraws with a Leaflet map's pan, zoom, and resize events.
 */
export function useLeafletSync(
  map: L.Map | null | undefined,
  onRedraw?: () => void,
): number {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!map) return

    let rafId: number | null = null

    const handleEvent = () => {
      onRedraw?.()
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          rafId = null
          setTick((t) => (t + 1) % 1000000)
        })
      }
    }

    map.on('move', handleEvent)
    map.on('zoom', handleEvent)
    map.on('viewreset', handleEvent)
    map.on('resize', handleEvent)

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      map.off('move', handleEvent)
      map.off('zoom', handleEvent)
      map.off('viewreset', handleEvent)
      map.off('resize', handleEvent)
    }
  }, [map, onRedraw])

  return tick
}
