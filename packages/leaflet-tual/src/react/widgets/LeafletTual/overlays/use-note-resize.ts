'use client'

import type L from 'leaflet'
import type { Controller, NoteItem } from '../../../../core/index.js'
import { screenToGeo } from '../../../../core/index.js'

export type Corner = 'nw' | 'ne' | 'se' | 'sw'

export interface NoteBounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
  zoomScale: number
}

export function startNoteResize(
  corner: Corner,
  e: React.PointerEvent,
  note: NoteItem,
  map: L.Map,
  controller: Controller,
  bounds: NoteBounds,
): void {
  if (controller.readOnly) return
  e.stopPropagation()
  e.preventDefault()
  map.dragging?.disable()

  const containerRect = map.getContainer().getBoundingClientRect()
  const oppScreen = {
    x: corner === 'nw' || corner === 'sw' ? bounds.maxX : bounds.minX,
    y: corner === 'nw' || corner === 'ne' ? bounds.maxY : bounds.minY,
  }

  const getResizePatch = (cur: { x: number; y: number }) => {
    const dx = Math.abs(cur.x - oppScreen.x)
    const dy = Math.abs(cur.y - oppScreen.y)
    const newScreenSide = Math.max(40, Math.max(dx, dy))
    const signX = corner === 'nw' || corner === 'sw' ? -1 : 1
    const signY = corner === 'nw' || corner === 'ne' ? -1 : 1
    const newCornerX = oppScreen.x + signX * newScreenSide
    const newCornerY = oppScreen.y + signY * newScreenSide

    const newCenterX = (oppScreen.x + newCornerX) / 2
    const newCenterY = (oppScreen.y + newCornerY) / 2
    const newBaseSide = Math.max(40, Math.round(newScreenSide / (bounds.zoomScale || 1)))

    return {
      at: screenToGeo(map, { x: newCenterX, y: newCenterY }),
      width: newBaseSide,
      height: newBaseSide,
    }
  }

  const onPointerMove = (ev: PointerEvent) =>
    controller.update(
      note.id,
      getResizePatch({ x: ev.clientX - containerRect.left, y: ev.clientY - containerRect.top }),
      false,
    )

  const onPointerUp = (ev: PointerEvent) => {
    controller.update(
      note.id,
      getResizePatch({ x: ev.clientX - containerRect.left, y: ev.clientY - containerRect.top }),
      true,
    )
    if (controller.tool === 'select') map.dragging?.enable()
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
  }

  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
}
