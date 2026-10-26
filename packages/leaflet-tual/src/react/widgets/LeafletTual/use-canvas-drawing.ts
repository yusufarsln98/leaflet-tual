import type L from 'leaflet'
import type {
  ArrowKind,
  Controller,
  GeoPoint,
  Item,
  PenPoint,
  ScreenPoint,
  ShapeKind,
  Tokens,
} from '../../../core/index.js'
import {
  lockAspect,
  renderArrowOnCanvas,
  renderFreedrawOnCanvas,
  renderNoteOnCanvas,
  renderPenOnCanvas,
  renderRulerOnCanvas,
  renderShapeOnCanvas,
  renderTextOnCanvas,
  snapAngle,
} from '../../../core/index.js'
import type { PenHandleType } from './use-pen-handles.js'

export type CanvasGesture =
  | {
      type: 'draw'
      tool: string
      variant: string | null
      startPt: ScreenPoint
      startGeo: GeoPoint
      currentPt: ScreenPoint
      currentGeo: GeoPoint
      freedrawPoints?: GeoPoint[]
    }
  | {
      type: 'pen-draft'
      points: PenPoint[]
      activeIndex: number | null
      dragging: boolean
      currentPt: ScreenPoint
      currentGeo: GeoPoint
    }
  | {
      type: 'drag-item'
      itemIds: string[]
      startPt: ScreenPoint
      startGeo: GeoPoint
      initialItems: Item[]
    }
  | {
      type: 'edit-pen'
      penId: string
      pointIndex: number
      handle: PenHandleType
      startGeo: GeoPoint
      initialPoints: PenPoint[]
    }
  | {
      type: 'resize-shape'
      shapeId: string
      handle: any
      initialFrom: GeoPoint
      initialTo: GeoPoint
      startGeo: GeoPoint
    }
  | {
      type: 'resize-arrow'
      arrowId: string
      handle: 'start' | 'end' | 'via'
      startGeo: GeoPoint
    }
  | {
      type: 'resize-ruler'
      rulerId: string
      handle: 'start' | 'end'
      startGeo: GeoPoint
    }

export function drawCanvasScene(
  canvas: HTMLCanvasElement,
  map: L.Map,
  controller: Controller,
  resolvedScheme: 'light' | 'dark',
  activeGesture: CanvasGesture | null,
  isShiftPressed: boolean,
  tokens?: Partial<Tokens>,
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const size = map.getSize()
  const dpr = window.devicePixelRatio || 1
  if (canvas.width !== size.x * dpr || canvas.height !== size.y * dpr) {
    canvas.width = size.x * dpr
    canvas.height = size.y * dpr
    canvas.style.width = `${size.x}px`
    canvas.style.height = `${size.y}px`
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, size.x, size.y)

  const items = controller.items
  const selectionSet = new Set(controller.selection)

  for (const item of items) {
    const isSelected = selectionSet.has(item.id)
    const isEditing = controller.editingId === item.id
    const renderOpts = { isSelected, isEditing, tokens }

    switch (item.type) {
      case 'arrow':
        renderArrowOnCanvas(ctx, map, item, resolvedScheme, renderOpts)
        break
      case 'shape':
        renderShapeOnCanvas(ctx, map, item, resolvedScheme, renderOpts)
        break
      case 'freedraw':
        renderFreedrawOnCanvas(ctx, map, item, resolvedScheme, renderOpts)
        break
      case 'pen':
        renderPenOnCanvas(ctx, map, item, resolvedScheme, renderOpts)
        break
      case 'ruler':
        renderRulerOnCanvas(ctx, map, item, resolvedScheme, renderOpts)
        break
    }
  }

  // Active live preview while drawing
  if (activeGesture && activeGesture.type === 'draw') {
    const g = activeGesture
    let toGeo = g.currentGeo

    if (g.tool === 'arrow') {
      if (isShiftPressed) toGeo = snapAngle(g.startGeo, g.currentGeo, 45)
      renderArrowOnCanvas(
        ctx,
        map,
        {
          id: 'preview',
          type: 'arrow',
          kind: (g.variant as ArrowKind) ?? 'linear',
          from: g.startGeo,
          to: toGeo,
          style: controller.style,
          createdAt: Date.now(),
        },
        resolvedScheme,
        { tokens },
      )
    } else if (g.tool === 'shape') {
      if (isShiftPressed) toGeo = lockAspect(g.startGeo, g.currentGeo, 1)
      renderShapeOnCanvas(
        ctx,
        map,
        {
          id: 'preview',
          type: 'shape',
          kind: (g.variant as ShapeKind) ?? 'square',
          from: g.startGeo,
          to: toGeo,
          style: controller.style,
          createdAt: Date.now(),
        },
        resolvedScheme,
        { tokens },
      )
    } else if (g.tool === 'ruler') {
      renderRulerOnCanvas(
        ctx,
        map,
        {
          id: 'preview',
          type: 'ruler',
          from: g.startGeo,
          to: g.currentGeo,
          style: controller.style,
          createdAt: Date.now(),
        },
        resolvedScheme,
        { tokens },
      )
    } else if (g.tool === 'freedraw' && g.freedrawPoints && g.freedrawPoints.length > 1) {
      renderFreedrawOnCanvas(
        ctx,
        map,
        {
          id: 'preview',
          type: 'freedraw',
          points: g.freedrawPoints,
          style: controller.style,
          createdAt: Date.now(),
        },
        resolvedScheme,
        { tokens },
      )
    }
  }

  if (activeGesture && activeGesture.type === 'pen-draft' && activeGesture.points.length > 0) {
    const previewPoints = activeGesture.dragging
      ? activeGesture.points
      : [...activeGesture.points, { at: activeGesture.currentGeo }]

    renderPenOnCanvas(
      ctx,
      map,
      {
        id: 'preview',
        type: 'pen',
        points: previewPoints,
        style: controller.style,
        createdAt: Date.now(),
      },
      resolvedScheme,
      { isSelected: true, tokens },
    )
  }
}

