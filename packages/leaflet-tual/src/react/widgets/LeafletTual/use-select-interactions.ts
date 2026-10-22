import { useEffect, useState } from 'react'
import type L from 'leaflet'
import type {
  ArrowItem,
  FreeDrawItem,
  RulerItem,
  ScreenPoint,
  ShapeItem,
} from '../../types/index.js'
import {
  hitTestArrow,
  hitTestArrowHandle,
  hitTestFreeDraw,
  hitTestRuler,
  hitTestRulerHandle,
  hitTestShape,
  hitTestShapeHandle,
  projectArrow,
  projectFreeDraw,
  projectRuler,
  projectShape,
} from '../../entities/index.js'
import {
  startArrowBodyDrag,
  startArrowHandleDrag,
  startFreeDrawBodyDrag,
  startRulerBodyDrag,
  startRulerHandleDrag,
  startShapeBodyDrag,
  startShapeHandleDrag,
} from './select-drag-handlers.js'

export interface UseSelectInteractionsOptions {
  map: L.Map | null
  activeTool: string
  isReadOnly: boolean
  arrowItems: ArrowItem[]
  shapeItems: ShapeItem[]
  freeDrawItems: FreeDrawItem[]
  rulerItems: RulerItem[]
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  setEditingLabel?: (editing: boolean) => void
  updateItem: (id: string, patch: any) => void
  notifyChangeComplete?: () => void
}

