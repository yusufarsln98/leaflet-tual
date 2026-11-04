import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import type L from 'leaflet'
import type { Controller } from '../../../../core/index.js'
import { useControllerState, useLeafletSync } from '../../../features/index.js'
import { drawCanvasScene, type CanvasGesture } from '../gestures/index.js'

export interface UseCanvasSceneOptions {
  map: L.Map
  controller: Controller
  activeGesture: CanvasGesture | null
  hoveredItemId: string | null
  isShiftPressedRef: RefObject<boolean>
}

export function useCanvasScene({
  map,
  controller,
  activeGesture,
  hoveredItemId,
  isShiftPressedRef,
}: UseCanvasSceneOptions) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [currentZoom, setCurrentZoom] = useState(() => map.getZoom())

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawCanvasScene(
      canvas,
      map,
      controller,
      activeGesture,
      isShiftPressedRef.current,
      hoveredItemId,
    )
  }, [activeGesture, controller, hoveredItemId, isShiftPressedRef, map])

  useLeafletSync(map, () => {
    setCurrentZoom(map.getZoom())
    redraw()
  })

  useControllerState(controller, redraw)

  useEffect(() => {
    redraw()
  }, [redraw])

  return {
    canvasRef,
    currentZoom,
    redraw,
  }
}
