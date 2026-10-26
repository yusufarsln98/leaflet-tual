import { useCallback, useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import type L from 'leaflet'
import type {
  ArrowItem,
  ArrowKind,
  Controller,
  Item,
  PenPoint,
  RulerItem,
  ScreenPoint,
  ShapeItem,
  ShapeKind,
} from '../../../core/index.js'
import {
  geoToScreen,
  hitTest,
  screenToGeo,
  snapAngle,
} from '../../../core/index.js'
import { isClickGesture, resolveShapeDragBounds, resolveShapePlacement } from '../../../core/shared/shape-drawing.js'
import { translateItem, worldDelta } from '../../../core/shared/translate.js'
import type { CanvasGesture } from './use-canvas-drawing.js'
import { editPenPointList, hitTestPenHandle } from './use-pen-handles.js'
import { hitTestArrowHandle, hitTestRulerHandle, hitTestShapeHandle, resizeShape, resizeShapeInWorld } from './use-shape-handles.js'

export interface CanvasGesturesOptions {
  canvasRef: RefObject<HTMLCanvasElement | null>; map: L.Map; controller: Controller
  activeGesture: CanvasGesture | null; setActiveGesture: (g: CanvasGesture | null) => void
  isShiftPressedRef: RefObject<boolean>
}

/** Double-clicks that begin on tual UI must never reach the map's zoom handler. */
const UI_DOUBLE_CLICK_GUARD_MS = 500
/** Distance in screen pixels that closes a pen path when clicking its first anchor. */
const PEN_CLOSE_HIT_RADIUS = 10
/** Two pen clicks closer than this (in time and space) finish the path. */
const PEN_DOUBLE_CLICK_MS = 320
const PEN_DOUBLE_CLICK_DISTANCE = 6

export function useCanvasGestures({
  canvasRef,
  map,
  controller,
  activeGesture,
  setActiveGesture,
  isShiftPressedRef,
}: CanvasGesturesOptions) {
  const activeGestureRef = useRef<CanvasGesture | null>(activeGesture)
  const lastUiMouseDownRef = useRef(0)
  const lastPenClickRef = useRef<{ at: number; pt: ScreenPoint } | null>(null)
  const penFinishedAtRef = useRef(0)

  // Keep the ref in sync when the gesture is reset from outside this hook
  // (for example by the Escape shortcut).
  useEffect(() => {
    activeGestureRef.current = activeGesture
  }, [activeGesture])

  const setGesture = useCallback((gesture: CanvasGesture | null) => {
    // Update the ref immediately so a fast drag never reads stale state.
    activeGestureRef.current = gesture
    setActiveGesture(gesture)
  }, [setActiveGesture])

  const getCanvasPoint = useCallback((e: React.MouseEvent | MouseEvent): ScreenPoint => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }, [canvasRef])

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
    [controller, setGesture],
  )

  const handlePenPointerDown = useCallback(
    (pt: ScreenPoint, geo: { lat: number; lng: number }) => {
      const gesture = activeGestureRef.current
      const now = Date.now()
      const lastClick = lastPenClickRef.current

      // A second click in the same place finishes the path. The first click of
      // the pair already placed the final anchor.
      if (
        gesture?.type === 'pen-draft' &&
        lastClick &&
        now - lastClick.at <= PEN_DOUBLE_CLICK_MS &&
        Math.hypot(pt.x - lastClick.pt.x, pt.y - lastClick.pt.y) <= PEN_DOUBLE_CLICK_DISTANCE
      ) {
        lastPenClickRef.current = null
        finishPen(false)
        return
      }

      // Clicking the first anchor closes the path.
      if (gesture?.type === 'pen-draft' && gesture.points.length >= 2) {
        const first = geoToScreen(map, gesture.points[0].at)
        if (Math.hypot(pt.x - first.x, pt.y - first.y) <= PEN_CLOSE_HIT_RADIUS) {
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
    [finishPen, map, setGesture],
  )

  // Leaving the pen tool keeps a usable path instead of silently dropping it.
  useEffect(() => {
    const gesture = activeGestureRef.current
    if (gesture?.type !== 'pen-draft' || controller.tool === 'pen') return

    if (gesture.points.length >= 2) {
      controller.add({ type: 'pen', points: gesture.points, closed: false })
    }
    penFinishedAtRef.current = Date.now()
    lastPenClickRef.current = null
    setGesture(null)
  }, [controller, controller.tool, setGesture])

  const handlePointerDown = useCallback((e: React.MouseEvent) => {
    if (controller.readOnly) return
    isShiftPressedRef.current = e.shiftKey
    const pt = getCanvasPoint(e)
    const geo = screenToGeo(map, pt)

    // Resize handles always win over the active tool. Otherwise grabbing a
    // handle while a drawing tool is somehow still active starts a brand-new
    // shape instead of resizing the selected one.
    for (const item of controller.selected) {
      if (item.type === 'shape') {
        const hitHandle = hitTestShapeHandle(map, item, pt, 8)
        if (hitHandle) {
          e.preventDefault(); e.stopPropagation(); map.dragging?.disable()
          setGesture({
            type: 'resize-shape',
            shapeId: item.id,
            handle: hitHandle.type,
            initialAt: item.at,
            initialWidth: item.width,
            initialHeight: item.height,
            initialFrom: (item as any).from,
            initialTo: (item as any).to,
            startPt: pt,
            startGeo: geo,
          })
          return
        }
      } else if (item.type === 'arrow') {
        const hitHandle = hitTestArrowHandle(map, item, pt, 8)
        if (hitHandle) {
          e.preventDefault(); e.stopPropagation(); map.dragging?.disable()
          setGesture({ type: 'resize-arrow', arrowId: item.id, handle: hitHandle, startGeo: geo })
          return
        }
      } else if (item.type === 'ruler') {
        const hitHandle = hitTestRulerHandle(map, item, pt, 8)
        if (hitHandle) {
          e.preventDefault(); e.stopPropagation(); map.dragging?.disable()
          setGesture({ type: 'resize-ruler', rulerId: item.id, handle: hitHandle, startGeo: geo })
          return
        }
      } else if (item.type === 'pen') {
        const hitHandle = hitTestPenHandle(map, item, pt, 8)
        if (hitHandle) {
          e.preventDefault(); e.stopPropagation(); map.dragging?.disable()
          setGesture({
            type: 'edit-pen',
            penId: item.id,
            pointIndex: hitHandle.pointIndex,
            handle: hitHandle.type,
            startGeo: geo,
            initialPoints: item.points,
          })
          return
        }
      }
    }

    if (controller.tool === 'select') {
      const items = [...controller.items].reverse()
      const hitItem = items.find((item) => hitTest(item, pt, 12, map))

      if (hitItem) {
        const isSel = controller.selection.includes(hitItem.id)
        if (e.shiftKey) {
          const nextSel = isSel
            ? controller.selection.filter((id) => id !== hitItem.id)
            : [...controller.selection, hitItem.id]
          controller.select(nextSel)
          e.preventDefault()
          e.stopPropagation()
        } else if (!isSel) {
          controller.select([hitItem.id])
          e.preventDefault()
          e.stopPropagation()
        } else {
          // Already selected: dragging moves the item(s)
          e.preventDefault()
          e.stopPropagation()
          map.dragging?.disable()

          setGesture({
            type: 'drag-item',
            itemIds: controller.selection,
            startPt: pt,
            startGeo: geo,
            initialItems: controller.selection
              .map((id) => controller.items.find((item) => item.id === id))
              .filter((item): item is Item => Boolean(item)),
          })
        }
      } else {
        controller.select(null)
        controller.edit(null)
      }
      return
    }

    if (controller.tool === 'note') {
      const zoom = map.getZoom()
      const note = controller.add({
        type: 'note',
        at: geo,
        width: 180,
        height: 180,
        baseZoom: zoom,
        text: 'New note',
        style: { color: 'yellow', fillColor: 'yellow', size: 'm' },
      })
      controller.select(note.id); controller.setTool('select')
      return
    }

    if (controller.tool === 'text') {
      const text = controller.add({ type: 'text', at: geo, text: 'New text' })
      controller.select(text.id); controller.setTool('select')
      return
    }

    if (controller.tool === 'pen') {
      e.preventDefault(); e.stopPropagation(); map.dragging?.disable()
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
  }, [controller, getCanvasPoint, handlePenPointerDown, isShiftPressedRef, map, setGesture])

  const handleContainerMouseDown = useCallback((e: MouseEvent) => {
    const target = e.target as Element | null
    if (target?.closest?.('.tual-secondary-tooltip, .tual-toolbar, .tual-popover')) {
      lastUiMouseDownRef.current = Date.now()
    }
  }, [])

  const handleDoubleClick = useCallback((e: MouseEvent) => {
    // A double-click that began on the toolbar, tooltip or another overlay
    // should never zoom the map. The UI may have closed after the first click,
    // so the second click can land on the canvas.
    if (Date.now() - lastUiMouseDownRef.current < UI_DOUBLE_CLICK_GUARD_MS) {
      lastUiMouseDownRef.current = 0
      e.preventDefault()
      e.stopPropagation()
      return
    }
    if (!controller.readOnly && controller.tool === 'pen') {
      // The second click of the pair already finished the path; never zoom.
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
    const items = [...controller.items].reverse()
    const hit = items.find((item) => hitTest(item, pt, 16, map))
    if (hit && (hit.type === 'shape' || hit.type === 'arrow' || hit.type === 'text')) {
      // Stop Leaflet's map-level dblclick zoom before it reaches the container.
      e.preventDefault()
      e.stopPropagation()
      controller.select(hit.id)
      controller.edit(hit.id)
    }
  }, [controller, finishPen, getCanvasPoint, map])

  // Native listeners so we can stop propagation before Leaflet's double-click
  // zoom handler receives the event.
  useEffect(() => {
    const canvas = canvasRef.current
    const container = canvas?.parentElement
    if (!canvas) return
    canvas.addEventListener('dblclick', handleDoubleClick)
    container?.addEventListener('mousedown', handleContainerMouseDown, true)
    return () => {
      canvas.removeEventListener('dblclick', handleDoubleClick)
      container?.removeEventListener('mousedown', handleContainerMouseDown, true)
    }
  }, [canvasRef, handleContainerMouseDown, handleDoubleClick])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const gesture = activeGestureRef.current
    if (!gesture) {
      if (controller.tool === 'select' && canvasRef.current && e.target === canvasRef.current) {
        const pt = getCanvasPoint(e)
        const selected = controller.selected
        if (selected.length === 1 && selected[0].type === 'shape') {
          const hitHandle = hitTestShapeHandle(map, selected[0] as ShapeItem, pt, 8)
          if (hitHandle) { canvasRef.current.style.cursor = hitHandle.cursor; return }
        } else if (selected.length === 1 && selected[0].type === 'arrow') {
          const hitHandle = hitTestArrowHandle(map, selected[0] as ArrowItem, pt, 8)
          if (hitHandle) { canvasRef.current.style.cursor = 'crosshair'; return }
        } else if (selected.length === 1 && selected[0].type === 'ruler') {
          const hitHandle = hitTestRulerHandle(map, selected[0] as RulerItem, pt, 8)
          if (hitHandle) { canvasRef.current.style.cursor = 'crosshair'; return }
        } else if (selected.length === 1 && selected[0].type === 'pen') {
          const hitHandle = hitTestPenHandle(map, selected[0], pt, 8)
          if (hitHandle) { canvasRef.current.style.cursor = hitHandle.cursor; return }
        }
        const hitSelected = controller.selected.some((i) => hitTest(i, pt, 12, map))
        if (hitSelected) {
          canvasRef.current.style.cursor = 'move'
          return
        }
        const hit = controller.items.some((i) => hitTest(i, pt, 12, map))
        canvasRef.current.style.cursor = hit ? 'pointer' : 'default'
      }
      return
    }
    isShiftPressedRef.current = e.shiftKey
    const pt = getCanvasPoint(e)
    const geo = screenToGeo(map, pt)

    if (gesture.type === 'pen-draft') {
      const points =
        gesture.dragging && gesture.activeIndex !== null
          ? gesture.points.map((point, index) => {
              if (index !== gesture.activeIndex) return point
              return {
                at: point.at,
                in: {
                  lat: point.at.lat * 2 - geo.lat,
                  lng: point.at.lng * 2 - geo.lng,
                },
                out: geo,
              }
            })
          : gesture.points

      setGesture({ ...gesture, points, currentPt: pt, currentGeo: geo })
    } else if (gesture.type === 'draw') {
      const nextFreedraw =
        gesture.tool === 'freedraw' && gesture.freedrawPoints
          ? [...gesture.freedrawPoints, geo]
          : undefined
      setGesture({ ...gesture, currentPt: pt, currentGeo: geo, freedrawPoints: nextFreedraw })
    } else if (gesture.type === 'edit-pen') {
      controller.update(
        gesture.penId,
        {
          points: editPenPointList(
            gesture.initialPoints,
            gesture.pointIndex,
            gesture.handle,
            gesture.startGeo,
            geo,
          ),
        },
        false,
      )
    } else if (gesture.type === 'resize-shape') {
      const item = controller.items.find((i) => i.id === gesture.shapeId)
      if (item && item.type === 'shape') {
        if (gesture.initialFrom && gesture.initialTo) {
          const next = resizeShapeInWorld(
            gesture.initialFrom,
            gesture.initialTo,
            geo,
            gesture.handle,
            Boolean(isShiftPressedRef.current),
          )
          controller.update(gesture.shapeId, next as any, false)
        } else if (gesture.initialAt) {
          const next = resizeShape(
            map,
            item,
            gesture.initialAt,
            gesture.initialWidth ?? 96,
            gesture.initialHeight ?? 96,
            pt,
            gesture.handle,
            Boolean(isShiftPressedRef.current),
          )
          controller.update(gesture.shapeId, next, false)
        }
      }
    } else if (gesture.type === 'resize-arrow') {
      if (gesture.handle === 'start') controller.update(gesture.arrowId, { from: geo }, false)
      else if (gesture.handle === 'end') controller.update(gesture.arrowId, { to: geo }, false)
      else if (gesture.handle === 'via') controller.update(gesture.arrowId, { via: geo }, false)
    } else if (gesture.type === 'resize-ruler') {
      if (gesture.handle === 'start') controller.update(gesture.rulerId, { from: geo }, false)
      else controller.update(gesture.rulerId, { to: geo }, false)
    } else if (gesture.type === 'drag-item') {
      const delta = worldDelta(gesture.startGeo, geo)
      for (const item of gesture.initialItems) {
        controller.update(item.id, translateItem(item, delta), false)
      }
    }
  }, [canvasRef, controller, getCanvasPoint, isShiftPressedRef, map, setGesture])

  const handleMouseUp = useCallback((e?: MouseEvent) => {
    const gesture = activeGestureRef.current
    // Ignore mouseup events that do not belong to a canvas gesture (for
    // example releasing the mouse after clicking the toolbar). Re-enabling the
    // map here would start panning even though a drawing tool is active.
    if (!gesture) return

    if (gesture.type === 'pen-draft') {
      // Keep the draft alive across clicks; Enter, the first anchor or a
      // double-click finishes it.
      setGesture({ ...gesture, dragging: false, activeIndex: null })
      return
    }

    if (gesture.type === 'edit-pen') {
      controller.update(gesture.penId, {}, true)
      map.dragging?.enable()
    } else if (gesture.type === 'resize-shape') {
      const item = controller.items.find((i) => i.id === gesture.shapeId)
      if (item && item.type === 'shape') {
        if ((item as any).from && (item as any).to) {
          controller.update(item.id, { from: (item as any).from, to: (item as any).to } as any, true)
        } else {
          controller.update(item.id, { at: item.at, width: item.width, height: item.height }, true)
        }
      }
      map.dragging?.enable()
    } else if (gesture.type === 'resize-arrow') {
      controller.update(gesture.arrowId, {}, true)
      map.dragging?.enable()
    } else if (gesture.type === 'resize-ruler') {
      controller.update(gesture.rulerId, {}, true)
      map.dragging?.enable()
    } else if (gesture.type === 'drag-item') {
      for (const id of gesture.itemIds) {
        const item = controller.items.find((i) => i.id === id)
        if (item) controller.update(id, {}, true)
      }
      map.dragging?.enable()
    } else if (gesture.type === 'draw') {
      // Prefer the release point: the final mousemove can be dropped or throttled,
      // which would otherwise leave a drag-created shape at its tiny initial size.
      const endPt = e ? getCanvasPoint(e) : gesture.currentPt
      const endGeo = e ? screenToGeo(map, endPt) : gesture.currentGeo
      const shiftKey = e ? e.shiftKey : isShiftPressedRef.current

      if (gesture.tool === 'arrow') {
        if (!isClickGesture(gesture.startPt, endPt)) {
          const to = shiftKey ? snapAngle(gesture.startGeo, endGeo, 45) : endGeo
          controller.add({ type: 'arrow', kind: (gesture.variant as ArrowKind) ?? 'linear', from: gesture.startGeo, to })
        }
      } else if (gesture.tool === 'shape') {
        const placement = resolveShapePlacement(map, gesture.startPt, endPt, {
          shiftKey,
        })
        controller.add({
          type: 'shape',
          kind: (gesture.variant as ShapeKind) ?? 'square',
          at: placement.at,
          width: placement.width,
          height: placement.height,
        })
      } else if (gesture.tool === 'ruler') {
        if (!isClickGesture(gesture.startPt, endPt)) {
          controller.add({ type: 'ruler', from: gesture.startGeo, to: endGeo })
        }
      } else if (
        gesture.tool === 'freedraw' &&
        gesture.freedrawPoints &&
        gesture.freedrawPoints.length > 1
      ) {
        controller.add({ type: 'freedraw', points: gesture.freedrawPoints })
      }
      controller.setTool('select')
    }
    setGesture(null)
  }, [controller, getCanvasPoint, isShiftPressedRef, map, setGesture])

  const cancelGesture = useCallback(() => {
    lastPenClickRef.current = null
    penFinishedAtRef.current = 0
    setGesture(null)
  }, [setGesture])

  return {
    handlePointerDown,
    handleMouseMove,
    handleMouseUp,
    cancelGesture,
    finishPen,
  }
}
