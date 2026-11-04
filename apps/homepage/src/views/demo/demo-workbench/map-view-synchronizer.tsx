'use client'

import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'

interface MapViewSynchronizerProps {
  center: [number, number]
  zoom: number
}

export function MapViewSynchronizer({ center, zoom }: MapViewSynchronizerProps) {
  const map = useMap()
  const isInitialRef = useRef(true)
  const prevRef = useRef<{ center: [number, number]; zoom: number }>({ center, zoom })

  useEffect(() => {
    // Skip on initial mount since MapContainer is already initialized at center and zoom.
    // This prevents flyTo animation locks, canvas item jitter, and pan delays on startup.
    if (isInitialRef.current) {
      isInitialRef.current = false
      return
    }

    const prev = prevRef.current
    if (prev.center[0] === center[0] && prev.center[1] === center[1] && prev.zoom === zoom) {
      return
    }

    prevRef.current = { center, zoom }
    map.flyTo(center, zoom, { duration: 3 })
  }, [map, center, zoom])

  return null
}
