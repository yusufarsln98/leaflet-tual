import type L from 'leaflet'

export interface MapViewportDimensions {
  width: number
  height: number
}

export function bindLeafletSync(
  map: L.Map,
  onSync: (dimensions: MapViewportDimensions) => void,
): () => void {
  const sync = () => {
    const size = map.getSize()
    onSync({ width: size.x, height: size.y })
  }

  sync()

  map.on('move', sync)
  map.on('zoom', sync)
  map.on('zoomanim', sync)
  map.on('viewreset', sync)
  map.on('resize', sync)

  return () => {
    map.off('move', sync)
    map.off('zoom', sync)
    map.off('zoomanim', sync)
    map.off('viewreset', sync)
    map.off('resize', sync)
  }
}

type LeafletFlaggedElement = HTMLElement & { _leaflet_disable_events?: boolean }

export function bindBlockMapDblClick(map: L.Map): () => void {
  const container = map.getContainer()
  if (!container) return () => {}

  const handleDblClickCapture = (e: MouseEvent) => {
    const target = e.target as LeafletFlaggedElement | null
    if (
      !target?.closest?.(
        '[data-tual-overlay], input, textarea, select, button, .rlc-overlay',
      )
    ) {
      return
    }

    const hadFlag = Object.prototype.hasOwnProperty.call(
      target,
      '_leaflet_disable_events',
    )
    const previous = target._leaflet_disable_events
    target._leaflet_disable_events = true

    const wasZoomEnabled = Boolean(map.doubleClickZoom?.enabled?.())
    if (wasZoomEnabled) {
      map.doubleClickZoom.disable()
    }

    setTimeout(() => {
      if (hadFlag) {
        target._leaflet_disable_events = previous
      } else {
        delete target._leaflet_disable_events
      }
      if (wasZoomEnabled) {
        map.doubleClickZoom.enable()
      }
    }, 0)
  }

  const handleMouseDownCapture = (e: MouseEvent | TouchEvent) => {
    const target = e.target as HTMLElement | null
    if (
      target?.closest?.(
        'textarea, input, select, button, [data-tual-note-resize], .rlc-note-resize-handle',
      )
    ) {
      if (map.dragging?.enabled?.()) {
        map.dragging.disable()
        const handleUp = () => {
          map.dragging.enable()
          window.removeEventListener('mouseup', handleUp, true)
          window.removeEventListener('touchend', handleUp, true)
          window.removeEventListener('pointerup', handleUp, true)
        }
        window.addEventListener('mouseup', handleUp, {
          capture: true,
          once: true,
        })
        window.addEventListener('touchend', handleUp, {
          capture: true,
          once: true,
        })
        window.addEventListener('pointerup', handleUp, {
          capture: true,
          once: true,
        })
      }
    }
  }

  container.addEventListener('dblclick', handleDblClickCapture, true)
  container.addEventListener('mousedown', handleMouseDownCapture, true)
  container.addEventListener('touchstart', handleMouseDownCapture, true)

  return () => {
    container.removeEventListener('dblclick', handleDblClickCapture, true)
    container.removeEventListener('mousedown', handleMouseDownCapture, true)
    container.removeEventListener('touchstart', handleMouseDownCapture, true)
  }
}

