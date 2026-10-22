import { useRef, useState } from 'react'
import type React from 'react'
import type L from 'leaflet'
import type {
  CanvasLabels,
  CanvasTool,
  GeoPoint,
  ScreenPoint,
  ShapeKind,
} from '../../types/index.js'
import {
  constrainAngleTo45Degrees,
  geoToScreen,
  screenToGeo,
} from '../../shared/index.js'
import { TOOL_TO_ARROW_STYLE } from './constants.js'
import type { DraftArrowState, DraftRulerState, DraftShapeState } from './types.js'
import {
  buildArrowItem,
  createDraftNote,
  createDraftText,
  startArrowDrag,
  startFreeDrawDrag,
  startRulerDrag,
  startShapeDrag,
} from './drawing-drag-handlers.js'

export interface UseDrawingInteractionsOptions {
  map: L.Map | null
  activeTool: CanvasTool
  setActiveTool: (tool: CanvasTool) => void
  activeShape: ShapeKind
  shapeFilled: boolean
  activeColor: string
  strokeWidth: number
  dashed: boolean
  noteColor: string
  fontSize: number
  fontWeight: 'normal' | 'bold'
  labels?: CanvasLabels
  addItem: (item: any) => void
  paintCanvas: () => void
}

export function useDrawingInteractions({
  map,
  activeTool,
  setActiveTool,
  activeShape,
  shapeFilled,
  activeColor,
  strokeWidth,
  dashed,
  noteColor,
  fontSize,
  fontWeight,
  labels,
  addItem,
  paintCanvas,
}: UseDrawingInteractionsOptions) {
  const [draftArrow, setDraftArrow] = useState<DraftArrowState | null>(null)
  const [draftShape, setDraftShape] = useState<DraftShapeState | null>(null)
  const [draftRuler, setDraftRuler] = useState<DraftRulerState | null>(null)

  const draftFreeDrawRef = useRef<{
    screenPoints: ScreenPoint[]
    geoPoints: GeoPoint[]
  } | null>(null)
  const rafIdRef = useRef<number | null>(null)

  const clearDraftFreeDraw = () => {
    draftFreeDrawRef.current = null
    if (rafIdRef.current !== null) {
      window.cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }
  }

  const getRelativeScreenPoint = (e: React.PointerEvent<HTMLDivElement>): ScreenPoint => {
    if (!map) return { x: 0, y: 0 }
    const rect = map.getContainer().getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const handleInteractionPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !map) return
    e.stopPropagation()
    e.preventDefault()

    const mapContainer = map.getContainer()
    const pt = getRelativeScreenPoint(e)
    const geo = screenToGeo(map, pt)

    if (activeTool === 'freedraw') {
      startFreeDrawDrag(map, mapContainer, pt, geo, activeColor, strokeWidth, dashed, draftFreeDrawRef, rafIdRef, paintCanvas, addItem, setActiveTool)
      return
    }

    if (activeTool === 'shape') {
      startShapeDrag(map, mapContainer, pt, geo, activeShape, activeColor, shapeFilled, strokeWidth, dashed, setDraftShape, addItem, setActiveTool)
      return
    }

    if (activeTool === 'ruler') {
      startRulerDrag(map, mapContainer, pt, geo, activeColor, strokeWidth, dashed, setDraftRuler, addItem, setActiveTool)
      return
    }

    if (activeTool === 'note') {
      addItem(createDraftNote(geo, noteColor, labels?.noteDefaultTitle))
      if (!e.shiftKey) setActiveTool('select')
      return
    }

    if (activeTool === 'text') {
      const zoom = typeof map?.getZoom === 'function' ? map.getZoom() : 14
      addItem(createDraftText(geo, activeColor, fontSize, fontWeight, zoom))
      if (!e.shiftKey) setActiveTool('select')
      return
    }

    const arrowStyle = TOOL_TO_ARROW_STYLE[activeTool]
    if (arrowStyle) {
      if (draftArrow) {
        const startScreen = geoToScreen(map, draftArrow.startGeo)
        const finalScreen = e.shiftKey ? constrainAngleTo45Degrees(startScreen, pt) : pt
        addItem(buildArrowItem(draftArrow.arrowStyle, draftArrow.startGeo, screenToGeo(map, finalScreen), activeColor, strokeWidth, dashed))
        setDraftArrow(null)
        setActiveTool('select')
        return
      }

      startArrowDrag(map, mapContainer, pt, geo, arrowStyle, activeColor, strokeWidth, dashed, setDraftArrow, addItem, setActiveTool)
    }
  }

  const handleInteractionPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draftArrow || !map) return
    const rawPt = getRelativeScreenPoint(e)
    const startScreen = geoToScreen(map, draftArrow.startGeo)
    const pt = e.shiftKey ? constrainAngleTo45Degrees(startScreen, rawPt) : rawPt
    setDraftArrow((prev) => (prev ? { ...prev, currentGeo: screenToGeo(map, pt) } : null))
  }

  return {
    draftArrow,
    setDraftArrow,
    draftShape,
    setDraftShape,
    draftRuler,
    setDraftRuler,
    draftFreeDrawRef,
    clearDraftFreeDraw,
    handleInteractionPointerDown,
    handleInteractionPointerMove,
  }
}
