import { useCallback, useState, type RefObject } from 'react'
import type React from 'react'
import type L from 'leaflet'
import type { Controller, Item } from '../../../../core/index.js'
import { hitTest } from '../../../../core/index.js'
import { isTualUiTarget } from '../../../../shared/dom/ui-guard.js'
import type { ContextMenuPosition } from '../../ContextMenu/index.js'

export interface UseContextMenuCoordinatorOptions {
  map: L.Map
  controller: Controller
  canvasRef: RefObject<HTMLCanvasElement | null>
}

export function useContextMenuCoordinator({
  map,
  controller,
  canvasRef,
}: UseContextMenuCoordinatorOptions) {
  const [contextMenuPos, setContextMenuPos] = useState<ContextMenuPosition | null>(null)

  const openContextMenu = useCallback(
    (pt: ContextMenuPosition) => {
      controller.edit(null)
      setContextMenuPos(pt)
    },
    [controller],
  )

  const closeContextMenu = useCallback(() => {
    setContextMenuPos(null)
  }, [])

  const handleOverlayContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (!canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()
      const pt = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      openContextMenu(pt)
    },
    [canvasRef, openContextMenu],
  )

  const handleSidebarItemContextMenu = useCallback(
    (_item: Item, e: React.MouseEvent) => {
      if (!canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()
      const pt = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      openContextMenu(pt)
    },
    [canvasRef, openContextMenu],
  )

  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (controller.readOnly) return
      const target = e.target as Element | null
      if (isTualUiTarget(target)) {
        return
      }
      const canvas = canvasRef.current
      const rect = canvas?.getBoundingClientRect()
      const pt = rect
        ? { x: e.clientX - rect.left, y: e.clientY - rect.top }
        : { x: e.clientX, y: e.clientY }

      const isOverlayItem = target?.closest?.('.tual-note-card, .tual-text-item')
      if (isOverlayItem) {
        e.preventDefault()
        e.stopPropagation()
        openContextMenu(pt)
        return
      }

      const hitItem = [...controller.items].reverse().find((item) => hitTest(item, pt, 12, map))
      if (hitItem) {
        e.preventDefault()
        e.stopPropagation()
        if (!controller.selection.includes(hitItem.id)) {
          controller.select(hitItem.id)
        }
        openContextMenu(pt)
      } else {
        closeContextMenu()
      }
    },
    [canvasRef, closeContextMenu, controller, map, openContextMenu],
  )

  return {
    contextMenuPos,
    setContextMenuPos,
    openContextMenu,
    closeContextMenu,
    handleContextMenu,
    handleOverlayContextMenu,
    handleSidebarItemContextMenu,
  }
}
