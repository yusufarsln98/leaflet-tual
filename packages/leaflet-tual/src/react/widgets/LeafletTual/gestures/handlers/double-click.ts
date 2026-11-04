import type { RefObject } from 'react'
import type L from 'leaflet'
import type { Controller, ScreenPoint } from '../../../../../core/index.js'
import { hitTest } from '../../../../../core/index.js'

export interface DoubleClickContext {
  map: L.Map
  controller: Controller
  lastUiMouseDownRef: RefObject<number>
  penFinishedAtRef: RefObject<number>
  areaFinishedAtRef: RefObject<number>
  getCanvasPoint: (e: MouseEvent) => ScreenPoint
  finishPen: (closed?: boolean) => void
  finishArea: () => void
}

const UI_DOUBLE_CLICK_GUARD_MS = 500

export function processDoubleClick(e: MouseEvent, ctx: DoubleClickContext): void {
  const {
    map,
    controller,
    lastUiMouseDownRef,
    penFinishedAtRef,
    areaFinishedAtRef,
    getCanvasPoint,
    finishPen,
    finishArea,
  } = ctx

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

  if (!controller.readOnly && controller.tool === 'area') {
    e.preventDefault()
    e.stopPropagation()
    finishArea()
    return
  }

  if (Date.now() - penFinishedAtRef.current < UI_DOUBLE_CLICK_GUARD_MS) {
    e.preventDefault()
    e.stopPropagation()
    return
  }

  if (Date.now() - areaFinishedAtRef.current < UI_DOUBLE_CLICK_GUARD_MS) {
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
}

