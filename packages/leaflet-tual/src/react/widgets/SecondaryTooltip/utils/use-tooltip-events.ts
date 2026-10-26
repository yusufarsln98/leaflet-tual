'use client'

import { useEffect } from 'react'
import type { RefObject } from 'react'
import type L from 'leaflet'
import type { Controller } from '../../../../core/index.js'

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
  // Double-clicking the tooltip or wheel scrolling inside it must never zoom the map
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

  // Re-enable map dragging when any pointerup occurs on window
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

  // Keep menu open until clicking outside (lose focus) or pressing Escape
  useEffect(() => {
    if (!activePopover) return

    const handlePointerDownOutside = (e: MouseEvent | TouchEvent | PointerEvent) => {
      const target = e.target as Node | null
      if (tooltipRef.current && target && !tooltipRef.current.contains(target)) {
        onClosePopover()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClosePopover()
      }
    }

    document.addEventListener('pointerdown', handlePointerDownOutside, true)
    document.addEventListener('mousedown', handlePointerDownOutside, true)
    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDownOutside, true)
      document.removeEventListener('mousedown', handlePointerDownOutside, true)
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [activePopover, onClosePopover, tooltipRef])
}
