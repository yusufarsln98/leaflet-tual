import type L from 'leaflet'
import type {
  Controller,
  Item,
  PenPoint,
  ScreenPoint,
} from '../../types/index.js'
import {
  geoToScreen,
  hitTest,
  screenToGeo,
} from '../../shared/geometry/geo.js'
import { commitDrawnItem } from '../../shared/drawing/shape-drawing.js'
import { translateItem, worldDelta } from '../../shared/geometry/translate.js'
import { editPenPointList, hitTestPenHandle } from '../../entities/pen/pen-handles.js'
import type { VanillaGesture } from './vanilla-drawing.js'

export interface VanillaGesturesContext {
  canvas: HTMLCanvasElement
  map: L.Map
  controller: Controller
  getActiveGesture: () => VanillaGesture | null
  setActiveGesture: (g: VanillaGesture | null) => void
  getShift: () => boolean
  setShift: (s: boolean) => void
  redraw: () => void
}

export function createVanillaGestures(ctx: VanillaGesturesContext) {
  let lastPenClick: { at: number; pt: ScreenPoint } | null = null

  function getCanvasPoint(e: MouseEvent | TouchEvent): ScreenPoint {
    const rect = ctx.canvas.getBoundingClientRect()
    if ('touches' in e) {
      const touch = e.touches[0] ?? e.changedTouches[0]
      if (!touch) return { x: 0, y: 0 }
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top }
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function finishPen(closed = false) {
    const gesture = ctx.getActiveGesture()
    if (!gesture || gesture.type !== 'pen-draft') return

    if (gesture.points.length >= 2) {
      ctx.controller.add({ type: 'pen', points: gesture.points, closed })
    }
    lastPenClick = null
    ctx.setActiveGesture(null)
    ctx.controller.setTool('select')
    ctx.redraw()
  }

  function handlePenDown(pt: ScreenPoint, geo: { lat: number; lng: number }): boolean {
    const gesture = ctx.getActiveGesture()
    const now = Date.now()
    const isDouble = gesture?.type === 'pen-draft' && lastPenClick && now - lastPenClick.at <= 320 && Math.hypot(pt.x - lastPenClick.pt.x, pt.y - lastPenClick.pt.y) <= 6
    if (isDouble) { finishPen(false); return true }

    if (gesture?.type === 'pen-draft' && gesture.points.length >= 2) {
      const first = geoToScreen(ctx.map, gesture.points[0].at)
      if (Math.hypot(pt.x - first.x, pt.y - first.y) <= 10) { finishPen(true); return true }
    }

    const points: PenPoint[] = gesture?.type === 'pen-draft' ? [...gesture.points, { at: geo }] : [{ at: geo }]
    lastPenClick = { at: now, pt }
    ctx.setActiveGesture({ type: 'pen-draft', points, activeIndex: points.length - 1, dragging: true, currentPt: pt, currentGeo: geo })
    return true
  }

  function handleSelectPointerDown(pt: ScreenPoint, geo: { lat: number; lng: number }, shift: boolean) {
    if (!shift) {
      for (const item of ctx.controller.selected) {
        if (item.type !== 'pen') continue
        const handle = hitTestPenHandle(ctx.map, item, pt)
        if (!handle) continue
        ctx.setActiveGesture({
          type: 'edit-pen',
          penId: item.id,
          pointIndex: handle.pointIndex,
          handle: handle.type,
          startGeo: geo,
          initialPoints: item.points,
        })
        return
      }
    }

    const hitItem = [...ctx.controller.items].reverse().find((item) => hitTest(item, pt, 12, ctx.map))
    if (!hitItem) { ctx.controller.select(null); return }

    const isSel = ctx.controller.selection.includes(hitItem.id)

    // Dragging a pen anchor/handle edits it immediately, even on the click
    // that first selects the path.
    if (!shift && hitItem.type === 'pen') {
      const handle = hitTestPenHandle(ctx.map, hitItem, pt)
      if (handle) {
        if (!isSel) ctx.controller.select(hitItem.id)
        ctx.setActiveGesture({
          type: 'edit-pen',
          penId: hitItem.id,
          pointIndex: handle.pointIndex,
          handle: handle.type,
          startGeo: geo,
          initialPoints: hitItem.points,
        })
        return
      }
    }

    if (shift) {
      ctx.controller.select(isSel ? ctx.controller.selection.filter((id) => id !== hitItem.id) : [...ctx.controller.selection, hitItem.id])
    } else if (!isSel) {
      ctx.controller.select(hitItem.id)
    } else {
      const itemIds = [...ctx.controller.selection]
      ctx.setActiveGesture({
        type: 'drag-item',
        itemIds,
        startPt: pt,
        startGeo: geo,
        initialItems: itemIds.map((id) => ctx.controller.items.find((item) => item.id === id)).filter((item): item is Item => Boolean(item)),
      })
    }
  }

  function onPointerDown(e: MouseEvent | TouchEvent) {
    if (ctx.controller.readOnly) return
    const shift = 'shiftKey' in e ? (e as MouseEvent).shiftKey : false
    ctx.setShift(shift)
    const pt = getCanvasPoint(e)
    const geo = screenToGeo(ctx.map, pt)

    if (ctx.controller.tool === 'select') {
      handleSelectPointerDown(pt, geo, shift)
      return
    }
    if (ctx.controller.tool === 'note') {
      const note = ctx.controller.add({ type: 'note', at: geo, width: 180, height: 180, baseZoom: ctx.map.getZoom(), text: 'New note' })
      ctx.controller.select(note.id)
      ctx.controller.setTool('select')
      return
    }
    if (ctx.controller.tool === 'text') {
      ctx.controller.add({ type: 'text', at: geo, text: 'New text' })
      ctx.controller.setTool('select')
      return
    }
    if (ctx.controller.tool === 'pen') {
      handlePenDown(pt, geo)
      return
    }

    ctx.setActiveGesture({
      type: 'draw',
      tool: ctx.controller.tool,
      variant: ctx.controller.variant,
      startPt: pt,
      startGeo: geo,
      currentPt: pt,
      currentGeo: geo,
      freedrawPoints: ctx.controller.tool === 'freedraw' ? [geo] : undefined,
    })
  }

  function onPointerMove(e: MouseEvent | TouchEvent) {
    const activeGesture = ctx.getActiveGesture()
    if (!activeGesture) return
    ctx.setShift('shiftKey' in e ? (e as MouseEvent).shiftKey : false)
    const pt = getCanvasPoint(e)
    const geo = screenToGeo(ctx.map, pt)

    if (activeGesture.type === 'pen-draft') {
      activeGesture.currentPt = pt
      activeGesture.currentGeo = geo
      if (activeGesture.dragging && activeGesture.activeIndex !== null) {
        const p = activeGesture.points[activeGesture.activeIndex]
        activeGesture.points[activeGesture.activeIndex] = {
          at: p.at,
          in: { lat: p.at.lat * 2 - geo.lat, lng: p.at.lng * 2 - geo.lng },
          out: geo,
        }
      }
    } else if (activeGesture.type === 'draw') {
      activeGesture.currentPt = pt
      activeGesture.currentGeo = geo
      if (activeGesture.tool === 'freedraw' && activeGesture.freedrawPoints) {
        activeGesture.freedrawPoints.push(geo)
      }
    } else if (activeGesture.type === 'edit-pen') {
      ctx.controller.update(
        activeGesture.penId,
        {
          points: editPenPointList(
            activeGesture.initialPoints,
            activeGesture.pointIndex,
            activeGesture.handle,
            activeGesture.startGeo,
            geo,
          ),
        },
        false,
      )
    } else if (activeGesture.type === 'drag-item') {
      const delta = worldDelta(activeGesture.startGeo, geo)
      for (const item of activeGesture.initialItems) {
        ctx.controller.update(item.id, translateItem(item, delta))
      }
    }
    ctx.redraw()
  }

  function onPointerUp(e: MouseEvent | TouchEvent) {
    const activeGesture = ctx.getActiveGesture()
    if (!activeGesture) return

    if (activeGesture.type === 'pen-draft') {
      activeGesture.dragging = false
      activeGesture.activeIndex = null
      ctx.redraw()
      return
    }

    if (activeGesture.type === 'edit-pen') {
      ctx.controller.update(activeGesture.penId, {})
      ctx.setActiveGesture(null)
      ctx.redraw()
      return
    }

    if (activeGesture.type === 'draw') {
      const endPt = getCanvasPoint(e)
      const endGeo = screenToGeo(ctx.map, endPt)
      const shiftKey = 'shiftKey' in e ? e.shiftKey : ctx.getShift()
      commitDrawnItem(
        ctx.controller,
        ctx.map,
        activeGesture.tool,
        activeGesture.variant,
        activeGesture.startPt,
        activeGesture.startGeo,
        endPt,
        endGeo,
        shiftKey,
        activeGesture.freedrawPoints,
      )
      ctx.controller.setTool('select')
    }

    ctx.setActiveGesture(null)
    ctx.redraw()
  }

  return { onPointerDown, onPointerMove, onPointerUp, finishPen }
}
