import { useCallback, useEffect, useRef, type RefObject } from 'react'
import type L from 'leaflet'
import type { Controller, GeoPoint, PenPoint, ScreenPoint } from '../../../../../core/index.js'
import {
  DRAFT_THRESHOLDS,
  geoToScreen,
  isDoubleClickTiming,
  isPointNearPoint,
} from '../../../../../core/index.js'
import type { CanvasGesture } from '../types.js'

export interface UsePenDraftOptions {
  map: L.Map
  controller: Controller
  activeGestureRef: RefObject<CanvasGesture | null>
  setGesture: (g: CanvasGesture | null) => void
}

export { updatePenDraftOnMove } from '../../../../../core/index.js'

export function usePenDraft({
  map,
  controller,
  activeGestureRef,
  setGesture,
}: UsePenDraftOptions) {
  const lastPenClickRef = useRef<{ at: number; pt: ScreenPoint } | null>(null)
  const penFinishedAtRef = useRef(0)

  const finishPen = useCallback(
    (closed = false) => {
      const gesture = activeGestureRef.current
      if (!gesture || gesture.type !== 'pen-draft') return

      if (gesture.points.length >= 2) {
        controller.add({ type: 'pen', points: gesture.points, closed })
      }
      penFinishedAtRef.current = Date.now()
      setGesture(null)
      controller.setTool('select')
    },
    [activeGestureRef, controller, setGesture],
  )

  const handlePenPointerDown = useCallback(
    (pt: ScreenPoint, geo: GeoPoint) => {
      const gesture = activeGestureRef.current
      const now = Date.now()
      const lastClick = lastPenClickRef.current

      if (gesture?.type === 'pen-draft' && isDoubleClickTiming(lastClick, pt, now)) {
        lastPenClickRef.current = null
        finishPen(false)
        return
      }

      if (gesture?.type === 'pen-draft' && gesture.points.length >= 2) {
        const first = geoToScreen(map, gesture.points[0].at)
        if (isPointNearPoint(pt, first, DRAFT_THRESHOLDS.PEN_CLOSE_HIT_RADIUS)) {
          lastPenClickRef.current = null
          finishPen(true)
          return
        }
      }

      const points: PenPoint[] =
        gesture?.type === 'pen-draft'
          ? [...gesture.points, { at: geo }]
          : [{ at: geo }]

      lastPenClickRef.current = { at: now, pt }
      setGesture({
        type: 'pen-draft',
        points,
        activeIndex: points.length - 1,
        dragging: true,
        currentPt: pt,
        currentGeo: geo,
      })
    },
    [activeGestureRef, finishPen, map, setGesture],
  )

  useEffect(() => {
    const gesture = activeGestureRef.current
    if (gesture?.type !== 'pen-draft' || controller.tool === 'pen') return

    if (gesture.points.length >= 2) {
      controller.add({ type: 'pen', points: gesture.points, closed: false })
    }
    penFinishedAtRef.current = Date.now()
    lastPenClickRef.current = null
    setGesture(null)
  }, [activeGestureRef, controller, controller.tool, setGesture])

  const cancelPenDraft = useCallback(() => {
    lastPenClickRef.current = null
    penFinishedAtRef.current = 0
  }, [])

  return {
    lastPenClickRef,
    penFinishedAtRef,
    finishPen,
    handlePenPointerDown,
    cancelPenDraft,
  }
}
