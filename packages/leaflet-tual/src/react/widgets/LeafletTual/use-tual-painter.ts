import { useCallback, useEffect } from 'react'
import type L from 'leaflet'
import type {
  ArrowItem,
  ArrowRenderTheme,
  TualAnnotationTheme,
  FreeDrawItem,
  GeoPoint,
  RulerItem,
  ScreenPoint,
  ShapeItem,
} from '../../types/index.js'
import { paintLeafletTual } from '../../../core/features/tual-painter.js'
import type { DraftArrowState, DraftRulerState, DraftShapeState } from './types.js'

export interface UseCanvasPainterOptions {
  map: L.Map | null
  viewport: { width: number; height: number; tick: number }
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  arrowItems: ArrowItem[]
  shapeItems: ShapeItem[]
  freeDrawItems: FreeDrawItem[]
  rulerItems: RulerItem[]
  selectedId: string | null
  draftShape: DraftShapeState | null
  draftArrow: DraftArrowState | null
  draftRuler?: DraftRulerState | null
  draftFreeDrawRef: React.RefObject<{
    screenPoints: ScreenPoint[]
    geoPoints: GeoPoint[]
  } | null>
  activeColor: string
  strokeWidth: number
  dashed: boolean
  shapeFilled: boolean
  annotationTheme?: TualAnnotationTheme
  arrowTheme?: ArrowRenderTheme
  isReadOnly: boolean
}

export function useTualPainter({
  map,
  viewport,
  canvasRef,
  arrowItems,
  shapeItems,
  freeDrawItems,
  rulerItems,
  selectedId,
  draftShape,
  draftArrow,
  draftRuler,
  draftFreeDrawRef,
  activeColor,
  strokeWidth,
  dashed,
  shapeFilled,
  annotationTheme,
  arrowTheme,
  isReadOnly,
}: UseCanvasPainterOptions) {
  const paintCanvas = useCallback(() => {
    paintLeafletTual({
      map,
      canvas: canvasRef.current,
      width: viewport.width,
      height: viewport.height,
      arrowItems,
      shapeItems,
      freeDrawItems,
      rulerItems,
      selectedId,
      draftShape,
      draftArrow,
      draftRuler,
      draftFreeDraw: draftFreeDrawRef.current,
      activeColor,
      strokeWidth,
      dashed,
      shapeFilled,
      annotationTheme,
      arrowTheme,
      isReadOnly,
    })
  }, [
    map,
    canvasRef,
    viewport.width,
    viewport.height,
    freeDrawItems,
    shapeItems,
    arrowItems,
    rulerItems,
    selectedId,
    draftShape,
    draftArrow,
    draftRuler,
    draftFreeDrawRef,
    activeColor,
    strokeWidth,
    dashed,
    shapeFilled,
    annotationTheme,
    arrowTheme,
    isReadOnly,
  ])

  useEffect(() => {
    paintCanvas()
  }, [paintCanvas, viewport.tick])

  return paintCanvas
}
