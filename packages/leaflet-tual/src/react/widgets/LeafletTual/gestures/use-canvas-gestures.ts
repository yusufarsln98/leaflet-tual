import { useCallback, useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import type L from 'leaflet'
import type { Controller, ScreenPoint } from '../../../../core/index.js'
import { getCanvasPoint as getCanvasScreenPoint } from '../../../../core/index.js'
import type { CanvasGesture, PendingClickSelection } from './types.js'
import { usePenDraft, useAreaDraft } from './drafts/index.js'
import {
  processPointerDown,
  processMouseMove,
  processMouseUp,
  processDoubleClick,
  useCanvasNativeListeners,
} from './handlers/index.js'

export interface CanvasGesturesOptions {
  canvasRef: RefObject<HTMLCanvasElement | null>
  map: L.Map
  controller: Controller
  activeGesture: CanvasGesture | null
  setActiveGesture: (g: CanvasGesture | null) => void
  isShiftPressedRef: RefObject<boolean>
  setHoveredItemId?: (id: string | null) => void
  onOpenContextMenu: (pt: { x: number; y: number }) => void
  onCloseContextMenu: () => void
}

export function useCanvasGestures({
  canvasRef,
  map,
  controller,
  activeGesture,
  setActiveGesture,
  isShiftPressedRef,
  setHoveredItemId,
  onOpenContextMenu,
  onCloseContextMenu,
}: CanvasGesturesOptions) {
  const activeGestureRef = useRef<CanvasGesture | null>(activeGesture)
  const lastUiMouseDownRef = useRef(0)
  const pendingClickRef = useRef<PendingClickSelection | null>(null)
  const hoveredItemIdRef = useRef<string | null>(null)
  const wasTualActionRef = useRef(false)

  const updateHoveredId = useCallback(
    (nextId: string | null) => {
      if (hoveredItemIdRef.current !== nextId) {
        hoveredItemIdRef.current = nextId
        setHoveredItemId?.(nextId)
      }
    },
    [setHoveredItemId],
  )

  useEffect(() => {
    activeGestureRef.current = activeGesture
  }, [activeGesture])

  const setGesture = useCallback(
    (gesture: CanvasGesture | null) => {
      activeGestureRef.current = gesture
      setActiveGesture(gesture)
    },
    [setActiveGesture],
  )

  const { finishPen, handlePenPointerDown, cancelPenDraft, penFinishedAtRef } = usePenDraft({
    map,
    controller,
    activeGestureRef,
    setGesture,
  })

  const { finishArea, handleAreaPointerDown, cancelAreaDraft, areaFinishedAtRef } = useAreaDraft({
    map,
    controller,
    activeGestureRef,
    setGesture,
  })

  const getCanvasPoint = useCallback(
    (e: React.MouseEvent | MouseEvent): ScreenPoint => getCanvasScreenPoint(canvasRef.current, e),
    [canvasRef],
  )

  const handlePointerDown = useCallback(
    (e: React.MouseEvent) => {
      processPointerDown(e, {
        map,
        controller,
        isShiftPressedRef,
        pendingClickRef,
        activeGestureRef,
        wasTualActionRef,
        getCanvasPoint,
        setGesture,
        updateHoveredId,
        handlePenPointerDown,
        handleAreaPointerDown,
      })
    },
    [
      activeGestureRef,
      controller,
      getCanvasPoint,
      handleAreaPointerDown,
      handlePenPointerDown,
      isShiftPressedRef,
      map,
      setGesture,
      updateHoveredId,
    ],
  )

  const handleDoubleClick = useCallback(
    (e: MouseEvent) => {
      processDoubleClick(e, {
        map,
        controller,
        lastUiMouseDownRef,
        penFinishedAtRef,
        areaFinishedAtRef,
        getCanvasPoint,
        finishPen,
        finishArea,
      })
    },
    [
      areaFinishedAtRef,
      controller,
      finishArea,
      finishPen,
      getCanvasPoint,
      map,
      penFinishedAtRef,
    ],
  )

  useCanvasNativeListeners({
    canvasRef,
    map,
    controller,
    handleDoubleClick,
    lastUiMouseDownRef,
    wasTualActionRef,
    onOpenContextMenu,
    onCloseContextMenu,
  })

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      processMouseMove(e, {
        canvasRef,
        map,
        controller,
        activeGestureRef,
        pendingClickRef,
        isShiftPressedRef,
        getCanvasPoint,
        setGesture,
        updateHoveredId,
      })
    },
    [
      canvasRef,
      controller,
      getCanvasPoint,
      isShiftPressedRef,
      map,
      setGesture,
      updateHoveredId,
    ],
  )

  const handleMouseUp = useCallback(
    (e?: MouseEvent) => {
      processMouseUp(e, {
        map,
        controller,
        activeGestureRef,
        pendingClickRef,
        isShiftPressedRef,
        getCanvasPoint,
        setGesture,
      })
    },
    [controller, getCanvasPoint, isShiftPressedRef, map, setGesture],
  )

  const cancelGesture = useCallback(() => {
    cancelPenDraft()
    cancelAreaDraft()
    pendingClickRef.current = null
    updateHoveredId(null)
    setGesture(null)
  }, [cancelAreaDraft, cancelPenDraft, setGesture, updateHoveredId])

  return {
    handlePointerDown,
    handleMouseMove,
    handleMouseUp,
    cancelGesture,
    finishPen,
    finishArea,
    clearHover: () => updateHoveredId(null),
  }
}
