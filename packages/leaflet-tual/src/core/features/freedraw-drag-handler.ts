import type L from 'leaflet'
import type { FreeDrawItem, GeoPoint, ScreenPoint } from '../types/index.js'
import { createId, screenToGeo } from '../shared/index.js'

export function startFreeDrawDrag(
  map: L.Map,
  mapContainer: HTMLElement,
  pt: ScreenPoint,
  geo: GeoPoint,
  activeColor: string,
  strokeWidth: number,
  dashed: boolean,
  draftFreeDrawRef: { current: { screenPoints: ScreenPoint[]; geoPoints: GeoPoint[] } | null },
  rafIdRef: { current: number | null },
  paintCanvas: () => void,
  addItem: (item: FreeDrawItem) => void,
  setActiveTool: (tool: 'select') => void,
) {
  draftFreeDrawRef.current = { screenPoints: [pt], geoPoints: [geo] }
  map.dragging.disable()
  paintCanvas()

  const handleWindowMove = (moveEvent: PointerEvent) => {
    if (!draftFreeDrawRef.current) return
    const rect = mapContainer.getBoundingClientRect()
    const currScreen = { x: moveEvent.clientX - rect.left, y: moveEvent.clientY - rect.top }
    const pts = draftFreeDrawRef.current.screenPoints
    const prevPt = pts[pts.length - 1]
    if (Math.hypot(currScreen.x - prevPt.x, currScreen.y - prevPt.y) < 2.5) return
    pts.push(currScreen)
    draftFreeDrawRef.current.geoPoints.push(screenToGeo(map, currScreen))

    if (rafIdRef.current === null) {
      rafIdRef.current = window.requestAnimationFrame(() => {
        rafIdRef.current = null
        paintCanvas()
      })
    }
  }

  const handleWindowUp = (upEvent: PointerEvent) => {
    window.removeEventListener('pointermove', handleWindowMove)
    window.removeEventListener('pointerup', handleWindowUp)
    map.dragging.enable()
    if (rafIdRef.current !== null) {
      window.cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }

    const draft = draftFreeDrawRef.current
    draftFreeDrawRef.current = null
    if (draft && draft.geoPoints.length >= 1) {
      addItem({
        id: createId('freedraw'),
        type: 'freedraw',
        points: draft.geoPoints,
        color: activeColor,
        strokeWidth,
        dashed,
        createdAt: Date.now(),
      })
      if (!upEvent.shiftKey) setActiveTool('select')
    } else {
      paintCanvas()
    }
  }

  window.addEventListener('pointermove', handleWindowMove)
  window.addEventListener('pointerup', handleWindowUp)
}

