import { useEffect } from 'react'
import type { RefObject } from 'react'
import L from 'leaflet'
import type { Controller } from '../../../../../core/index.js'
import { hitTest } from '../../../../../core/index.js'
import { isTualUiTarget } from '../../../../../shared/dom/ui-guard.js'

export interface CanvasNativeListenersOptions {
  canvasRef: RefObject<HTMLCanvasElement | null>
  map: L.Map
  controller: Controller
  handleDoubleClick: (e: MouseEvent) => void
  lastUiMouseDownRef: RefObject<number>
  wasTualActionRef: RefObject<boolean>
  onOpenContextMenu: (pt: { x: number; y: number }) => void
  onCloseContextMenu: () => void
}

export function useCanvasNativeListeners({
  canvasRef,
  map,
  controller,
  handleDoubleClick,
  lastUiMouseDownRef,
  wasTualActionRef,
  onOpenContextMenu,
  onCloseContextMenu,
}: CanvasNativeListenersOptions): void {
  useEffect(() => {
    const canvas = canvasRef.current
    const container = canvas?.parentElement
    if (!canvas) return

    const handleContainerDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      if (isTualUiTarget(e.target)) {
        lastUiMouseDownRef.current = Date.now()
      }
    }

    const handleContextMenu = (e: MouseEvent) => {
      if (controller.readOnly) return

      const rect = canvas.getBoundingClientRect()
      const pt = { x: e.clientX - rect.left, y: e.clientY - rect.top }

      const hitItem = [...controller.items].reverse().find((item) => hitTest(item, pt, 12, map))

      if (hitItem) {
        // HIT an item: this is a Tual context menu action!
        e.preventDefault()
        e.stopPropagation()
        if (typeof L !== 'undefined' && L.DomEvent?.stopPropagation) {
          L.DomEvent.stopPropagation(e)
        }

        if (!controller.selection.includes(hitItem.id)) {
          controller.select(hitItem.id)
        }
        controller.edit(null)
        onOpenContextMenu(pt)
      } else {
        // EMPTY map was right-clicked!
        // Close any open Tual context menu and allow event to bubble up to map._container.
        onCloseContextMenu()
      }
    }

    const handleClick = (e: MouseEvent) => {
      if (wasTualActionRef.current || controller.tool !== 'select') {
        e.stopPropagation()
        if (typeof L !== 'undefined' && L.DomEvent?.stopPropagation) {
          L.DomEvent.stopPropagation(e)
        }
        wasTualActionRef.current = false
      }
    }

    canvas.addEventListener('dblclick', handleDoubleClick)
    canvas.addEventListener('contextmenu', handleContextMenu)
    canvas.addEventListener('click', handleClick)
    container?.addEventListener('mousedown', handleContainerDown, true)

    return () => {
      canvas.removeEventListener('dblclick', handleDoubleClick)
      canvas.removeEventListener('contextmenu', handleContextMenu)
      canvas.removeEventListener('click', handleClick)
      container?.removeEventListener('mousedown', handleContainerDown, true)
    }
  }, [
    canvasRef,
    controller,
    handleDoubleClick,
    lastUiMouseDownRef,
    map,
    onCloseContextMenu,
    onOpenContextMenu,
    wasTualActionRef,
  ])
}

