import type L from 'leaflet'
import type { ArrowKind, Controller, ShapeKind, Tokens } from '../../../../core/index.js'
import {
  renderArrowOnCanvas,
  renderFreedrawOnCanvas,
  renderPenOnCanvas,
  renderRulerOnCanvas,
  renderShapeOnCanvas,
  snapAngle,
} from '../../../../core/index.js'
import {
  isClickGesture,
  resolveShapePlacement,
} from '../../../../core/shared/drawing/shape-drawing.js'
import type { CanvasGesture } from './gesture-types.js'

export type { CanvasGesture } from './gesture-types.js'

export function drawCanvasScene(
  canvas: HTMLCanvasElement,
  map: L.Map,
  controller: Controller,
  _resolvedScheme: 'light' | 'dark',
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
        renderArrowOnCanvas(ctx, map, item, 'light', renderOpts)
        break
      case 'shape':
        renderShapeOnCanvas(ctx, map, item, 'light', renderOpts)
        break
      case 'freedraw':
        renderFreedrawOnCanvas(ctx, map, item, 'light', renderOpts)
        break
      case 'pen':
        renderPenOnCanvas(ctx, map, item, 'light', renderOpts)
        break
      case 'ruler':
        renderRulerOnCanvas(ctx, map, item, 'light', renderOpts)
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
        'light',
        { tokens },
      )
    } else if (g.tool === 'shape') {
      if (!isClickGesture(g.startPt, g.currentPt)) {
        const placement = resolveShapePlacement(map, g.startPt, g.currentPt, {
          shiftKey: isShiftPressed,
          isCompleted: false,
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
          'light',
          { tokens },
        )
      }
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
        'light',
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
        'light',
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
      'light',
      { isSelected: true, tokens },
    )
  }
}
