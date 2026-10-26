import type L from 'leaflet'
import type { Controller, ScreenPoint } from '../../../../core/index.js'
import { hitTest } from '../../../../core/index.js'
import { hitTestPenHandle } from './use-pen-handles.js'
import {
  hitTestArrowHandle,
  hitTestRulerHandle,
  hitTestShapeHandle,
} from './use-shape-handles.js'

export function updateCanvasHoverCursor(
  canvas: HTMLCanvasElement,
  map: L.Map,
  controller: Controller,
  pt: ScreenPoint,
): void {
  const selected = controller.selected
  if (selected.length === 1 && selected[0].type === 'shape') {
    const hitHandle = hitTestShapeHandle(map, selected[0], pt, 8)
    if (hitHandle) {
      canvas.style.cursor = hitHandle.cursor
      return
    }
  } else if (selected.length === 1 && selected[0].type === 'arrow') {
    const hitHandle = hitTestArrowHandle(map, selected[0], pt, 8)
    if (hitHandle) {
      canvas.style.cursor = 'crosshair'
      return
    }
  } else if (selected.length === 1 && selected[0].type === 'ruler') {
    const hitHandle = hitTestRulerHandle(map, selected[0], pt, 8)
    if (hitHandle) {
      canvas.style.cursor = 'crosshair'
      return
    }
  } else if (selected.length === 1 && selected[0].type === 'pen') {
    const hitHandle = hitTestPenHandle(map, selected[0], pt)
    if (hitHandle) {
      canvas.style.cursor = hitHandle.cursor
      return
    }
  }

  const hitSelected = controller.selected.some((i) => hitTest(i, pt, 12, map))
  if (hitSelected) {
    canvas.style.cursor = 'move'
    return
  }

  const hit = controller.items.some((i) => hitTest(i, pt, 12, map))
  canvas.style.cursor = hit ? 'pointer' : 'default'
}
