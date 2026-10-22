import { useEffect, useState } from 'react'
import type L from 'leaflet'
import { bindLeafletSync } from '../../core/features/map-sync.js'

export interface MapViewportState {
  width: number
  height: number
  tick: number
}

/**
 * Synchronizes React state and canvas redraws with a Leaflet map's pan, zoom, and resize events.
 */
export function useLeafletSync(map: L.Map | null): MapViewportState {
  const [viewport, setViewport] = useState<MapViewportState>({
    width: 0,
    height: 0,
    tick: 0,
  })

  useEffect(() => {
    if (!map) return
    return bindLeafletSync(map, ({ width, height }) => {
      setViewport((prev) => ({
        width,
        height,
        tick: prev.tick + 1,
      }))
    })
  }, [map])

  return viewport
}
