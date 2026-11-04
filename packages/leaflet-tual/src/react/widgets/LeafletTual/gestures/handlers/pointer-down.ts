import type React from 'react'
import type { RefObject } from 'react'
import type L from 'leaflet'
import type { Controller, GeoPoint, Item, ScreenPoint } from '../../../../../core/index.js'
import {
  findResizeGestureUnderPointer,
  getItemBounds,
  hitTest,
  hitTestPenHandle,
  screenToGeo,
} from '../../../../../core/index.js'
import type { CanvasGesture, PendingClickSelection } from '../types.js'

export interface PointerDownContext {
  map: L.Map
  controller: Controller
  isShiftPressedRef: RefObject<boolean>
  pendingClickRef: RefObject<PendingClickSelection | null>
  activeGestureRef: RefObject<CanvasGesture | null>
  wasTualActionRef: RefObject<boolean>
  getCanvasPoint: (e: React.MouseEvent | MouseEvent) => ScreenPoint
  setGesture: (g: CanvasGesture | null) => void
  updateHoveredId: (id: string | null) => void
  handlePenPointerDown: (pt: ScreenPoint, geo: GeoPoint) => void
  handleAreaPointerDown: (pt: ScreenPoint, geo: GeoPoint) => void
}

function handleSelectToolPointerDown(
  e: React.MouseEvent,
  pt: ScreenPoint,
  geo: GeoPoint,
  ctx: PointerDownContext,
): void {
  const { controller, map, setGesture, updateHoveredId, pendingClickRef, wasTualActionRef } = ctx
  let hitItem = [...controller.items].reverse().find((item) => hitTest(item, pt, 0, map))
  if (!hitItem && controller.selection.length === 1) {
    const sel = controller.selected[0]
    if (!sel.locked) {
      const b = getItemBounds(map, sel)
      if (pt.x >= b.minX && pt.x <= b.maxX && pt.y >= b.minY && pt.y <= b.maxY) {
        hitItem = sel
      }
    }
  }

  if (hitItem) {
    wasTualActionRef.current = true
    const isSel = controller.selection.includes(hitItem.id)

    if (!e.shiftKey && hitItem.type === 'pen') {
      const hitHandle = hitTestPenHandle(map, hitItem, pt)
      if (hitHandle) {
        if (!isSel) controller.select([hitItem.id])
        e.preventDefault()
        e.stopPropagation()
        map.dragging?.disable()
        setGesture({
          type: 'edit-pen',
          penId: hitItem.id,
          pointIndex: hitHandle.pointIndex,
          handle: hitHandle.type,
          startGeo: geo,
          initialPoints: hitItem.points,
        })
        return
      }
    }

    if (!isSel || e.shiftKey) {
      updateHoveredId(hitItem.id)
      pendingClickRef.current = {
        itemId: hitItem.id,
        shiftKey: e.shiftKey,
        startPt: { x: e.clientX, y: e.clientY },
        canvasStartPt: pt,
        startGeo: geo,
      }
      if (e.shiftKey) {
        e.preventDefault()
        e.stopPropagation()
        map.dragging?.disable()
      }
      return
    }

    const draggableItems = controller.selection
      .map((id) => controller.items.find((i) => i.id === id))
      .filter((i): i is Item => i !== undefined && !i.locked)
    if (draggableItems.length === 0) {
      pendingClickRef.current = {
        itemId: hitItem.id,
        shiftKey: false,
        startPt: { x: e.clientX, y: e.clientY },
        canvasStartPt: pt,
        startGeo: geo,
      }
      return
    }

    map.dragging?.disable()
    setGesture({
      type: 'drag-item',
      itemIds: draggableItems.map((i) => i.id),
      startPt: pt,
      startGeo: geo,
      initialItems: draggableItems,
    })
    e.preventDefault()
    e.stopPropagation()
  } else if (e.shiftKey) {
    wasTualActionRef.current = true
    e.preventDefault()
    e.stopPropagation()
    map.dragging?.disable()
    setGesture({
      type: 'marquee',
      startPt: pt,
      startGeo: geo,
      currentPt: pt,
      currentGeo: geo,
    })
  } else if (controller.selection.length > 0 || controller.editingId) {
    wasTualActionRef.current = false
    pendingClickRef.current = {
      itemId: null,
      shiftKey: false,
      startPt: { x: e.clientX, y: e.clientY },
    }
  } else {
    wasTualActionRef.current = false
  }
}

export function processPointerDown(e: React.MouseEvent, ctx: PointerDownContext): void {
  const {
    controller,
    map,
    isShiftPressedRef,
    pendingClickRef,
    activeGestureRef,
    wasTualActionRef,
    getCanvasPoint,
    setGesture,
    handlePenPointerDown,
    handleAreaPointerDown,
  } = ctx

  if (controller.readOnly || e.button !== 0) return
  pendingClickRef.current = null
  isShiftPressedRef.current = e.shiftKey
  const pt = getCanvasPoint(e)
  const geo = screenToGeo(map, pt)

  const resize = findResizeGestureUnderPointer(map, controller.selected, pt, geo)
  if (resize) {
    wasTualActionRef.current = true
    e.preventDefault()
    e.stopPropagation()
    map.dragging?.disable()
    setGesture(resize)
    return
  }

  if (controller.tool === 'select') {
    handleSelectToolPointerDown(e, pt, geo, ctx)
    return
  }

  wasTualActionRef.current = true
  e.stopPropagation()

  if (controller.tool === 'note') {
    const note = controller.add({
      type: 'note',
      at: geo,
      width: 180,
      height: 180,
      baseZoom: map.getZoom(),
      text: 'New note',
      style: { color: 'yellow', fillColor: 'yellow', size: 'm' },
    })
    controller.select(note.id)
    controller.setTool('select')
    return
  }

  if (controller.tool === 'text') {
    const text = controller.add({ type: 'text', at: geo, text: 'New text' })
    controller.select(text.id)
    controller.setTool('select')
    return
  }

  if (controller.tool === 'pen') {
    e.preventDefault()
    e.stopPropagation()
    map.dragging?.disable()
    handlePenPointerDown(pt, geo)
    return
  }

  if (controller.tool === 'area') {
    if (activeGestureRef.current?.type === 'area-draft') {
      e.preventDefault()
      e.stopPropagation()
      map.dragging?.disable()
      handleAreaPointerDown(pt, geo)
      return
    }
  }

  setGesture({
    type: 'draw',
    tool: controller.tool,
    variant: controller.variant,
    startPt: pt,
    startGeo: geo,
    currentPt: pt,
    currentGeo: geo,
    freedrawPoints: controller.tool === 'freedraw' ? [geo] : undefined,
  })
}

