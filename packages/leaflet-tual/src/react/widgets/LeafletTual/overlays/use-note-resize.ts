'use client'

import type L from 'leaflet'
import type { Controller, NoteItem } from '../../../../core/index.js'
import { screenToGeo } from '../../../../core/index.js'

export type NoteResizeHandle = 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'e' | 'w'

export interface NoteBounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
  zoomScale: number
}

export function startNoteResize(
  handle: NoteResizeHandle,
  e: React.PointerEvent,
  note: NoteItem,
  map: L.Map,
  controller: Controller,
  bounds: NoteBounds,
): void {
  if (controller.readOnly || e.button !== 0) return
  e.stopPropagation()
  e.preventDefault()
  map.dragging?.disable()

  const containerRect = map.getContainer().getBoundingClientRect()
  const scale = bounds.zoomScale || 1
  const minScreenW = 40 * scale
  const minScreenH = 40 * scale

  const getResizePatch = (cur: { x: number; y: number }) => {
    const left = handle.includes('w') ? Math.min(cur.x, bounds.maxX - minScreenW) : bounds.minX
    const right = handle.includes('e') ? Math.max(cur.x, bounds.minX + minScreenW) : bounds.maxX
    const top = handle.includes('n') ? Math.min(cur.y, bounds.maxY - minScreenH) : bounds.minY
    const bottom = handle.includes('s') ? Math.max(cur.y, bounds.minY + minScreenH) : bounds.maxY

    return {
      at: screenToGeo(map, { x: (left + right) / 2, y: (top + bottom) / 2 }),
      width: Math.max(40, Math.round((right - left) / scale)),
      height: Math.max(40, Math.round((bottom - top) / scale)),
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

