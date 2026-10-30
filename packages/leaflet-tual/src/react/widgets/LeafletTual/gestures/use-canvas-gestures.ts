import { useCallback, useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import type L from 'leaflet'
import type { Controller, Item, ScreenPoint } from '../../../../core/index.js'
import { hitTest, hitTestPenHandle, isClickGesture, screenToGeo } from '../../../../core/index.js'
import { updateCanvasHoverCursor } from './canvas-cursor.js'
import {
  applyGestureMouseMove,
  commitGestureMouseUp,
  commitPendingClickSelection,
  useCanvasNativeListeners,
} from './canvas-gesture-handlers.js'
import type { CanvasGesture, PendingClickSelection } from './gesture-types.js'
import { findResizeGestureUnderPointer } from './use-canvas-resize-handles.js'
import { usePenDraft } from './use-pen-draft.js'

export interface CanvasGesturesOptions {
  canvasRef: RefObject<HTMLCanvasElement | null>
  map: L.Map
  controller: Controller
  activeGesture: CanvasGesture | null
  setActiveGesture: (g: CanvasGesture | null) => void
  isShiftPressedRef: RefObject<boolean>
  setHoveredItemId?: (id: string | null) => void
}

const UI_DOUBLE_CLICK_GUARD_MS = 500

export function useCanvasGestures({
  canvasRef,
  map,
  controller,
  activeGesture,
  setActiveGesture,
  isShiftPressedRef,
  setHoveredItemId,
}: CanvasGesturesOptions) {
  const activeGestureRef = useRef<CanvasGesture | null>(activeGesture)
  const lastUiMouseDownRef = useRef(0)
  const pendingClickRef = useRef<PendingClickSelection | null>(null)
  const hoveredItemIdRef = useRef<string | null>(null)

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

  const getCanvasPoint = useCallback(
    (e: React.MouseEvent | MouseEvent): ScreenPoint => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }
      const rect = canvas.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    },
    [canvasRef],
  )

  const handlePointerDown = useCallback(
    (e: React.MouseEvent) => {
      if (controller.readOnly || e.button !== 0) return
      pendingClickRef.current = null
      isShiftPressedRef.current = e.shiftKey
      const pt = getCanvasPoint(e)
      const geo = screenToGeo(map, pt)

      const resize = findResizeGestureUnderPointer(map, controller.selected, pt, geo)
      if (resize) {
        e.preventDefault()
        e.stopPropagation()
        map.dragging?.disable()
        setGesture(resize)
        return
      }

      if (controller.tool === 'select') {
        const hitItem = [...controller.items].reverse().find((item) => hitTest(item, pt, 12, map))
        if (hitItem) {
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
          pendingClickRef.current = {
            itemId: null,
            shiftKey: false,
            startPt: { x: e.clientX, y: e.clientY },
          }
        }
        return
      }

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
    },
    [controller, getCanvasPoint, handlePenPointerDown, isShiftPressedRef, map, setGesture],
  )

  const handleDoubleClick = useCallback(
    (e: MouseEvent) => {
      if (Date.now() - lastUiMouseDownRef.current < UI_DOUBLE_CLICK_GUARD_MS) {
        lastUiMouseDownRef.current = 0
        e.preventDefault()
        e.stopPropagation()
        return
      }
      if (!controller.readOnly && controller.tool === 'pen') {
        e.preventDefault()
        e.stopPropagation()
        finishPen(false)
        return
      }
      if (Date.now() - penFinishedAtRef.current < UI_DOUBLE_CLICK_GUARD_MS) {
        e.preventDefault()
        e.stopPropagation()
        return
      }
      if (controller.readOnly || controller.tool !== 'select') return
      const pt = getCanvasPoint(e)
      const hit = [...controller.items].reverse().find((item) => hitTest(item, pt, 16, map))
      if (
        hit &&
        !hit.locked &&
        (hit.type === 'shape' || hit.type === 'arrow' || hit.type === 'text')
      ) {
        e.preventDefault()
        e.stopPropagation()
        controller.select(hit.id)
        controller.edit(hit.id)
      }
    },
    [controller, finishPen, getCanvasPoint, map, penFinishedAtRef],
  )

  useCanvasNativeListeners(canvasRef, handleDoubleClick, lastUiMouseDownRef)

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
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
    },
    [canvasRef, controller, getCanvasPoint, isShiftPressedRef, map, setGesture, updateHoveredId],
  )

  const handleMouseUp = useCallback(
    (e?: MouseEvent) => {
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
      const currentPt = 'currentPt' in gesture ? gesture.currentPt : { x: 0, y: 0 }
      const currentGeo = 'currentGeo' in gesture ? gesture.currentGeo : { lat: 0, lng: 0 }
      const endPt = e ? getCanvasPoint(e) : currentPt
      const endGeo = e ? screenToGeo(map, endPt) : currentGeo
      const shiftKey = Boolean(e ? e.shiftKey : isShiftPressedRef.current)
      commitGestureMouseUp(controller, map, gesture, endPt, endGeo, shiftKey)
      setGesture(null)
    },
    [canvasRef, controller, getCanvasPoint, isShiftPressedRef, map, setGesture],
  )

  const cancelGesture = useCallback(() => {
    cancelPenDraft()
    pendingClickRef.current = null
    updateHoveredId(null)
    setGesture(null)
  }, [cancelPenDraft, setGesture, updateHoveredId])

  return {
    handlePointerDown,
    handleMouseMove,
    handleMouseUp,
    cancelGesture,
    finishPen,
    clearHover: () => updateHoveredId(null),
  }
}
