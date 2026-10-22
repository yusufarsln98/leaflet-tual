import type L from 'leaflet'
import type {
  ArrowItem,
  ArrowRenderTheme,
  CanvasAnnotationTheme,
  CanvasLabels,
  DraftArrowState,
  DraftRulerState,
  DraftShapeState,
  FreeDrawItem,
  GeoPoint,
  RulerItem,
  ScreenPoint,
  ShapeItem,
  UseLeafletCanvasOptions,
} from '../types/index.js'
import {
  constrainAngleTo45Degrees,
  geoToScreen,
  screenToGeo,
  TOOL_TO_ARROW_STYLE,
} from '../shared/index.js'
import {
  hitTestArrow,
  hitTestArrowHandle,
  hitTestFreeDraw,
  hitTestRuler,
  hitTestRulerHandle,
  hitTestShape,
  hitTestShapeHandle,
  projectArrow,
  projectFreeDraw,
  projectRuler,
  projectShape,
} from '../entities/index.js'
import {
  buildArrowItem,
  createDraftNote,
  createDraftText,
  startArrowDrag,
  startFreeDrawDrag,
  startRulerDrag,
  startShapeDrag,
} from './drawing-drag-handlers.js'
import {
  startArrowBodyDrag,
  startArrowHandleDrag,
  startFreeDrawBodyDrag,
  startRulerBodyDrag,
  startRulerHandleDrag,
  startShapeBodyDrag,
  startShapeHandleDrag,
} from './select-drag-handlers.js'
import { paintLeafletCanvas } from './canvas-painter.js'
import { bindBlockMapDblClick, bindLeafletSync } from './map-sync.js'
import {
  createLeafletCanvasController,
  type LeafletCanvasStore,
} from './canvas-controller.js'

export interface CreateLeafletCanvasOptions extends UseLeafletCanvasOptions {
  controller?: LeafletCanvasStore
  annotationTheme?: CanvasAnnotationTheme
  arrowTheme?: ArrowRenderTheme
  labels?: CanvasLabels
}

export interface LeafletCanvasInstance {
  controller: LeafletCanvasStore
  container: HTMLDivElement
  canvas: HTMLCanvasElement
  repaint: () => void
  destroy: () => void
}