export function useSelectInteractions({
  map,
  activeTool,
  isReadOnly,
  arrowItems,
  shapeItems,
  freeDrawItems,
  rulerItems,
  selectedId,
  setSelectedId,
  setEditingLabel,
  updateItem,
  notifyChangeComplete,
}: UseSelectInteractionsOptions) {
  const [hoverCursor, setHoverCursor] = useState<string | null>(null)

  useEffect(() => {
    if (!map || activeTool !== 'select' || isReadOnly) {
      setHoverCursor(null)
      return
    }

    const container = map.getContainer()

    const getLocalPoint = (e: PointerEvent): ScreenPoint => {
      const rect = container.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }

    const handlePointerMove = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null
      if (target?.closest('[data-tual-toolbar], [data-tual-note], [data-tual-text]')) {
        setHoverCursor(null)
        return
      }

      const pt = getLocalPoint(e)

      const selectedArrow = arrowItems.find((a) => a.id === selectedId)
      if (selectedArrow && hitTestArrowHandle(pt, projectArrow(map, selectedArrow), selectedArrow)) {
        setHoverCursor('crosshair')
        return
      }

      const selectedShape = shapeItems.find((s) => s.id === selectedId)
      if (selectedShape && hitTestShapeHandle(pt, projectShape(map, selectedShape))) {
        setHoverCursor('nwse-resize')
        return
      }

      const selectedRuler = rulerItems.find((r) => r.id === selectedId)
      if (selectedRuler && hitTestRulerHandle(pt, projectRuler(map, selectedRuler))) {
        setHoverCursor('crosshair')
        return
      }

      for (let i = arrowItems.length - 1; i >= 0; i -= 1) {
        const arrow = arrowItems[i]
        if (hitTestArrow(pt, projectArrow(map, arrow), arrow)) {
          setHoverCursor('pointer')
          return
        }
      }

      for (let i = shapeItems.length - 1; i >= 0; i -= 1) {
        if (hitTestShape(pt, projectShape(map, shapeItems[i]))) {
          setHoverCursor('pointer')
          return
        }
      }

      for (let i = freeDrawItems.length - 1; i >= 0; i -= 1) {
        const fd = freeDrawItems[i]
        if (hitTestFreeDraw(pt, projectFreeDraw(map, fd), fd)) {
          setHoverCursor('pointer')
          return
        }
      }

      for (let i = rulerItems.length - 1; i >= 0; i -= 1) {
        const ruler = rulerItems[i]
        if (hitTestRuler(pt, projectRuler(map, ruler), ruler)) {
          setHoverCursor('pointer')
          return
        }
      }

      setHoverCursor(null)
    }

    const handlePointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return
      const target = e.target as HTMLElement | null
      if (target?.closest('[data-tual-toolbar], [data-tual-note], [data-tual-text], .leaflet-control')) {
        return
      }

      const pt = getLocalPoint(e)

      const selectedArrow = arrowItems.find((a) => a.id === selectedId)
      if (selectedArrow) {
        const projected = projectArrow(map, selectedArrow)
        const handle = hitTestArrowHandle(pt, projected, selectedArrow)
        if (handle) {
          e.stopPropagation()
          e.preventDefault()
          startArrowHandleDrag(map, selectedArrow, projected, handle, getLocalPoint, updateItem)
          return
        }
      }

      const selectedShape = shapeItems.find((s) => s.id === selectedId)
      if (selectedShape) {
        const projected = projectShape(map, selectedShape)
        const handle = hitTestShapeHandle(pt, projected)
        if (handle) {
          e.stopPropagation()
          e.preventDefault()
          startShapeHandleDrag(map, selectedShape, projected, handle, getLocalPoint, updateItem)
          return
        }
      }

      const selectedRuler = rulerItems.find((r) => r.id === selectedId)
      if (selectedRuler) {
        const projected = projectRuler(map, selectedRuler)
        const handle = hitTestRulerHandle(pt, projected)
        if (handle) {
          e.stopPropagation()
          e.preventDefault()
          startRulerHandleDrag(map, selectedRuler, projected, handle, getLocalPoint, updateItem)
          return
        }
      }

      for (let i = arrowItems.length - 1; i >= 0; i -= 1) {
        const arrow = arrowItems[i]
        const projected = projectArrow(map, arrow)
        if (hitTestArrow(pt, projected, arrow)) {
          e.stopPropagation()
          e.preventDefault()
          setSelectedId(arrow.id)
          startArrowBodyDrag(map, arrow, projected, pt, getLocalPoint, updateItem)
          return
        }
      }

      for (let i = shapeItems.length - 1; i >= 0; i -= 1) {
        const shp = shapeItems[i]
        const projected = projectShape(map, shp)
        if (hitTestShape(pt, projected)) {
          e.stopPropagation()
          e.preventDefault()
          setSelectedId(shp.id)
          startShapeBodyDrag(map, shp, projected, pt, getLocalPoint, updateItem)
          return
        }
      }

      for (let i = freeDrawItems.length - 1; i >= 0; i -= 1) {
        const fd = freeDrawItems[i]
        const initialScreenPts = projectFreeDraw(map, fd)
        if (hitTestFreeDraw(pt, initialScreenPts, fd)) {
          e.stopPropagation()
          e.preventDefault()
          setSelectedId(fd.id)
          startFreeDrawBodyDrag(map, fd, initialScreenPts, pt, getLocalPoint, updateItem)
          return
        }
      }

      for (let i = rulerItems.length - 1; i >= 0; i -= 1) {
        const ruler = rulerItems[i]
        const projected = projectRuler(map, ruler)
        if (hitTestRuler(pt, projected, ruler)) {
          e.stopPropagation()
          e.preventDefault()
          setSelectedId(ruler.id)
          startRulerBodyDrag(map, ruler, projected, pt, getLocalPoint, updateItem)
          return
        }
      }

      if (selectedId) {
        setSelectedId(null)
        notifyChangeComplete?.()
      }
    }

    const handleDblClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (
        target?.closest(
          '[data-tual-toolbar], [data-tual-note], [data-tual-text], .leaflet-control',
        )
      ) {
        return
      }

      const rect = container.getBoundingClientRect()
      const pt: ScreenPoint = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }

      for (let i = shapeItems.length - 1; i >= 0; i -= 1) {
        const shp = shapeItems[i]
        const projected = projectShape(map, shp)
        if (hitTestShape(pt, projected)) {
          e.stopPropagation()
          e.preventDefault()
          setSelectedId(shp.id)
          const hasLabelMode =
            shp.labelMode !== false && (shp as any).hasLabelMode !== false
          if (hasLabelMode) {
            setEditingLabel?.(true)
            const focusInput = () => {
              const input = document.querySelector<HTMLInputElement>(
                `[data-tual-shape-label-input="${shp.id}"], [data-tual-shape-label-input], input[placeholder*="Shape label"]`,
              )
              if (input) {
                input.focus()
                input.select()
              }
            }
            focusInput()
            if (typeof requestAnimationFrame === 'function') {
              requestAnimationFrame(focusInput)
            }
            setTimeout(focusInput, 0)
          }
          return
        }
      }
    }

    container.addEventListener('pointermove', handlePointerMove)
    container.addEventListener('pointerdown', handlePointerDown, { capture: true })
    container.addEventListener('dblclick', handleDblClick, { capture: true })

    return () => {
      container.removeEventListener('pointermove', handlePointerMove)
      container.removeEventListener('pointerdown', handlePointerDown, { capture: true })
      container.removeEventListener('dblclick', handleDblClick, { capture: true })
    }
  }, [
    map,
    activeTool,
    arrowItems,
    shapeItems,
    freeDrawItems,
    selectedId,
    setSelectedId,
    setEditingLabel,
    updateItem,
    isReadOnly,
  ])

  return hoverCursor
}
