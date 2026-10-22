'use client'

import { useEffect } from 'react'
import type L from 'leaflet'
import { bindBlockMapDblClick } from '../../../core/features/map-sync.js'

export function useBlockMapDblClick(map: L.Map | null) {
  useEffect(() => {
    if (!map) return
    return bindBlockMapDblClick(map)
  }, [map])
}
