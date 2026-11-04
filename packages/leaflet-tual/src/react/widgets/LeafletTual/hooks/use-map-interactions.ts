'use client'

import { useEffect } from 'react'
import type L from 'leaflet'
import type { Controller } from '../../../../core/index.js'
import { setupMapInteractions } from '../../../../core/index.js'

export { setupMapInteractions }

export function useMapInteractions(map: L.Map, controller: Controller) {
  useEffect(() => {
    return setupMapInteractions(map, controller)
  }, [controller, controller.tool, controller.readOnly, map])
}
