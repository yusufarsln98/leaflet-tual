import { useEffect, useMemo, useRef } from 'react'
import type L from 'leaflet'
import type { CanvasItem, CanvasTool } from '../../types/index.js'

export function useStableItemArray<T extends CanvasItem>(
  items: CanvasItem[],
  type: T['type'],
): T[] {
  const prevRef = useRef<T[]>([])
  return useMemo(() => {
    const next = items.filter((it): it is T => it.type === type)
    if (
      prevRef.current.length === next.length &&
      prevRef.current.every((item, i) => item === next[i])
    ) {
      return prevRef.current
    }
    prevRef.current = next
    return next
  }, [items, type])
}

export function useOutsideCanvasPointerDown(
  map: L.Map | null,
  isReadOnly: boolean,
  activeTool: CanvasTool,
  setActiveTool: (tool: CanvasTool) => void,
  selectedId: string | null,
  setSelectedId: (id: string | null) => void,
  notifyChangeComplete: () => void,
) {
  useEffect(() => {
    if (!map || isReadOnly) return

    const handleWindowPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return
      const target = e.target as HTMLElement | null
      const mapEl = map.getContainer()
      if (
        mapEl.contains(target) ||
        target?.closest?.(
          '[data-rlc-overlay], [data-rlc-toolbar], [data-rlc-note], [data-rlc-text], .leaflet-control',
        )
      ) {
        return
      }

      if (activeTool !== 'select') setActiveTool('select')
      if (selectedId) setSelectedId(null)
      notifyChangeComplete()
    }

    window.addEventListener('pointerdown', handleWindowPointerDown)
    return () => window.removeEventListener('pointerdown', handleWindowPointerDown)
  }, [map, isReadOnly, activeTool, setActiveTool, selectedId, setSelectedId, notifyChangeComplete])
}

