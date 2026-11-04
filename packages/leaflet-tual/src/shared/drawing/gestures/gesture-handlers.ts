import type L from 'leaflet'
import type { Controller } from '../../../core/types.js'
import type { GeoPoint, ScreenPoint } from '../../types/index.js'
import {
  commitDrawnItem,
  editPenPointList,
  findItemsInMarquee,
  resizeShape,
  translateItem,
  worldDelta,
} from '../../../core/index.js'
import type { CanvasGesture, PendingClickSelection } from '../../types/gesture.js'
import { updatePenDraftOnMove } from '../../../features/drawing-tools/pen/pen-geometry.js'

export function commitPendingClickSelection(
  controller: Controller,
  pending: PendingClickSelection,
  map?: L.Map,
): void {
  if (pending.shiftKey) {
    map?.dragging?.enable()
  }
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
      const next = resizeShape(
        map,
        item,
        gesture.initialAt,
        gesture.initialWidth,
        gesture.initialHeight,
        pt,
        gesture.handle,
        shiftKey,
      )
      controller.update(gesture.shapeId, next, false)
    }
  } else if (gesture.type === 'resize-arrow') {
    controller.update(
      gesture.arrowId,
      gesture.handle === 'start'
        ? { from: geo }
        : gesture.handle === 'end'
          ? { to: geo }
          : { via: geo },
      false,
    )
  } else if (gesture.type === 'resize-ruler') {
    controller.update(
      gesture.rulerId,
      gesture.handle === 'start' ? { from: geo } : { to: geo },
      false,
    )
  } else if (gesture.type === 'resize-area') {
    const item = controller.items.find((i) => i.id === gesture.areaId)
    if (item && item.type === 'area') {
      const nextPoints = item.points.map((p, idx) => (idx === gesture.vertexIndex ? geo : p))
      controller.update(gesture.areaId, { points: nextPoints }, false)
    }
  } else if (gesture.type === 'area-draft') {
    setGesture({ ...gesture, currentPt: pt, currentGeo: geo })
  } else if (gesture.type === 'drag-item') {
    const delta = worldDelta(gesture.startGeo, geo)
    controller.updateMany(
      gesture.initialItems.map((item) => ({ id: item.id, patch: translateItem(item, delta) })),
      false,
    )
  } else if (gesture.type === 'marquee') {
    setGesture({ ...gesture, currentPt: pt, currentGeo: geo })
    const matched = findItemsInMarquee(map, controller.items, gesture.startPt, pt)
    controller.select(matched)
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
      controller.update(item.id, { at: item.at, width: item.width, height: item.height }, true)
    }
    map.dragging?.enable()
  } else if (gesture.type === 'resize-arrow') {
    controller.update(gesture.arrowId, {}, true)
    map.dragging?.enable()
  } else if (gesture.type === 'resize-ruler') {
    controller.update(gesture.rulerId, {}, true)
    map.dragging?.enable()
  } else if (gesture.type === 'resize-area') {
    controller.update(gesture.areaId, {}, true)
    map.dragging?.enable()
  } else if (gesture.type === 'drag-item') {
    controller.updateMany(
      gesture.itemIds.map((id) => ({ id, patch: {} })),
      true,
    )
    map.dragging?.enable()
  } else if (gesture.type === 'marquee') {
    const matched = findItemsInMarquee(map, controller.items, gesture.startPt, endPt)
    controller.select(matched)
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
