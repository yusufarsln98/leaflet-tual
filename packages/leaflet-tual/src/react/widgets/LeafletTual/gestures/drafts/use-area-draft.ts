import { useCallback, useEffect, useRef, type RefObject } from 'react'
import type L from 'leaflet'
import type { Controller, GeoPoint, ScreenPoint } from '../../../../../core/index.js'
import {
  DRAFT_THRESHOLDS,
  geoToScreen,
  isDoubleClickTiming,
  isPointNearPoint,
} from '../../../../../core/index.js'
import type { CanvasGesture } from '../types.js'

export interface UseAreaDraftOptions {
  map: L.Map
  controller: Controller
  activeGestureRef: RefObject<CanvasGesture | null>
  setGesture: (g: CanvasGesture | null) => void
}

export function useAreaDraft({
  map,
  controller,
  activeGestureRef,
  setGesture,
}: UseAreaDraftOptions) {
  const lastAreaClickRef = useRef<{ at: number; pt: ScreenPoint } | null>(null)
  const areaFinishedAtRef = useRef(0)

  const finishArea = useCallback(() => {
    const gesture = activeGestureRef.current
    if (!gesture || gesture.type !== 'area-draft') return

    if (gesture.points.length >= 3) {
      controller.add({ type: 'area', points: gesture.points, baseZoom: map.getZoom() })
    }
    areaFinishedAtRef.current = Date.now()
    setGesture(null)
    controller.setTool('select')
  }, [activeGestureRef, controller, map, setGesture])

  const handleAreaPointerDown = useCallback(
    (pt: ScreenPoint, geo: GeoPoint) => {
      const gesture = activeGestureRef.current
      const now = Date.now()
      const lastClick = lastAreaClickRef.current

      // Double-click detection to finish
      if (gesture?.type === 'area-draft' && isDoubleClickTiming(lastClick, pt, now)) {
        lastAreaClickRef.current = null
        finishArea()
        return
      }

      // Clicking near the first vertex closes/finishes the polygon
      if (gesture?.type === 'area-draft' && gesture.points.length >= 3) {
        const first = geoToScreen(map, gesture.points[0])
        if (isPointNearPoint(pt, first, DRAFT_THRESHOLDS.AREA_CLOSE_HIT_RADIUS)) {
          lastAreaClickRef.current = null
          finishArea()
          return
        }
      }

      const points: GeoPoint[] =
        gesture?.type === 'area-draft'
          ? [...gesture.points, geo]
          : [geo]

      lastAreaClickRef.current = { at: now, pt }
      setGesture({
        type: 'area-draft',
        points,
        currentPt: pt,
        currentGeo: geo,
      })
    },
    [activeGestureRef, finishArea, map, setGesture],
  )

  useEffect(() => {
    const gesture = activeGestureRef.current
    if (gesture?.type !== 'area-draft' || controller.tool === 'area') return

    if (gesture.points.length >= 3) {
      controller.add({ type: 'area', points: gesture.points, baseZoom: map.getZoom() })
    }
    areaFinishedAtRef.current = Date.now()
    lastAreaClickRef.current = null
    setGesture(null)
  }, [activeGestureRef, controller, controller.tool, map, setGesture])

  const cancelAreaDraft = useCallback(() => {
    lastAreaClickRef.current = null
    areaFinishedAtRef.current = 0
  }, [])

  return {
    lastAreaClickRef,
    areaFinishedAtRef,
    finishArea,
    handleAreaPointerDown,
    cancelAreaDraft,
  }
}
