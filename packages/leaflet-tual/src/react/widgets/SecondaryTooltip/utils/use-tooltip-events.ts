'use client'

import { useEffect } from 'react'
import type { RefObject } from 'react'
import type L from 'leaflet'
import type { Controller } from '../../../../core/index.js'
import { useOutsideDismiss } from '../../../ui/index.js'

export interface UseTooltipEventsOptions {
  tooltipRef: RefObject<HTMLDivElement | null>
  map?: L.Map
  controller: Controller
  selectedItemId?: string
  activePopover: string | null
  onClosePopover: () => void
}

export function useTooltipEvents({
  tooltipRef,
  map,
  controller,
  selectedItemId,
  activePopover,
  onClosePopover,
}: UseTooltipEventsOptions) {
  useEffect(() => {
    const el = tooltipRef.current
    if (!el) return
    const stop = (event: Event) => event.stopPropagation()
    el.addEventListener('dblclick', stop)
    el.addEventListener('wheel', stop, { passive: true })
    return () => {
      el.removeEventListener('dblclick', stop)
      el.removeEventListener('wheel', stop)
    }
  }, [selectedItemId, tooltipRef])

  useEffect(() => {
    const handleGlobalUp = () => {
      if (controller.tool === 'select') {
        map?.dragging?.enable()
      }
    }
    window.addEventListener('pointerup', handleGlobalUp)
    window.addEventListener('mouseup', handleGlobalUp)
    window.addEventListener('touchend', handleGlobalUp)
    return () => {
      window.removeEventListener('pointerup', handleGlobalUp)
      window.removeEventListener('mouseup', handleGlobalUp)
      window.removeEventListener('touchend', handleGlobalUp)
    }
  }, [controller.tool, map])

  useOutsideDismiss(tooltipRef, Boolean(activePopover), onClosePopover)
}

