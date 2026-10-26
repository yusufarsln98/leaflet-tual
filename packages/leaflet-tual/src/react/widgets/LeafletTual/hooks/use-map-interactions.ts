'use client'

import { useEffect } from 'react'
import type L from 'leaflet'
import type { Controller } from '../../../../core/index.js'

export function useMapInteractions(map: L.Map, controller: Controller) {
  const hasSelection = controller.selection.length > 0

  useEffect(() => {
    if (!hasSelection) return
    map.scrollWheelZoom?.disable()
    return () => {
      map.scrollWheelZoom?.enable()
    }
  }, [hasSelection, map])

  useEffect(() => {
    const isDrawingTool = controller.tool !== 'select' && !controller.readOnly
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
  }, [controller.tool, controller.readOnly, map])
}
