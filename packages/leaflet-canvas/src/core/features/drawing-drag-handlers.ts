import type L from 'leaflet'
import type {
  ArrowItem,
  ArrowStyle,
  DraftArrowState,
  DraftRulerState,
  DraftShapeState,
  GeoPoint,
  NoteItem,
  RulerItem,
  ScreenPoint,
  ShapeItem,
  ShapeKind,
  TextItem,
} from '../types/index.js'
import {
  computeDefaultControlGeoPoint,
  constrainAngleTo45Degrees,
  constrainToAspectRatio,
  createId,
  NOTE_COLOR_THEMES,
  screenToGeo,
} from '../shared/index.js'

export function createDraftNote(geo: GeoPoint, noteColor: string, defaultTitle = 'Field Note'): NoteItem {
  const theme = NOTE_COLOR_THEMES.find((t) => t.bg === noteColor) ?? NOTE_COLOR_THEMES[0]
  return {
    id: createId('note'),
    type: 'note',
    position: geo,
    title: defaultTitle,
    text: '',
    backgroundColor: theme.bg,
    textColor: theme.text,
    width: 230,
    createdAt: Date.now(),
  }
}

export function createDraftText(
  geo: GeoPoint,
  activeColor: string,
  fontSize: number,
  fontWeight: 'normal' | 'bold',
  currentZoom: number,
): TextItem {
  return {
    id: createId('text'),
    type: 'text',
    position: geo,
    text: '',
    color: activeColor,
    initialFontSize: fontSize,
    baseZoom: currentZoom,
    fontWeight,
    createdAt: Date.now(),
  }
}

export { startFreeDrawDrag } from './freedraw-drag-handler.js'

export function startShapeDrag(
  map: L.Map,
  mapContainer: HTMLElement,
  startScreen: ScreenPoint,
  startGeo: GeoPoint,
  activeShape: ShapeKind,
  activeColor: string,
  shapeFilled: boolean,
  strokeWidth: number,
  dashed: boolean,
  setDraftShape: (draft: DraftShapeState | null) => void,
  addItem: (item: ShapeItem) => void,
  setActiveTool: (tool: 'select') => void,
) {
  setDraftShape({ shape: activeShape, startGeo, currentGeo: startGeo })
  map.dragging.disable()

  const handleWindowMove = (moveEvent: PointerEvent) => {
    const rect = mapContainer.getBoundingClientRect()
    const rawScreen = { x: moveEvent.clientX - rect.left, y: moveEvent.clientY - rect.top }
    const currScreen = moveEvent.shiftKey ? constrainToAspectRatio(startScreen, rawScreen, 1) : rawScreen
    setDraftShape({ shape: activeShape, startGeo, currentGeo: screenToGeo(map, currScreen) })
  }

  const handleWindowUp = (upEvent: PointerEvent) => {
    window.removeEventListener('pointermove', handleWindowMove)
    window.removeEventListener('pointerup', handleWindowUp)
    map.dragging.enable()

    const rect = mapContainer.getBoundingClientRect()
    const rawEndScreen = { x: upEvent.clientX - rect.left, y: upEvent.clientY - rect.top }
    const endScreen = upEvent.shiftKey ? constrainToAspectRatio(startScreen, rawEndScreen, 1) : rawEndScreen
    const dragDist = Math.hypot(rawEndScreen.x - startScreen.x, rawEndScreen.y - startScreen.y)

    const finalStartGeo = dragDist >= 10 ? startGeo : screenToGeo(map, { x: startScreen.x - 45, y: startScreen.y - 45 })
    const finalEndGeo = dragDist >= 10 ? screenToGeo(map, endScreen) : screenToGeo(map, { x: startScreen.x + 45, y: startScreen.y + 45 })

    addItem({
      id: createId('shape'),
      type: 'shape',
      shape: activeShape,
      start: finalStartGeo,
      end: finalEndGeo,
      color: activeColor,
      filled: shapeFilled,
      strokeWidth,
      dashed,
      createdAt: Date.now(),
    })
    setDraftShape(null)
    setActiveTool('select')
  }

  window.addEventListener('pointermove', handleWindowMove)
  window.addEventListener('pointerup', handleWindowUp)
}

export function buildArrowItem(
  arrowStyle: ArrowStyle,
  startGeo: GeoPoint,
  endGeo: GeoPoint,
  activeColor: string,
  strokeWidth: number,
  dashed: boolean,
): ArrowItem {
  return {
    id: createId('arrow'),
    type: 'arrow',
    arrowStyle,
    start: startGeo,
    end: endGeo,
    controlPoint:
      arrowStyle === 'curved'
        ? computeDefaultControlGeoPoint(startGeo, endGeo)
        : arrowStyle === 'elbow'
          ? { lat: (startGeo.lat + endGeo.lat) / 2, lng: (startGeo.lng + endGeo.lng) / 2 }
          : undefined,
    color: activeColor,
    strokeWidth,
    dashed,
    headStyle: arrowStyle === 'bi' ? 'both' : 'triangle',
    createdAt: Date.now(),
  }
}

