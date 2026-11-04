import type { RefObject } from 'react'
import type L from 'leaflet'
import type { Controller, ScreenPoint } from '../../../../../core/index.js'
import {
  applyGestureMouseMove,
  hitTest,
  isClickGesture,
  screenToGeo,
  updateCanvasHoverCursor,
} from '../../../../../core/index.js'
import type { CanvasGesture, PendingClickSelection } from '../types.js'

export interface MouseMoveContext {
  canvasRef: RefObject<HTMLCanvasElement | null>
  map: L.Map
  controller: Controller
  activeGestureRef: RefObject<CanvasGesture | null>
  pendingClickRef: RefObject<PendingClickSelection | null>
  isShiftPressedRef: RefObject<boolean>
  getCanvasPoint: (e: MouseEvent) => ScreenPoint
  setGesture: (g: CanvasGesture | null) => void
  updateHoveredId: (id: string | null) => void
}

export function processMouseMove(e: MouseEvent, ctx: MouseMoveContext): void {
  const {
    canvasRef,
    map,
    controller,
    activeGestureRef,
    pendingClickRef,
    isShiftPressedRef,
    getCanvasPoint,
    setGesture,
    updateHoveredId,
  } = ctx

  const pending = pendingClickRef.current
  if (pending && !isClickGesture(pending.startPt, { x: e.clientX, y: e.clientY })) {
    pendingClickRef.current = null
    if (pending.shiftKey && pending.canvasStartPt && pending.startGeo) {
      const pt = getCanvasPoint(e)
      const geo = screenToGeo(map, pt)
      const marqueeGesture: CanvasGesture = {
        type: 'marquee',
        startPt: pending.canvasStartPt,
        startGeo: pending.startGeo,
        currentPt: pt,
        currentGeo: geo,
      }
      setGesture(marqueeGesture)
      applyGestureMouseMove(controller, map, marqueeGesture, pt, geo, true, setGesture)
      return
    }
  }

  const gesture = activeGestureRef.current
  if (!gesture) {
    if (controller.tool === 'select' && canvasRef.current && e.target === canvasRef.current) {
      const pt = getCanvasPoint(e)
      updateCanvasHoverCursor(canvasRef.current, map, controller, pt)
      const hitItem = [...controller.items].reverse().find((item) => hitTest(item, pt, 12, map))
      updateHoveredId(hitItem?.id ?? null)
    } else {
      updateHoveredId(null)
    }
    return
  }

  updateHoveredId(null)
  isShiftPressedRef.current = e.shiftKey
  const pt = getCanvasPoint(e)
  const geo = screenToGeo(map, pt)
  const shiftKey = Boolean(e.shiftKey)
  applyGestureMouseMove(controller, map, gesture, pt, geo, shiftKey, setGesture)
}

