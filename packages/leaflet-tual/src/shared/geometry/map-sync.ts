import type L from 'leaflet'

export interface ObserveMapOptions {
  /** If true, invokes callback within requestAnimationFrame and deduplicates triggers */
  raf?: boolean
}

/**
 * Subscribes to Leaflet map pan, zoom, viewreset, and resize events,
 * returning a cleanup function that detaches all event listeners.
 */
export function observeMapMoveZoom(
  map: L.Map | null | undefined,
  onSync: () => void,
  options: ObserveMapOptions = {},
): () => void {
  if (!map || typeof map.on !== 'function') return () => {}

  let rafId: number | null = null

  const handleSync = () => {
    if (options.raf) {
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          rafId = null
          onSync()
        })
      }
    } else {
      onSync()
    }
  }

  map.on('move', handleSync)
  map.on('zoom', handleSync)
  map.on('viewreset', handleSync)
  map.on('resize', handleSync)

  return () => {
    if (rafId !== null) cancelAnimationFrame(rafId)
    map.off('move', handleSync)
    map.off('zoom', handleSync)
    map.off('viewreset', handleSync)
    map.off('resize', handleSync)
  }
}
