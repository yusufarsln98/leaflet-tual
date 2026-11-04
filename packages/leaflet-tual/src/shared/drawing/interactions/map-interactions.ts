import type L from 'leaflet'
import type { Controller } from '../../../core/types.js'

export function setupMapInteractions(
  map: L.Map | undefined,
  controller: Controller,
): () => void {
  if (!map) return () => {}

  const isDrawingTool =
    controller.tool !== 'select' && controller.tool !== 'laser' && !controller.readOnly
  if (isDrawingTool) {
    map.dragging?.disable()
    map.doubleClickZoom?.disable()
  } else {
    map.dragging?.enable()
    map.doubleClickZoom?.enable()
  }

  if (controller.readOnly) {
    map.boxZoom?.enable()
  } else {
    map.boxZoom?.disable()
  }

  return () => {
    map.dragging?.enable()
    map.doubleClickZoom?.enable()
    map.boxZoom?.enable()
  }
}

