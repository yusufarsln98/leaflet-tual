'use client'

import { useRef, useState } from 'react'
import type L from 'leaflet'
import type { Controller, GeoPoint, NoteItem } from '../../../../core/index.js'
import {
  geoToScreen,
  screenToGeo,
  resolveColor,
  resolveNoteColors,
  resolveSize,
  resolveWeight,
  resolveWidth,
} from '../../../../core/index.js'
import { getItemZoomScale } from '../../../../core/shared/geometry/zoom.js'
import { useTranslation } from '../../../features/i18n/index.js'
import { handleNoteKeyDown } from './use-note-editor-keys.js'
import { startNoteResize, type NoteResizeHandle } from './use-note-resize.js'

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
  const { t } = useTranslation(controller)
  const cardRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const [isFocused, setIsFocused] = useState(false)

  const zoomScale = getItemZoomScale(map, note)

  const legacy = note as unknown as { from?: GeoPoint; to?: GeoPoint }
  const center = note.at
    ? geoToScreen(map, note.at)
    : legacy.from && legacy.to
      ? {
          x: (geoToScreen(map, legacy.from).x + geoToScreen(map, legacy.to).x) / 2,
          y: (geoToScreen(map, legacy.from).y + geoToScreen(map, legacy.to).y) / 2,
        }
      : { x: 0, y: 0 }
  const baseWidth = Math.max(40, note.width ?? note.height ?? 180)
  const baseHeight = Math.max(40, note.height ?? note.width ?? 180)

  // Visual screen bounds for selection & resize calculations
  const screenWidth = baseWidth * zoomScale
  const screenHeight = baseHeight * zoomScale
  const minX = center.x - screenWidth / 2
  const maxX = center.x + screenWidth / 2
  const minY = center.y - screenHeight / 2
  const maxY = center.y + screenHeight / 2

  const isSelected = controller.selection.includes(note.id)
  const colors = resolveNoteColors(
    note.style?.color ?? 'yellow',
    'light',
    note.style?.textColor,
    note.style?.fillColor,
  )
  const baseFontSize = resolveSize(note.style?.size ?? 'm', note.style?.fontSize)
  const weight = resolveWeight(note.style?.weight)
  const fontStyle = note.style?.fontStyle === 'italic' ? 'italic' : 'normal'
  const isUnderline = Boolean(
    note.style?.underline || note.style?.textDecoration === 'underline',
  )
  const textDecoration = isUnderline ? 'underline' : 'none'
  const radius = note.style?.radius ?? 8
  const borderDash = note.style?.dash ?? 'solid'
  const borderWidth =
    borderDash === 'none' ? 0 : resolveWidth(note.style?.width ?? 's')
  const borderColor = note.style?.strokeColor
    ? resolveColor(note.style.strokeColor, 'light')
    : colors.border

  const handleFocus = () => {
    setIsFocused(true)
    map.dragging?.disable()
    map.doubleClickZoom?.disable()
    controller.select(note.id)
  }

  const handleBlur = () => {
    setIsFocused(false)
    if (!isDraggingRef.current && controller.tool === 'select') {
      map.dragging?.enable()
      map.doubleClickZoom?.enable()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    handleNoteKeyDown(e, note, controller, e.currentTarget.value)
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    const converted = val.replace(/(^|\n)([-*])\s/g, '$1• ')
    controller.update(note.id, { text: converted })
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (controller.readOnly || e.button !== 0) return
    if ((e.target as HTMLElement).closest('textarea, .tual-note-handle')) return
    e.stopPropagation()
    const wasSelected = controller.selection.includes(note.id)
    controller.select(note.id)
    if (!wasSelected) return
    isDraggingRef.current = true
    map.dragging?.disable()

    const startClient = { clientX: e.clientX, clientY: e.clientY }
    const origCenterScr = { ...center }

    const getDragPatch = (dx: number, dy: number) => {
      const newCenterScr = { x: origCenterScr.x + dx, y: origCenterScr.y + dy }
      return { at: screenToGeo(map, newCenterScr) }
    }

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

  const handleResizePointerDown = (handle: NoteResizeHandle, e: React.PointerEvent) => {
    startNoteResize(handle, e, note, map, controller, { minX, maxX, minY, maxY, zoomScale })
  }

  return (
    <div
      ref={cardRef}
      className={`tual-note-card ${className ?? ''}`}
      data-selected={isSelected}
      style={{
        position: 'absolute',
        left: center.x,
        top: center.y,
        width: baseWidth,
        height: baseHeight,
        transform: `translate(-50%, -50%) scale(${zoomScale})`,
        transformOrigin: 'center center',
        backgroundColor: colors.bg,
        color: colors.text,
        border: borderWidth > 0 ? `${borderWidth}px ${borderDash} ${borderColor}` : 'none',
        borderRadius: radius,
        opacity: note.style?.opacity ?? 1,
      }}
      onPointerDown={handlePointerDown}
    >
      <textarea
        className="tual-note-textarea"
        data-focused={isFocused}
        value={note.text}
        placeholder={t('placeholderNote')}
        readOnly={controller.readOnly}
        style={{
          fontSize: baseFontSize,
          color: colors.text,
          textAlign: note.style?.align ?? 'left',
          fontWeight: weight,
          fontStyle,
          textDecoration,
          overflowY: isFocused ? 'auto' : 'hidden',
          whiteSpace: 'pre-wrap',
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onPointerDown={(e) => {
          if (e.button !== 0) {
            e.preventDefault()
            return
          }
          e.stopPropagation()
          controller.select(note.id)
        }}
        onMouseDown={(e) => {
          if (e.button !== 0) {
            e.preventDefault()
            return
          }
          e.stopPropagation()
        }}
        onChange={handleChange}
      />

      {isSelected && !controller.readOnly && (
        <>
          <div className="tual-note-handle tual-note-handle-nw" onPointerDown={(e) => handleResizePointerDown('nw', e)} />
          <div className="tual-note-handle tual-note-handle-ne" onPointerDown={(e) => handleResizePointerDown('ne', e)} />
          <div className="tual-note-handle tual-note-handle-se" onPointerDown={(e) => handleResizePointerDown('se', e)} />
          <div className="tual-note-handle tual-note-handle-sw" onPointerDown={(e) => handleResizePointerDown('sw', e)} />
          <div className="tual-note-handle tual-note-handle-n" onPointerDown={(e) => handleResizePointerDown('n', e)} />
          <div className="tual-note-handle tual-note-handle-s" onPointerDown={(e) => handleResizePointerDown('s', e)} />
          <div className="tual-note-handle tual-note-handle-w" onPointerDown={(e) => handleResizePointerDown('w', e)} />
          <div className="tual-note-handle tual-note-handle-e" onPointerDown={(e) => handleResizePointerDown('e', e)} />
        </>
      )}
    </div>
  )
}
