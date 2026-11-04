import type L from 'leaflet'
import type { Controller } from '../../../core/types.js'
import type { ScreenPoint } from '../../types/index.js'
import {
  getItemBounds,
  hitTest,
  hitTestAreaHandle,
  hitTestArrowHandle,
  hitTestPenHandle,
  hitTestRulerHandle,
  hitTestShapeHandle,
} from '../../../core/index.js'

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
  } else if (selected.length === 1 && selected[0].type === 'area') {
    const hitVertex = hitTestAreaHandle(map, selected[0], pt, 8)
    if (hitVertex !== null) {
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

  const hitSelected = controller.selected.some((i) => {
    if (hitTest(i, pt, 0, map)) return true
    if (controller.selected.length === 1 && !i.locked) {
      const b = getItemBounds(map, i)
      return pt.x >= b.minX && pt.x <= b.maxX && pt.y >= b.minY && pt.y <= b.maxY
    }
    return false
  })
  if (hitSelected) {
    canvas.style.cursor = 'move'
    return
  }

  const hit = controller.items.some((i) => hitTest(i, pt, 0, map))
  canvas.style.cursor = hit ? 'pointer' : 'default'
}
