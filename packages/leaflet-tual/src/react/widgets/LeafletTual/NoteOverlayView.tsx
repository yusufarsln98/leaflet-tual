'use client'

import { useRef } from 'react'
import type L from 'leaflet'
import type { Controller, NoteItem } from '../../../core/index.js'
import {
  geoToScreen,
  screenToGeo,
  resolveColor,
  resolveNoteColors,
  resolveSize,
  resolveWeight,
  resolveWidth,
} from '../../../core/index.js'
import { getItemZoomScale } from '../../../core/shared/zoom.js'

export interface NoteOverlayViewProps {
  map: L.Map
  note: NoteItem
  controller: Controller
  currentZoom?: number
  className?: string
}

export function NoteOverlayView({
  map,
  note,
  controller,
  className,
}: NoteOverlayViewProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)

  const isPinned = Boolean(note.at)
  let minX: number, maxX: number, minY: number, maxY: number, width: number, height: number
  if (note.from && note.to) {
    const p1 = geoToScreen(map, note.from)
    const p2 = geoToScreen(map, note.to)
    minX = Math.min(p1.x, p2.x); maxX = Math.max(p1.x, p2.x)
    minY = Math.min(p1.y, p2.y); maxY = Math.max(p1.y, p2.y)
    width = Math.max(36, maxX - minX); height = Math.max(28, maxY - minY)
  } else if (note.at) {
    const p = geoToScreen(map, note.at)
    width = note.width ?? 180
    height = note.height ?? 120
    minX = p.x - width / 2; maxX = minX + width
    minY = p.y - height / 2; maxY = minY + height
  } else {
    return null
  }

  const isSelected = controller.selection.includes(note.id)
  const colors = resolveNoteColors(
    note.style?.color ?? 'yellow',
    controller.scheme,
    note.style?.textColor,
    note.style?.fillColor,
  )
  const baseFontSize = resolveSize(note.style?.size ?? 'm', note.style?.fontSize)
  const zoomScale = getItemZoomScale(map, note)
  const fontSize = Math.max(8, Math.round(baseFontSize * zoomScale))
  const weight = resolveWeight(note.style?.weight)
  const fontStyle = note.style?.fontStyle === 'italic' ? 'italic' : 'normal'
  const radius = note.style?.radius ?? 8
  const borderDash = note.style?.dash ?? 'solid'
  const borderWidth =
    borderDash === 'none' ? 0 : resolveWidth(note.style?.width ?? 's')
  const borderColor = resolveColor(
    note.style?.strokeColor ?? note.style?.color ?? 'ink',
    controller.scheme,
  )

  const handleFocus = () => {
    map.dragging?.disable(); map.doubleClickZoom?.disable()
    controller.select(note.id)
  }

  const handleBlur = () => {
    if (!isDraggingRef.current && controller.tool === 'select') {
      map.dragging?.enable(); map.doubleClickZoom?.enable()
    }
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (controller.readOnly) return
    if ((e.target as HTMLElement).closest('textarea, .tual-note-handle')) return
    e.stopPropagation()
    controller.select(note.id)
    isDraggingRef.current = true
    map.dragging?.disable()

    const startClient = { clientX: e.clientX, clientY: e.clientY }
    const origCenterScr = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 }
    const origFrom = note.from ?? screenToGeo(map, { x: minX, y: minY })
    const origTo = note.to ?? screenToGeo(map, { x: maxX, y: maxY })
    const p1Scr = geoToScreen(map, origFrom)
    const p2Scr = geoToScreen(map, origTo)

    const getDragPatch = (dx: number, dy: number) => isPinned
      ? { at: screenToGeo(map, { x: origCenterScr.x + dx, y: origCenterScr.y + dy }) }
      : { from: screenToGeo(map, { x: p1Scr.x + dx, y: p1Scr.y + dy }), to: screenToGeo(map, { x: p2Scr.x + dx, y: p2Scr.y + dy }) }

    const onPointerMove = (ev: PointerEvent) =>
      controller.update(note.id, getDragPatch(ev.clientX - startClient.clientX, ev.clientY - startClient.clientY), false)

    const onPointerUp = (ev: PointerEvent) => {
      isDraggingRef.current = false
      controller.update(note.id, getDragPatch(ev.clientX - startClient.clientX, ev.clientY - startClient.clientY), true)
      if (controller.tool === 'select') map.dragging?.enable()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  const handleResizePointerDown = (corner: 'nw' | 'ne' | 'se' | 'sw', e: React.PointerEvent) => {
    if (controller.readOnly) return
    e.stopPropagation()
    e.preventDefault()
    map.dragging?.disable()

    const containerRect = map.getContainer().getBoundingClientRect()
    const oppScreen = {
      x: corner === 'nw' || corner === 'sw' ? maxX : minX,
      y: corner === 'nw' || corner === 'ne' ? maxY : minY,
    }

    const getResizePatch = (cur: { x: number; y: number }) => isPinned
      ? { width: Math.round(Math.max(60, Math.abs(cur.x - oppScreen.x))), height: Math.round(Math.max(40, Math.abs(cur.y - oppScreen.y))), at: screenToGeo(map, { x: (cur.x + oppScreen.x) / 2, y: (cur.y + oppScreen.y) / 2 }) }
      : { from: screenToGeo(map, { x: Math.min(cur.x, oppScreen.x), y: Math.min(cur.y, oppScreen.y) }), to: screenToGeo(map, { x: Math.max(cur.x, oppScreen.x), y: Math.max(cur.y, oppScreen.y) }) }

    const onPointerMove = (ev: PointerEvent) =>
      controller.update(note.id, getResizePatch({ x: ev.clientX - containerRect.left, y: ev.clientY - containerRect.top }), false)

    const onPointerUp = (ev: PointerEvent) => {
      controller.update(note.id, getResizePatch({ x: ev.clientX - containerRect.left, y: ev.clientY - containerRect.top }), true)
      if (controller.tool === 'select') map.dragging?.enable()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  return (
    <div
      ref={cardRef}
      className={`tual-note-card ${className ?? ''}`}
      data-selected={isSelected}
      style={{
        position: 'absolute',
        left: minX,
        top: minY,
        width,
        height,
        backgroundColor: colors.bg,
        color: colors.text,
        border: borderWidth > 0 ? `${borderWidth}px ${borderDash} ${borderColor}` : 'none',
        borderRadius: radius,
      }}
      onPointerDown={handlePointerDown}
    >
      <textarea
        className="tual-note-textarea"
        value={note.text}
        placeholder="Note text..."
        readOnly={controller.readOnly}
        style={{
          fontSize,
          color: colors.text,
          textAlign: note.style?.align ?? 'left',
          fontWeight: weight,
          fontStyle,
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onPointerDown={(e) => {
          e.stopPropagation()
          controller.select(note.id)
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onChange={(e) => controller.update(note.id, { text: e.target.value })}
      />

      {isSelected && !controller.readOnly && (
        <>
          <div className="tual-note-handle tual-note-handle-nw" onPointerDown={(e) => handleResizePointerDown('nw', e)} />
          <div className="tual-note-handle tual-note-handle-ne" onPointerDown={(e) => handleResizePointerDown('ne', e)} />
          <div className="tual-note-handle tual-note-handle-se" onPointerDown={(e) => handleResizePointerDown('se', e)} />
          <div className="tual-note-handle tual-note-handle-sw" onPointerDown={(e) => handleResizePointerDown('sw', e)} />
        </>
      )}
    </div>
  )
}
