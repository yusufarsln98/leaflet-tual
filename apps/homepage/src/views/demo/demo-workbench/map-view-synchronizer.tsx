'use client'

import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

interface MapViewSynchronizerProps {
  center: [number, number]
  zoom: number
}

export function MapViewSynchronizer({ center, zoom }: MapViewSynchronizerProps) {
  const map = useMap()

  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 })
  }, [map, center, zoom])

  return null
}