export function startArrowDrag(
  map: L.Map,
  mapContainer: HTMLElement,
  startScreen: ScreenPoint,
  startGeo: GeoPoint,
  arrowStyle: ArrowStyle,
  activeColor: string,
  strokeWidth: number,
  dashed: boolean,
  setDraftArrow: (draft: DraftArrowState | null) => void,
  addItem: (item: ArrowItem) => void,
  setActiveTool: (tool: 'select') => void,
) {
  setDraftArrow({ arrowStyle, startGeo, currentGeo: startGeo })
  map.dragging.disable()

  const handleWindowMove = (moveEvent: PointerEvent) => {
    const rect = mapContainer.getBoundingClientRect()
    const rawScreen = { x: moveEvent.clientX - rect.left, y: moveEvent.clientY - rect.top }
    const currScreen = moveEvent.shiftKey ? constrainAngleTo45Degrees(startScreen, rawScreen) : rawScreen
    setDraftArrow({ arrowStyle, startGeo, currentGeo: screenToGeo(map, currScreen) })
  }

  const handleWindowUp = (upEvent: PointerEvent) => {
    window.removeEventListener('pointermove', handleWindowMove)
    window.removeEventListener('pointerup', handleWindowUp)
    map.dragging.enable()

    const rect = mapContainer.getBoundingClientRect()
    const rawEndScreen = { x: upEvent.clientX - rect.left, y: upEvent.clientY - rect.top }
    const endScreen = upEvent.shiftKey ? constrainAngleTo45Degrees(startScreen, rawEndScreen) : rawEndScreen
    if (Math.hypot(rawEndScreen.x - startScreen.x, rawEndScreen.y - startScreen.y) >= 8) {
      addItem(buildArrowItem(arrowStyle, startGeo, screenToGeo(map, endScreen), activeColor, strokeWidth, dashed))
      setDraftArrow(null)
      setActiveTool('select')
    }
  }

  window.addEventListener('pointermove', handleWindowMove)
  window.addEventListener('pointerup', handleWindowUp)
}

export function buildRulerItem(
  startGeo: GeoPoint,
  endGeo: GeoPoint,
  activeColor: string,
  strokeWidth: number,
  dashed: boolean,
): RulerItem {
  return {
    id: createId('ruler'),
    type: 'ruler',
    start: startGeo,
    end: endGeo,
    color: activeColor,
    strokeWidth,
    dashed,
    unit: 'metric',
    createdAt: Date.now(),
  }
}

export function startRulerDrag(
  map: L.Map,
  mapContainer: HTMLElement,
  startScreen: ScreenPoint,
  startGeo: GeoPoint,
  activeColor: string,
  strokeWidth: number,
  dashed: boolean,
  setDraftRuler: (draft: DraftRulerState | null) => void,
  addItem: (item: RulerItem) => void,
  setActiveTool: (tool: 'select') => void,
) {
  setDraftRuler({ startGeo, currentGeo: startGeo })
  map.dragging.disable()

  const handleWindowMove = (moveEvent: PointerEvent) => {
    const rect = mapContainer.getBoundingClientRect()
    const rawScreen = { x: moveEvent.clientX - rect.left, y: moveEvent.clientY - rect.top }
    const currScreen = moveEvent.shiftKey ? constrainAngleTo45Degrees(startScreen, rawScreen) : rawScreen
    setDraftRuler({ startGeo, currentGeo: screenToGeo(map, currScreen) })
  }

  const handleWindowUp = (upEvent: PointerEvent) => {
    window.removeEventListener('pointermove', handleWindowMove)
    window.removeEventListener('pointerup', handleWindowUp)
    map.dragging.enable()

    const rect = mapContainer.getBoundingClientRect()
    const rawEndScreen = { x: upEvent.clientX - rect.left, y: upEvent.clientY - rect.top }
    const endScreen = upEvent.shiftKey ? constrainAngleTo45Degrees(startScreen, rawEndScreen) : rawEndScreen
    if (Math.hypot(rawEndScreen.x - startScreen.x, rawEndScreen.y - startScreen.y) >= 8) {
      addItem(buildRulerItem(startGeo, screenToGeo(map, endScreen), activeColor, strokeWidth, dashed))
      setDraftRuler(null)
      setActiveTool('select')
    }
  }

  window.addEventListener('pointermove', handleWindowMove)
  window.addEventListener('pointerup', handleWindowUp)
}