export function createLeafletCanvas(
  map: L.Map,
  options: CreateLeafletCanvasOptions = {},
): LeafletCanvasInstance {
  const {
    controller: externalController,
    annotationTheme,
    arrowTheme,
    labels,
    zIndex = 650,
    ...controllerOptions
  } = options

  const controller = externalController ?? createLeafletCanvasController(controllerOptions)
  const mapContainer = map.getContainer()

  const container = document.createElement('div')
  container.setAttribute('data-rlc-overlay', 'true')
  container.style.position = 'absolute'
  container.style.inset = '0'
  container.style.pointerEvents = 'none'
  container.style.zIndex = String(zIndex)
  container.style.overflow = 'hidden'

  const canvas = document.createElement('canvas')
  canvas.style.position = 'absolute'
  canvas.style.top = '0'
  canvas.style.left = '0'
  canvas.style.pointerEvents = 'none'

  const drawingSurface = document.createElement('div')
  drawingSurface.style.position = 'absolute'
  drawingSurface.style.inset = '0'
  drawingSurface.style.pointerEvents = 'none'

  container.appendChild(canvas)
  container.appendChild(drawingSurface)
  mapContainer.appendChild(container)

  let viewport = { width: 0, height: 0 }
  let draftArrow: DraftArrowState | null = null
  let draftShape: DraftShapeState | null = null
  let draftRuler: DraftRulerState | null = null
  const draftFreeDrawRef: {
    current: { screenPoints: ScreenPoint[]; geoPoints: GeoPoint[] } | null
  } = { current: null }
  const rafIdRef: { current: number | null } = { current: null }

  const setDraftArrow = (next: DraftArrowState | null) => {
    draftArrow = next
    repaint()
  }

  const setDraftShape = (next: DraftShapeState | null) => {
    draftShape = next
    repaint()
  }

  const setDraftRuler = (next: DraftRulerState | null) => {
    draftRuler = next
    repaint()
  }

  const clearDraftFreeDraw = () => {
    draftFreeDrawRef.current = null
    if (rafIdRef.current !== null && typeof window !== 'undefined') {
      window.cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }
  }

  const updateSurfaceInteractivity = () => {
    const isDrawing = !controller.readOnly && controller.activeTool !== 'select'
    drawingSurface.style.pointerEvents = isDrawing ? 'auto' : 'none'
    drawingSurface.style.cursor = isDrawing ? 'crosshair' : 'default'
    canvas.style.width = `${viewport.width}px`
    canvas.style.height = `${viewport.height}px`
  }

  const repaint = () => {
    updateSurfaceInteractivity()
    const items = controller.items
    paintLeafletCanvas({
      map,
      canvas,
      width: viewport.width,
      height: viewport.height,
      arrowItems: items.filter((it): it is ArrowItem => it.type === 'arrow'),
      shapeItems: items.filter((it): it is ShapeItem => it.type === 'shape'),
      freeDrawItems: items.filter((it): it is FreeDrawItem => it.type === 'freedraw'),
      rulerItems: items.filter((it): it is RulerItem => it.type === 'ruler'),
      selectedId: controller.selectedId,
      draftShape,
      draftArrow,
      draftRuler,
      draftFreeDraw: draftFreeDrawRef.current,
      activeColor: controller.activeColor,
      strokeWidth: controller.strokeWidth,
      dashed: controller.dashed,
      shapeFilled: controller.shapeFilled,
      annotationTheme,
      arrowTheme,
      isReadOnly: controller.readOnly,
    })
  }

  const getLocalPoint = (e: PointerEvent | MouseEvent): ScreenPoint => {
    const rect = mapContainer.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const handleSurfacePointerDown = (e: PointerEvent) => {
    if (e.button !== 0 || controller.readOnly) return
    e.stopPropagation()
    e.preventDefault()

    const pt = getLocalPoint(e)
    const geo = screenToGeo(map, pt)
    const { activeTool, activeShape, shapeFilled, activeColor, strokeWidth, dashed, noteColor, fontSize, fontWeight } =
      controller

    if (activeTool === 'freedraw') {
      startFreeDrawDrag(
        map,
        mapContainer,
        pt,
        geo,
        activeColor,
        strokeWidth,
        dashed,
        draftFreeDrawRef,
        rafIdRef,
        repaint,
        controller.addItem,
        controller.setActiveTool,
      )
      return
    }

    if (activeTool === 'shape') {
      startShapeDrag(
        map,
        mapContainer,
        pt,
        geo,
        activeShape,
        activeColor,
        shapeFilled,
        strokeWidth,
        dashed,
        setDraftShape,
        controller.addItem,
        controller.setActiveTool,
      )
      return
    }

    if (activeTool === 'note') {
      controller.addItem(createDraftNote(geo, noteColor, labels?.noteDefaultTitle ?? 'Field Note'))
      controller.setActiveTool('select')
      return
    }

    if (activeTool === 'text') {
      controller.addItem(
        createDraftText(geo, activeColor, fontSize, fontWeight, map.getZoom?.() ?? 14),
      )
      controller.setActiveTool('select')
      return
    }

    if (activeTool === 'ruler') {
      startRulerDrag(
        map,
        mapContainer,
        pt,
        geo,
        activeColor,
        strokeWidth,
        dashed,
        setDraftRuler,
        controller.addItem,
        controller.setActiveTool,
      )
      return
    }

    const arrowStyle = TOOL_TO_ARROW_STYLE[activeTool]
    if (!arrowStyle) return

    if (!draftArrow) {
      startArrowDrag(
        map,
        mapContainer,
        pt,
        geo,
        arrowStyle,
        activeColor,
        strokeWidth,
        dashed,
        setDraftArrow,
        controller.addItem,
        controller.setActiveTool,
      )
    } else {
      const startScreen = geoToScreen(map, draftArrow.startGeo)
      const endScreen = e.shiftKey ? constrainAngleTo45Degrees(startScreen, pt) : pt
      if (Math.hypot(endScreen.x - startScreen.x, endScreen.y - startScreen.y) >= 4) {
        controller.addItem(
          buildArrowItem(
            draftArrow.arrowStyle,
            draftArrow.startGeo,
            screenToGeo(map, endScreen),
            activeColor,
            strokeWidth,
            dashed,
          ),
        )
      }
      setDraftArrow(null)
      controller.setActiveTool('select')
    }
  }

  const handleSurfacePointerMove = (e: PointerEvent) => {
    if (!draftArrow) return
    const rawPt = getLocalPoint(e)
    const startScreen = geoToScreen(map, draftArrow.startGeo)
    const nextPt = e.shiftKey ? constrainAngleTo45Degrees(startScreen, rawPt) : rawPt
    setDraftArrow({ ...draftArrow, currentGeo: screenToGeo(map, nextPt) })
  }

  const handleContainerPointerDown = (e: PointerEvent) => {
    if (e.button !== 0 || controller.readOnly || controller.activeTool !== 'select') return
    const target = e.target as HTMLElement | null
    if (target?.closest('[data-rlc-toolbar], [data-rlc-note], [data-rlc-text], .leaflet-control')) {
      return
    }

    const pt = getLocalPoint(e)
    const items = controller.items
    const arrowItems = items.filter((it): it is ArrowItem => it.type === 'arrow')
    const shapeItems = items.filter((it): it is ShapeItem => it.type === 'shape')
    const freeDrawItems = items.filter((it): it is FreeDrawItem => it.type === 'freedraw')
    const rulerItems = items.filter((it): it is RulerItem => it.type === 'ruler')
    const selectedId = controller.selectedId

    const selectedArrow = arrowItems.find((a) => a.id === selectedId)
    if (selectedArrow) {
      const projected = projectArrow(map, selectedArrow)
      const handle = hitTestArrowHandle(pt, projected, selectedArrow)
      if (handle) {
        e.stopPropagation()
        e.preventDefault()
        startArrowHandleDrag(map, selectedArrow, projected, handle, getLocalPoint, controller.updateItem)
        return
      }
    }

    const selectedShape = shapeItems.find((s) => s.id === selectedId)
    if (selectedShape) {
      const projected = projectShape(map, selectedShape)
      const handle = hitTestShapeHandle(pt, projected)
      if (handle) {
        e.stopPropagation()
        e.preventDefault()
        startShapeHandleDrag(map, selectedShape, projected, handle, getLocalPoint, controller.updateItem)
        return
      }
    }

    const selectedRuler = rulerItems.find((r) => r.id === selectedId)
    if (selectedRuler) {
      const projected = projectRuler(map, selectedRuler)
      const handle = hitTestRulerHandle(pt, projected)
      if (handle) {
        e.stopPropagation()
        e.preventDefault()
        startRulerHandleDrag(map, selectedRuler, projected, handle, getLocalPoint, controller.updateItem)
        return
      }
    }

    for (let i = arrowItems.length - 1; i >= 0; i -= 1) {
      const arrow = arrowItems[i]
      const projected = projectArrow(map, arrow)
      if (hitTestArrow(pt, projected, arrow)) {
        e.stopPropagation()
        e.preventDefault()
        controller.setSelectedId(arrow.id)
        startArrowBodyDrag(map, arrow, projected, pt, getLocalPoint, controller.updateItem)
        return
      }
    }

    for (let i = shapeItems.length - 1; i >= 0; i -= 1) {
      const shp = shapeItems[i]
      const projected = projectShape(map, shp)
      if (hitTestShape(pt, projected)) {
        e.stopPropagation()
        e.preventDefault()
        controller.setSelectedId(shp.id)
        startShapeBodyDrag(map, shp, projected, pt, getLocalPoint, controller.updateItem)
        return
      }
    }

    for (let i = freeDrawItems.length - 1; i >= 0; i -= 1) {
      const fd = freeDrawItems[i]
      const initialScreenPts = projectFreeDraw(map, fd)
      if (hitTestFreeDraw(pt, initialScreenPts, fd)) {
        e.stopPropagation()
        e.preventDefault()
        controller.setSelectedId(fd.id)
        startFreeDrawBodyDrag(map, fd, initialScreenPts, pt, getLocalPoint, controller.updateItem)
        return
      }
    }

    for (let i = rulerItems.length - 1; i >= 0; i -= 1) {
      const ruler = rulerItems[i]
      const projected = projectRuler(map, ruler)
      if (hitTestRuler(pt, projected, ruler)) {
        e.stopPropagation()
        e.preventDefault()
        controller.setSelectedId(ruler.id)
        startRulerBodyDrag(map, ruler, projected, pt, getLocalPoint, controller.updateItem)
        return
      }
    }

    if (selectedId) {
      controller.setSelectedId(null)
      controller.notifyChangeComplete()
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (controller.readOnly) return
    const target = e.target as HTMLElement | null
    if (
      target &&
      (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
    ) {
      return
    }
    if (e.key === 'Escape') {
      draftArrow = null
      draftShape = null
      draftRuler = null
      clearDraftFreeDraw()
      controller.setSelectedId(null)
      controller.setActiveTool('select')
      controller.notifyChangeComplete()
      repaint()
    } else if ((e.key === 'Delete' || e.key === 'Backspace') && controller.selectedId) {
      e.preventDefault()
      controller.deleteSelected()
    }
  }

  drawingSurface.addEventListener('pointerdown', handleSurfacePointerDown)
  drawingSurface.addEventListener('pointermove', handleSurfacePointerMove)
  mapContainer.addEventListener('pointerdown', handleContainerPointerDown, { capture: true })
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown)
  }

  const unbindSync = bindLeafletSync(map, (dims) => {
    viewport = dims
    repaint()
  })
  const unbindDblClick = bindBlockMapDblClick(map)
  const unsubscribeController = controller.subscribe(() => {
    repaint()
  })

  repaint()

  return {
    controller,
    container,
    canvas,
    repaint,
    destroy() {
      drawingSurface.removeEventListener('pointerdown', handleSurfacePointerDown)
      drawingSurface.removeEventListener('pointermove', handleSurfacePointerMove)
      mapContainer.removeEventListener('pointerdown', handleContainerPointerDown, { capture: true })
      if (typeof window !== 'undefined') {
        window.removeEventListener('keydown', handleKeyDown)
      }
      clearDraftFreeDraw()
      unbindSync()
      unbindDblClick()
      unsubscribeController()
      if (!externalController) {
        controller.destroy()
      }
      container.remove()
    },
  }
}

export const createLeafletTual = createLeafletCanvas


