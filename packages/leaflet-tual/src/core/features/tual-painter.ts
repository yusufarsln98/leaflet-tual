import type L from 'leaflet'
import type {
  ArrowItem,
  ArrowRenderTheme,
  TualAnnotationTheme,
  DraftArrowState,
  DraftRulerState,
  DraftShapeState,
  FreeDrawItem,
  GeoPoint,
  RulerItem,
  ScreenPoint,
  ShapeItem,
} from '../types/index.js'
import {
  projectArrow,
  projectFreeDraw,
  projectRuler,
  projectShape,
  renderArrowOnCanvas,
  renderFreeDrawOnCanvas,
  renderRulerOnCanvas,
  renderShapeOnCanvas,
} from '../entities/index.js'

export interface PaintLeafletTualOptions {
  map: L.Map | null
  canvas: HTMLCanvasElement | null
  width: number
  height: number
  arrowItems: ArrowItem[]
  shapeItems: ShapeItem[]
  freeDrawItems: FreeDrawItem[]
  rulerItems: RulerItem[]
  selectedId: string | null
  draftShape: DraftShapeState | null
  draftArrow: DraftArrowState | null
  draftRuler?: DraftRulerState | null
  draftFreeDraw?: {
    screenPoints: ScreenPoint[]
    geoPoints: GeoPoint[]
  } | null
  activeColor: string
  strokeWidth: number
  dashed: boolean
  shapeFilled: boolean
  annotationTheme?: TualAnnotationTheme
  arrowTheme?: ArrowRenderTheme
  isReadOnly: boolean
}

export function paintLeafletTual({
  map,
  canvas,
  width,
  height,
  arrowItems,
  shapeItems,
  freeDrawItems,
  rulerItems,
  selectedId,
  draftShape,
  draftArrow,
  draftRuler,
  draftFreeDraw,
  activeColor,
  strokeWidth,
  dashed,
  shapeFilled,
  annotationTheme,
  arrowTheme,
  isReadOnly,
}: PaintLeafletTualOptions) {
  if (!map || !canvas || width === 0 || height === 0) return

  const effectiveTheme = annotationTheme ?? arrowTheme
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  const targetW = Math.round(width * dpr)
  const targetH = Math.round(height * dpr)
  if (canvas.width !== targetW) {
    canvas.width = targetW
  }
  if (canvas.height !== targetH) {
    canvas.height = targetH
  }

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.save()
  if (typeof ctx.scale === 'function') {
    ctx.scale(dpr, dpr)
  }
  ctx.clearRect(0, 0, width, height)

  for (const fd of freeDrawItems) {
    const screenPts = projectFreeDraw(map, fd)
    renderFreeDrawOnCanvas(ctx, screenPts, fd, {
      isSelected: !isReadOnly && fd.id === selectedId,
      theme: effectiveTheme,
    })
  }

  for (const shp of shapeItems) {
    const projected = projectShape(map, shp)
    renderShapeOnCanvas(ctx, projected, shp, {
      isSelected: !isReadOnly && shp.id === selectedId,
      theme: effectiveTheme,
    })
  }

  for (const arrow of arrowItems) {
    const projected = projectArrow(map, arrow)
    renderArrowOnCanvas(ctx, projected, arrow, {
      isSelected: !isReadOnly && arrow.id === selectedId,
      theme: effectiveTheme,
    })
  }

  for (const ruler of rulerItems) {
    const projected = projectRuler(map, ruler)
    renderRulerOnCanvas(ctx, projected, ruler, {
      isSelected: !isReadOnly && ruler.id === selectedId,
      theme: effectiveTheme,
    })
  }

  if (!isReadOnly && draftFreeDraw && draftFreeDraw.screenPoints.length > 0) {
    renderFreeDrawOnCanvas(
      ctx,
      draftFreeDraw.screenPoints,
      {
        color: activeColor,
        strokeWidth,
        dashed,
      },
      {
        isPreview: true,
        theme: effectiveTheme,
      },
    )
  }

  if (!isReadOnly && draftShape) {
    const tempShape: ShapeItem = {
      id: 'draft-shape',
      type: 'shape',
      shape: draftShape.shape,
      start: draftShape.startGeo,
      end: draftShape.currentGeo,
      color: activeColor,
      filled: shapeFilled,
      strokeWidth,
      dashed,
      createdAt: 0,
    }
    const projected = projectShape(map, tempShape)
    renderShapeOnCanvas(ctx, projected, tempShape, {
      isPreview: true,
      isSelected: true,
      theme: effectiveTheme,
    })
  }

  if (!isReadOnly && draftArrow) {
    const tempArrow: ArrowItem = {
      id: 'draft-arrow',
      type: 'arrow',
      arrowStyle: draftArrow.arrowStyle,
      start: draftArrow.startGeo,
      end: draftArrow.currentGeo,
      color: activeColor,
      strokeWidth,
      dashed,
      createdAt: 0,
    }
    const projected = projectArrow(map, tempArrow)
    renderArrowOnCanvas(ctx, projected, tempArrow, {
      isPreview: true,
      isSelected: true,
      theme: effectiveTheme,
    })
  }

  if (!isReadOnly && draftRuler) {
    const tempRuler: RulerItem = {
      id: 'draft-ruler',
      type: 'ruler',
      start: draftRuler.startGeo,
      end: draftRuler.currentGeo,
      color: activeColor,
      strokeWidth,
      dashed,
      unit: 'metric',
      createdAt: 0,
    }
    const projected = projectRuler(map, tempRuler)
    renderRulerOnCanvas(ctx, projected, tempRuler, {
      isPreview: true,
      isSelected: true,
      theme: effectiveTheme,
    })
  }

  ctx.restore()
}


