'use client'

import type L from 'leaflet'
import type { Controller, NoteItem } from '../../../../core/index.js'
import { screenToGeo } from '../../../../core/index.js'

export type NoteResizeHandle = 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'e' | 'w'
export type Corner = NoteResizeHandle

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
    let left = bounds.minX
    let right = bounds.maxX
    let top = bounds.minY
    let bottom = bounds.maxY

    if (handle === 'nw' || handle === 'w' || handle === 'sw') {
      left = Math.min(cur.x, bounds.maxX - minScreenW)
    }
    if (handle === 'ne' || handle === 'e' || handle === 'se') {
      right = Math.max(cur.x, bounds.minX + minScreenW)
    }
    if (handle === 'nw' || handle === 'n' || handle === 'ne') {
      top = Math.min(cur.y, bounds.maxY - minScreenH)
    }
    if (handle === 'sw' || handle === 's' || handle === 'se') {
      bottom = Math.max(cur.y, bounds.minY + minScreenH)
    }

    const newCenterX = (left + right) / 2
    const newCenterY = (top + bottom) / 2
    const newBaseWidth = Math.max(40, Math.round((right - left) / scale))
    const newBaseHeight = Math.max(40, Math.round((bottom - top) / scale))

    return {
      at: screenToGeo(map, { x: newCenterX, y: newCenterY }),
      width: newBaseWidth,
      height: newBaseHeight,
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

