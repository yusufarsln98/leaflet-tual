import { useCallback, useEffect, useState, type RefObject } from 'react'
import type React from 'react'
import type L from 'leaflet'
import type { Controller, InternalController, Item } from '../../../../core/index.js'
import { useLeafletDomGuard } from '../../../ui/index.js'
import type { ContextMenuPosition } from '../../ContextMenu/index.js'

export interface UseSidebarInteractionsOptions {
  controller: Controller
  map?: L.Map
  onClose?: () => void
  onItemContextMenu?: (item: Item, e: React.MouseEvent) => void
}

export function useSidebarInteractions({
  controller,
  map,
  onClose,
  onItemContextMenu,
}: UseSidebarInteractionsOptions) {
  const guardRef = useLeafletDomGuard<HTMLElement>()
  const [internalMenuPos, setInternalMenuPos] = useState<ContextMenuPosition | null>(null)

  useEffect(() => {
    if (map) {
      ;(controller as InternalController)._setMap?.(map)
    }
  }, [controller, map])

  useEffect(() => {
    return () => {
      if (controller.tool === 'select') {
        map?.dragging?.enable()
      }
    }
  }, [controller.tool, map])

  const handleMouseEnter = useCallback(() => {
    map?.dragging?.disable()
  }, [map])

  const handleMouseLeave = useCallback(() => {
    if (controller.tool === 'select') {
      map?.dragging?.enable()
    }
  }, [controller.tool, map])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation()
      map?.dragging?.disable()
    },
    [map],
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      map?.dragging?.disable()
    },
    [map],
  )

  const handleClose = useCallback(() => {
    if (controller.tool === 'select') {
      map?.dragging?.enable()
    }
    onClose?.()
  }, [controller.tool, map, onClose])

  const handleItemContextMenu = useCallback(
    (item: Item, e: React.MouseEvent) => {
      if (onItemContextMenu) {
        onItemContextMenu(item, e)
      } else {
        const rect = guardRef.current?.getBoundingClientRect()
        const x = rect ? Math.max(8, e.clientX - rect.left - 216) : e.clientX
        const y = rect ? Math.max(8, e.clientY - rect.top) : e.clientY
        setInternalMenuPos({ x, y })
      }
    },
    [guardRef, onItemContextMenu],
  )

  const closeInternalMenu = useCallback(() => {
    setInternalMenuPos(null)
  }, [])

  return {
    guardRef: guardRef as RefObject<HTMLElement | null>,
    internalMenuPos,
    handleClose,
    handleMouseEnter,
    handleMouseLeave,
    handlePointerDown,
    handleMouseDown,
    handleItemContextMenu,
    closeInternalMenu,
  }
}
