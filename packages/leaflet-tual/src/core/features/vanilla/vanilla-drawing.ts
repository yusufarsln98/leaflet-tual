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
} from '../../types/index.js'
import {
  renderArrowOnCanvas,
  renderFreedrawOnCanvas,
  renderNoteOnCanvas,
  renderPenOnCanvas,
  renderRulerOnCanvas,
  renderShapeOnCanvas,
  renderTextOnCanvas,
  snapAngle,
} from '../../index.js'
import { resolveShapePlacement } from '../../shared/drawing/shape-drawing.js'

export type VanillaGesture =
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

export function drawVanillaScene(
  canvas: HTMLCanvasElement,
  map: L.Map,
  controller: Controller,
  resolvedScheme: 'light' | 'dark',
  activeGesture: VanillaGesture | null,
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
    const renderOpts = { isSelected, tokens }
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
      case 'note':
        renderNoteOnCanvas(ctx, map, item, resolvedScheme, renderOpts)
        break
      case 'text':
        renderTextOnCanvas(ctx, map, item, resolvedScheme, renderOpts)
        break
    }
  }

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
      const placement = resolveShapePlacement(map, g.startPt, g.currentPt, {
        shiftKey: isShiftPressed,
      })
      renderShapeOnCanvas(
        ctx,
        map,
        {
          id: 'preview',
          type: 'shape',
          kind: (g.variant as ShapeKind) ?? 'square',
          at: placement.at,
          width: placement.width,
          height: placement.height,
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

