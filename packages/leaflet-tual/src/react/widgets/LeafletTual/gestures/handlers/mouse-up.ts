import type { RefObject } from 'react'
import type L from 'leaflet'
import type { Controller, ScreenPoint } from '../../../../../core/index.js'
import {
  commitGestureMouseUp,
  commitPendingClickSelection,
  isClickGesture,
  screenToGeo,
} from '../../../../../core/index.js'
import type { CanvasGesture, PendingClickSelection } from '../types.js'

export interface MouseUpContext {
  map: L.Map
  controller: Controller
  activeGestureRef: RefObject<CanvasGesture | null>
  pendingClickRef: RefObject<PendingClickSelection | null>
  isShiftPressedRef: RefObject<boolean>
  getCanvasPoint: (e: MouseEvent) => ScreenPoint
  setGesture: (g: CanvasGesture | null) => void
}

export function processMouseUp(e: MouseEvent | undefined, ctx: MouseUpContext): void {
  const {
    map,
    controller,
    activeGestureRef,
    pendingClickRef,
    isShiftPressedRef,
    getCanvasPoint,
    setGesture,
  } = ctx

  if (e && e.button !== 0) return
  const pending = pendingClickRef.current
  pendingClickRef.current = null
  if (pending && (!e || isClickGesture(pending.startPt, { x: e.clientX, y: e.clientY }))) {
    commitPendingClickSelection(controller, pending, map)
  }

  const gesture = activeGestureRef.current
  if (!gesture) return

  if (gesture.type === 'pen-draft') {
    setGesture({ ...gesture, dragging: false, activeIndex: null })
    return
  }

  if (gesture.type === 'area-draft') {
    return
  }

  const currentPt = 'currentPt' in gesture ? gesture.currentPt : { x: 0, y: 0 }
  const currentGeo = 'currentGeo' in gesture ? gesture.currentGeo : { lat: 0, lng: 0 }
  const endPt = e ? getCanvasPoint(e) : currentPt
  const endGeo = e ? screenToGeo(map, endPt) : currentGeo
  const shiftKey = Boolean(e ? e.shiftKey : isShiftPressedRef.current)

  if (gesture.type === 'draw' && gesture.tool === 'area') {
    if (isClickGesture(gesture.startPt, endPt)) {
      setGesture({
        type: 'area-draft',
        points: [gesture.startGeo],
        currentPt: endPt,
        currentGeo: endGeo,
      })
      return
    }
  }

  commitGestureMouseUp(controller, map, gesture, endPt, endGeo, shiftKey)
  setGesture(null)
}

