import type L from 'leaflet'
import type {
  ArrowKind,
  Controller,
  Item,
  PenPoint,
  ScreenPoint,
  ShapeKind,
} from '../types/index.js'
import {
  geoToScreen,
  hitTest,
  screenToGeo,
  snapAngle,
} from '../shared/geo.js'
import { isClickGesture, resolveShapeDragBounds } from '../shared/shape-drawing.js'
import { translateItem, worldDelta } from '../shared/translate.js'
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

  function onPointerDown(e: MouseEvent | TouchEvent) {
    if (ctx.controller.readOnly) return
    ctx.setShift('shiftKey' in e ? (e as MouseEvent).shiftKey : false)
    const pt = getCanvasPoint(e)
    const geo = screenToGeo(ctx.map, pt)

    if (ctx.controller.tool === 'select') {
      const items = [...ctx.controller.items].reverse()
      let hitItem: Item | null = null
      for (const item of items) {
        if (hitTest(item, pt, 12, ctx.map)) {
          hitItem = item
          break
        }
      }

      if (hitItem) {
        if ('shiftKey' in e && (e as MouseEvent).shiftKey) {
          if (ctx.controller.selection.includes(hitItem.id)) {
            ctx.controller.select(ctx.controller.selection.filter((id) => id !== hitItem!.id))
          } else {
            ctx.controller.select([...ctx.controller.selection, hitItem.id])
          }
        } else if (!ctx.controller.selection.includes(hitItem.id)) {
          ctx.controller.select(hitItem.id)
        }

        const itemIds = [...ctx.controller.selection]
        ctx.setActiveGesture({
          type: 'drag-item',
          itemIds,
          startPt: pt,
          startGeo: geo,
          initialItems: itemIds
            .map((id) => ctx.controller.items.find((item) => item.id === id))
            .filter((item): item is Item => Boolean(item)),
        })
      } else {
        ctx.controller.select(null)
      }
      return
    }

    if (ctx.controller.tool === 'note') {
      const zoom = ctx.map.getZoom()
      const note = ctx.controller.add({
        type: 'note',
        at: geo,
        width: 180,
        height: 180,
        baseZoom: zoom,
        text: 'New note',
      })
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
      const gesture = ctx.getActiveGesture()
      const now = Date.now()

      if (
        gesture?.type === 'pen-draft' &&
        lastPenClick &&
        now - lastPenClick.at <= 320 &&
        Math.hypot(pt.x - lastPenClick.pt.x, pt.y - lastPenClick.pt.y) <= 6
      ) {
        finishPen(false)
        return
      }

      if (gesture?.type === 'pen-draft' && gesture.points.length >= 2) {
        const first = geoToScreen(ctx.map, gesture.points[0].at)
        if (Math.hypot(pt.x - first.x, pt.y - first.y) <= 10) {
          finishPen(true)
          return
        }
      }

      const points: PenPoint[] =
        gesture?.type === 'pen-draft'
          ? [...gesture.points, { at: geo }]
          : [{ at: geo }]

      lastPenClick = { at: now, pt }
      ctx.setActiveGesture({
        type: 'pen-draft',
        points,
        activeIndex: points.length - 1,
        dragging: true,
        currentPt: pt,
        currentGeo: geo,
      })
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
        const index = activeGesture.activeIndex
        const point = activeGesture.points[index]
        activeGesture.points[index] = {
          at: point.at,
          in: {
            lat: point.at.lat * 2 - geo.lat,
            lng: point.at.lng * 2 - geo.lng,
          },
          out: geo,
        }
      }
      ctx.redraw()
    } else if (activeGesture.type === 'draw') {
      activeGesture.currentPt = pt
      activeGesture.currentGeo = geo
      if (activeGesture.tool === 'freedraw' && activeGesture.freedrawPoints) {
        activeGesture.freedrawPoints.push(geo)
      }
      ctx.redraw()
    } else if (activeGesture.type === 'drag-item') {
      const delta = worldDelta(activeGesture.startGeo, geo)
      for (const item of activeGesture.initialItems) {
        ctx.controller.update(item.id, translateItem(item, delta))
      }
      ctx.redraw()
    }
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

    if (activeGesture.type === 'draw') {
      const g = activeGesture
      // Prefer the release point so a dropped final move cannot shrink the shape.
      const endPt = getCanvasPoint(e)
      const endGeo = screenToGeo(ctx.map, endPt)
      const shiftKey = 'shiftKey' in e ? e.shiftKey : ctx.getShift()

      if (g.tool === 'arrow') {
        if (!isClickGesture(g.startPt, endPt)) {
          const to = shiftKey ? snapAngle(g.startGeo, endGeo, 45) : endGeo
          ctx.controller.add({ type: 'arrow', kind: (g.variant as ArrowKind) ?? 'linear', from: g.startGeo, to })
        }
      } else if (g.tool === 'shape') {
        const { from, to } = resolveShapeDragBounds(ctx.map, g.startPt, endPt, {
          shiftKey,
        })
        ctx.controller.add({ type: 'shape', kind: (g.variant as ShapeKind) ?? 'square', from, to })
      } else if (g.tool === 'ruler') {
        if (!isClickGesture(g.startPt, endPt)) {
          ctx.controller.add({ type: 'ruler', from: g.startGeo, to: endGeo })
        }
      } else if (
        g.tool === 'freedraw' &&
        g.freedrawPoints &&
        g.freedrawPoints.length > 1
      ) {
        ctx.controller.add({ type: 'freedraw', points: g.freedrawPoints })
      }

      ctx.controller.setTool('select')
    }

    ctx.setActiveGesture(null)
    ctx.redraw()
  }

  return { onPointerDown, onPointerMove, onPointerUp, finishPen }
}

