import type L from 'leaflet'
import type { ArrowItem, FreeDrawItem, RulerItem, ScreenPoint, ShapeItem } from '../types/index.js'
import {
  constrainAngleTo45Degrees,
  constrainToAspectRatio,
  screenToGeo,
} from '../shared/geo.js'
import type {
  ArrowHandleType,
  ProjectedArrow,
  ProjectedRuler,
  ProjectedShape,
  RulerHandleType,
  ShapeHandleType,
} from '../entities/index.js'

function bindWindowDrag(map: L.Map, onMove: (e: PointerEvent) => void) {
  map.dragging.disable()
  const onUp = () => {
    map.dragging.enable()
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
  }
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
}

export function startArrowHandleDrag(
  map: L.Map,
  arrow: ArrowItem,
  projected: ProjectedArrow,
  handle: ArrowHandleType,
  getLocalPoint: (e: PointerEvent) => ScreenPoint,
  updateItem: (id: string, patch: Partial<ArrowItem>) => void,
) {
  bindWindowDrag(map, (moveEvent) => {
    const rawPt = getLocalPoint(moveEvent)
    const shouldLock = moveEvent.shiftKey
    if (handle === 'start') {
      const snappedPt = shouldLock ? constrainAngleTo45Degrees(projected.end, rawPt) : rawPt
      updateItem(arrow.id, { start: screenToGeo(map, snappedPt) })
    } else if (handle === 'end') {
      const snappedPt = shouldLock ? constrainAngleTo45Degrees(projected.start, rawPt) : rawPt
      updateItem(arrow.id, { end: screenToGeo(map, snappedPt) })
    } else if (handle === 'control') {
      updateItem(arrow.id, { controlPoint: screenToGeo(map, rawPt) })
    }
  })
}

export function startShapeHandleDrag(
  map: L.Map,
  shape: ShapeItem,
  projected: ProjectedShape,
  handle: ShapeHandleType,
  getLocalPoint: (e: PointerEvent) => ScreenPoint,
  updateItem: (id: string, patch: Partial<ShapeItem>) => void,
) {
  const anchorScreen = handle === 'start' ? projected.end : projected.start
  const initialRatio = projected.width > 4 && projected.height > 4 ? projected.width / projected.height : 1

  bindWindowDrag(map, (moveEvent) => {
    const rawPt = getLocalPoint(moveEvent)
    const nextPt = moveEvent.shiftKey ? constrainToAspectRatio(anchorScreen, rawPt, initialRatio) : rawPt
    const nextGeo = screenToGeo(map, nextPt)
    updateItem(shape.id, handle === 'start' ? { start: nextGeo } : { end: nextGeo })
  })
}

export function startArrowBodyDrag(
  map: L.Map,
  arrow: ArrowItem,
  projected: ProjectedArrow,
  originPt: ScreenPoint,
  getLocalPoint: (e: PointerEvent) => ScreenPoint,
  updateItem: (id: string, patch: Partial<ArrowItem>) => void,
) {
  const initialStartScreen = projected.start
  const initialEndScreen = projected.end
  const initialControlScreen = projected.control
  const hadCustomControl = Boolean(arrow.controlPoint)

  bindWindowDrag(map, (moveEvent) => {
    const nextPt = getLocalPoint(moveEvent)
    const dx = nextPt.x - originPt.x
    const dy = nextPt.y - originPt.y
    const patch: Partial<ArrowItem> = {
      start: screenToGeo(map, { x: initialStartScreen.x + dx, y: initialStartScreen.y + dy }),
      end: screenToGeo(map, { x: initialEndScreen.x + dx, y: initialEndScreen.y + dy }),
    }
    if ((arrow.arrowStyle === 'curved' || arrow.arrowStyle === 'elbow') && hadCustomControl) {
      patch.controlPoint = screenToGeo(map, {
        x: initialControlScreen.x + dx,
        y: initialControlScreen.y + dy,
      })
    }
    updateItem(arrow.id, patch)
  })
}

export function startShapeBodyDrag(
  map: L.Map,
  shape: ShapeItem,
  projected: ProjectedShape,
  originPt: ScreenPoint,
  getLocalPoint: (e: PointerEvent) => ScreenPoint,
  updateItem: (id: string, patch: Partial<ShapeItem>) => void,
) {
  const initialStartScreen = projected.start
  const initialEndScreen = projected.end

  bindWindowDrag(map, (moveEvent) => {
    const nextPt = getLocalPoint(moveEvent)
    const dx = nextPt.x - originPt.x
    const dy = nextPt.y - originPt.y
    updateItem(shape.id, {
      start: screenToGeo(map, { x: initialStartScreen.x + dx, y: initialStartScreen.y + dy }),
      end: screenToGeo(map, { x: initialEndScreen.x + dx, y: initialEndScreen.y + dy }),
    })
  })
}

export function startFreeDrawBodyDrag(
  map: L.Map,
  fd: FreeDrawItem,
  initialScreenPts: ScreenPoint[],
  originPt: ScreenPoint,
  getLocalPoint: (e: PointerEvent) => ScreenPoint,
  updateItem: (id: string, patch: Partial<FreeDrawItem>) => void,
) {
  bindWindowDrag(map, (moveEvent) => {
    const nextPt = getLocalPoint(moveEvent)
    const dx = nextPt.x - originPt.x
    const dy = nextPt.y - originPt.y
    updateItem(fd.id, {
      points: initialScreenPts.map((sp) => screenToGeo(map, { x: sp.x + dx, y: sp.y + dy })),
    })
  })
}

export function startRulerHandleDrag(
  map: L.Map,
  ruler: RulerItem,
  projected: ProjectedRuler,
  handle: RulerHandleType,
  getLocalPoint: (e: PointerEvent) => ScreenPoint,
  updateItem: (id: string, patch: Partial<RulerItem>) => void,
) {
  bindWindowDrag(map, (moveEvent) => {
    const rawPt = getLocalPoint(moveEvent)
    const shouldLock = moveEvent.shiftKey
    if (handle === 'start') {
      const snappedPt = shouldLock ? constrainAngleTo45Degrees(projected.end, rawPt) : rawPt
      updateItem(ruler.id, { start: screenToGeo(map, snappedPt) })
    } else if (handle === 'end') {
      const snappedPt = shouldLock ? constrainAngleTo45Degrees(projected.start, rawPt) : rawPt
      updateItem(ruler.id, { end: screenToGeo(map, snappedPt) })
    }
  })
}

export function startRulerBodyDrag(
  map: L.Map,
  ruler: RulerItem,
  projected: ProjectedRuler,
  originPt: ScreenPoint,
  getLocalPoint: (e: PointerEvent) => ScreenPoint,
  updateItem: (id: string, patch: Partial<RulerItem>) => void,
) {
  const initialStartScreen = projected.start
  const initialEndScreen = projected.end

  bindWindowDrag(map, (moveEvent) => {
    const nextPt = getLocalPoint(moveEvent)
    const dx = nextPt.x - originPt.x
    const dy = nextPt.y - originPt.y
    updateItem(ruler.id, {
      start: screenToGeo(map, { x: initialStartScreen.x + dx, y: initialStartScreen.y + dy }),
      end: screenToGeo(map, { x: initialEndScreen.x + dx, y: initialEndScreen.y + dy }),
    })
  })
}

