'use client'

import { useEffect, useRef } from 'react'
import type L from 'leaflet'
import { observeMapMoveZoom } from '../../shared/geometry/map-sync.js'

export { observeMapMoveZoom }

/**
 * Synchronizes an overlay DOM element's position with Leaflet map pan, zoom, and resize events
 * directly on the DOM node for buttery-smooth 60/120 FPS performance without React re-render lag.
 */
export function useOverlayMapSync(
  map: L.Map | null | undefined,
  onSync: () => void,
): void {
  const onSyncRef = useRef(onSync)
  onSyncRef.current = onSync

  useEffect(() => {
    return observeMapMoveZoom(map, () => onSyncRef.current())
  }, [map])
}


