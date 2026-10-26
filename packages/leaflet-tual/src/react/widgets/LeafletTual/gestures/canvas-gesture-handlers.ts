import { useEffect } from 'react'
import type { RefObject } from 'react'
import type L from 'leaflet'
import type { Controller, GeoPoint, Item, ScreenPoint } from '../../../../core/index.js'
import {
  commitDrawnItem,
  editPenPointList,
  resizeShape,
  resizeShapeInWorld,
  translateItem,
  worldDelta,
} from '../../../../core/index.js'
import type { CanvasGesture, PendingClickSelection } from './gesture-types.js'
import { updatePenDraftOnMove } from './use-pen-draft.js'

export function commitPendingClickSelection(
  controller: Controller,
  pending: PendingClickSelection,
): void {
  if (pending.itemId !== null) {
    const isSel = controller.selection.includes(pending.itemId)
    if (pending.shiftKey) {
      controller.select(
        isSel
          ? controller.selection.filter((id) => id !== pending.itemId)
          : [...controller.selection, pending.itemId],
      )
    } else {
      controller.select([pending.itemId])
    }
  } else {
    controller.select(null)
    controller.edit(null)
  }
}

export function applyGestureMouseMove(
  controller: Controller,
  map: L.Map,
  gesture: CanvasGesture,
  pt: ScreenPoint,
  geo: GeoPoint,
  shiftKey: boolean,
  setGesture: (g: CanvasGesture | null) => void,
): void {
  if (gesture.type === 'pen-draft') {
    setGesture(updatePenDraftOnMove(gesture, pt, geo))
  } else if (gesture.type === 'draw') {
    const freedrawPoints =
      gesture.tool === 'freedraw' && gesture.freedrawPoints
        ? [...gesture.freedrawPoints, geo]
        : undefined
    setGesture({ ...gesture, currentPt: pt, currentGeo: geo, freedrawPoints })
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
          shiftKey,
        )
        controller.update(gesture.shapeId, next as Partial<Item>, false)
      } else if (gesture.initialAt) {
        const next = resizeShape(
          map,
          item,
          gesture.initialAt,
          gesture.initialWidth ?? 96,
          gesture.initialHeight ?? 96,
          pt,
          gesture.handle,
          shiftKey,
        )
        controller.update(gesture.shapeId, next, false)
      }
    }
  } else if (gesture.type === 'resize-arrow') {
    controller.update(
      gesture.arrowId,
      gesture.handle === 'start' ? { from: geo } : gesture.handle === 'end' ? { to: geo } : { via: geo },
      false,
    )
  } else if (gesture.type === 'resize-ruler') {
    controller.update(gesture.rulerId, gesture.handle === 'start' ? { from: geo } : { to: geo }, false)
  } else if (gesture.type === 'drag-item') {
    const delta = worldDelta(gesture.startGeo, geo)
    for (const item of gesture.initialItems) {
      controller.update(item.id, translateItem(item, delta), false)
    }
  }
}

export function commitGestureMouseUp(
  controller: Controller,
  map: L.Map,
  gesture: CanvasGesture,
  endPt: ScreenPoint,
  endGeo: GeoPoint,
  shiftKey: boolean,
): void {
  if (gesture.type === 'edit-pen') {
    controller.update(gesture.penId, {}, true)
    map.dragging?.enable()
  } else if (gesture.type === 'resize-shape') {
    const item = controller.items.find((i) => i.id === gesture.shapeId)
    if (item && item.type === 'shape') {
      const legacy = item as unknown as { from?: GeoPoint; to?: GeoPoint }
      if (legacy.from && legacy.to) {
        controller.update(item.id, { from: legacy.from, to: legacy.to } as Partial<Item>, true)
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
      if (controller.items.some((i) => i.id === id)) controller.update(id, {}, true)
    }
    map.dragging?.enable()
  } else if (gesture.type === 'draw') {
    commitDrawnItem(
      controller,
      map,
      gesture.tool,
      gesture.variant,
      gesture.startPt,
      gesture.startGeo,
      endPt,
      endGeo,
      shiftKey,
      gesture.freedrawPoints,
    )
    controller.setTool('select')
  }
}

export function useCanvasNativeListeners(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  handleDoubleClick: (e: MouseEvent) => void,
  lastUiMouseDownRef: React.MutableRefObject<number>,
): void {
  useEffect(() => {
    const canvas = canvasRef.current
    const container = canvas?.parentElement
    if (!canvas) return
    const handleContainerDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      if (
        (e.target as Element | null)?.closest?.(
          '.tual-secondary-tooltip, .tual-toolbar, .tual-popover',
        )
      ) {
        lastUiMouseDownRef.current = Date.now()
      }
    }
    canvas.addEventListener('dblclick', handleDoubleClick)
    container?.addEventListener('mousedown', handleContainerDown, true)
    return () => {
      canvas.removeEventListener('dblclick', handleDoubleClick)
      container?.removeEventListener('mousedown', handleContainerDown, true)
    }
  }, [canvasRef, handleDoubleClick, lastUiMouseDownRef])
}
