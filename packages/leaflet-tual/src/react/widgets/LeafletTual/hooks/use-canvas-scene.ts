import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react'
import type L from 'leaflet'
import type { Controller } from '../../../../core/index.js'
import { useControllerState, useLeafletSync } from '../../../features/index.js'
import { drawCanvasScene, type CanvasGesture } from '../gestures/index.js'

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

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

  // Controller state changes re-render this hook; draw once after commit instead
  // of drawing from the event callback and again from the render effect.
  useControllerState(controller)

  useIsomorphicLayoutEffect(() => {
    redraw()
  })

  return {
    canvasRef,
    currentZoom,
    redraw,
  }
}
