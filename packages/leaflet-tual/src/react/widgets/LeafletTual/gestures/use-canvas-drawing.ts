import type L from 'leaflet'
import type { ArrowKind, Controller, ShapeKind } from '../../../../core/index.js'
import {
  DEFAULT_TOOL_STYLES,
  drawHandle,
  getSelectionScreenBounds,
  renderArrowOnCanvas,
  renderFreedrawOnCanvas,
  renderItemOnCanvas,
  renderPenOnCanvas,
  renderRulerOnCanvas,
  renderShapeOnCanvas,
  resolveColor,
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
  activeGesture: CanvasGesture | null,
  isShiftPressed: boolean,
  hoveredItemId: string | null = null,
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
  const isMultiSelected = controller.selected.length > 1

  const hoveredIds: string[] =
    !activeGesture && hoveredItemId ? [hoveredItemId] : []
  const hoveredSet = new Set(hoveredIds)

  for (const item of items) {
    const isItemSelected = selectionSet.has(item.id)
    renderItemOnCanvas(ctx, map, item, {
      isSelected: !isMultiSelected && isItemSelected,
      isHovered: hoveredSet.has(item.id) || (isMultiSelected && isItemSelected),
      isEditing: controller.editingId === item.id,
      translations: controller.translations,
    })
  }

  // Multi-selection bounding frame
  if (isMultiSelected) {
    const selectionBounds = getSelectionScreenBounds(map, controller.selected)
    if (selectionBounds && (selectionBounds.width > 0 || selectionBounds.height > 0)) {
      const pad = 6
      const gx = selectionBounds.minX - pad
      const gy = selectionBounds.minY - pad
      const gw = selectionBounds.width + pad * 2
      const gh = selectionBounds.height + pad * 2
      const handleColor = resolveColor('blue')

      ctx.save()
      ctx.strokeStyle = handleColor
      ctx.lineWidth = 1.5
      ctx.setLineDash([])
      ctx.strokeRect(gx, gy, gw, gh)
      ctx.restore()

      drawHandle(ctx, { x: gx, y: gy }, handleColor, 8)
      drawHandle(ctx, { x: gx + gw, y: gy }, handleColor, 8)
      drawHandle(ctx, { x: gx + gw, y: gy + gh }, handleColor, 8)
      drawHandle(ctx, { x: gx, y: gy + gh }, handleColor, 8)
    }
  }

  // Active Shift+drag marquee selection box
  if (activeGesture && activeGesture.type === 'marquee') {
    const x = Math.min(activeGesture.startPt.x, activeGesture.currentPt.x)
    const y = Math.min(activeGesture.startPt.y, activeGesture.currentPt.y)
    const w = Math.abs(activeGesture.currentPt.x - activeGesture.startPt.x)
    const h = Math.abs(activeGesture.currentPt.y - activeGesture.startPt.y)
    if (w > 1 || h > 1) {
      ctx.save()
      ctx.fillStyle = 'rgba(107, 114, 128, 0.12)'
      ctx.strokeStyle = 'rgba(107, 114, 128, 0.75)'
      ctx.lineWidth = 1
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.rect(x, y, w, h)
      ctx.fill()
      ctx.strokeRect(x, y, w, h)
      ctx.restore()
    }
  }

  const currentZoom = typeof map.getZoom === 'function' ? map.getZoom() : 13

  // Active live preview while drawing
  if (activeGesture && activeGesture.type === 'draw') {
    const g = activeGesture
    let toGeo = g.currentGeo
    const previewStyle = { ...DEFAULT_TOOL_STYLES[g.tool], ...controller.style }

    if (g.tool === 'arrow') {
      if (isShiftPressed) toGeo = snapAngle(g.startGeo, g.currentGeo, 45)
      renderArrowOnCanvas(ctx, map, {
        id: 'preview',
        type: 'arrow',
        kind: (g.variant as ArrowKind) ?? 'linear',
        from: g.startGeo,
        to: toGeo,
        baseZoom: currentZoom,
        style: previewStyle,
        createdAt: Date.now(),
      })
    } else if (g.tool === 'shape') {
      if (!isClickGesture(g.startPt, g.currentPt)) {
        const placement = resolveShapePlacement(map, g.startPt, g.currentPt, {
          shiftKey: isShiftPressed,
          isCompleted: false,
        })
        renderShapeOnCanvas(ctx, map, {
          id: 'preview',
          type: 'shape',
          kind: (g.variant as ShapeKind) ?? 'square',
          at: placement.at,
          width: placement.width,
          height: placement.height,
          baseZoom: currentZoom,
          style: previewStyle,
          createdAt: Date.now(),
        })
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
          baseZoom: currentZoom,
          style: previewStyle,
          createdAt: Date.now(),
        },
        { translations: controller.translations },
      )
    } else if (g.tool === 'freedraw' && g.freedrawPoints && g.freedrawPoints.length > 1) {
      renderFreedrawOnCanvas(ctx, map, {
        id: 'preview',
        type: 'freedraw',
        points: g.freedrawPoints,
        baseZoom: currentZoom,
        style: previewStyle,
        createdAt: Date.now(),
      })
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
        baseZoom: currentZoom,
        style: { ...DEFAULT_TOOL_STYLES.pen, ...controller.style },
        createdAt: Date.now(),
      },
      { isSelected: true },
    )
  }
}
