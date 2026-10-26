import type L from 'leaflet'
import type { Item, ScreenPoint, GeoPoint } from '../../../../core/index.js'
import type { CanvasGesture } from './gesture-types.js'
import { hitTestPenHandle } from './use-pen-handles.js'
import {
  hitTestArrowHandle,
  hitTestRulerHandle,
  hitTestShapeHandle,
} from './use-shape-handles.js'

export function findResizeGestureUnderPointer(
  map: L.Map,
  selectedItems: Item[],
  pt: ScreenPoint,
  geo: GeoPoint,
): CanvasGesture | null {
  for (const item of selectedItems) {
    if (item.type === 'shape') {
      const hitHandle = hitTestShapeHandle(map, item, pt, 8)
      if (hitHandle) {
        const legacy = item as unknown as { from?: GeoPoint; to?: GeoPoint }
        return {
          type: 'resize-shape',
          shapeId: item.id,
          handle: hitHandle.type,
          initialAt: item.at,
          initialWidth: item.width,
          initialHeight: item.height,
          initialFrom: legacy.from,
          initialTo: legacy.to,
          startPt: pt,
          startGeo: geo,
        }
      }
    } else if (item.type === 'arrow') {
      const hitHandle = hitTestArrowHandle(map, item, pt, 8)
      if (hitHandle) {
        return { type: 'resize-arrow', arrowId: item.id, handle: hitHandle, startGeo: geo }
      }
    } else if (item.type === 'ruler') {
      const hitHandle = hitTestRulerHandle(map, item, pt, 8)
      if (hitHandle) {
        return { type: 'resize-ruler', rulerId: item.id, handle: hitHandle, startGeo: geo }
      }
    } else if (item.type === 'pen') {
      const hitHandle = hitTestPenHandle(map, item, pt, 8)
      if (hitHandle) {
        return {
          type: 'edit-pen',
          penId: item.id,
          pointIndex: hitHandle.pointIndex,
          handle: hitHandle.type,
          startGeo: geo,
          initialPoints: item.points,
        }
      }
    }
  }
  return null
}
