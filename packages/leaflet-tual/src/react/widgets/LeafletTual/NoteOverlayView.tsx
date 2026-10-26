'use client'

import { useRef, useState } from 'react'
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
  const [isFocused, setIsFocused] = useState(false)

  const zoomScale = getItemZoomScale(map, note)

  let center: { x: number; y: number }
  let baseSide: number

  if (note.from && note.to) {
    const p1 = geoToScreen(map, note.from)
    const p2 = geoToScreen(map, note.to)
    center = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }
    const span = Math.max(Math.abs(p2.x - p1.x), Math.abs(p2.y - p1.y))
    baseSide = Math.max(40, note.width ?? Math.round(span / (zoomScale || 1)))
  } else if (note.at) {
    center = geoToScreen(map, note.at)
    baseSide = Math.max(40, note.width ?? note.height ?? 180)
  } else {
    return null
  }

  // Visual screen bounds for selection & resize calculations
  const screenSide = baseSide * zoomScale
  const minX = center.x - screenSide / 2
  const maxX = center.x + screenSide / 2
  const minY = center.y - screenSide / 2
  const maxY = center.y + screenSide / 2

  const isSelected = controller.selection.includes(note.id)
  const colors = resolveNoteColors(
    note.style?.color ?? 'yellow',
    controller.scheme,
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
    ? resolveColor(note.style.strokeColor, controller.scheme)
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
    if (controller.readOnly) return

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault()
      const isBold = note.style?.weight === 'bold' || note.style?.weight === 700
      controller.update(note.id, {
        style: { ...note.style, weight: isBold ? 'regular' : 'bold' },
      })
      return
    }

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault()
      const isItalic = note.style?.fontStyle === 'italic'
      controller.update(note.id, {
        style: { ...note.style, fontStyle: isItalic ? 'normal' : 'italic' },
      })
      return
    }

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'u') {
      e.preventDefault()
      controller.update(note.id, {
        style: {
          ...note.style,
          underline: !isUnderline,
          textDecoration: !isUnderline ? 'underline' : 'none',
        },
      })
      return
    }

    if (e.key === 'Enter') {
      const textarea = e.currentTarget
      const { selectionStart, selectionEnd, value } = textarea
      if (selectionStart === selectionEnd) {
        const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
        const lineEndIdx = value.indexOf('\n', selectionStart)
        const lineEnd = lineEndIdx === -1 ? value.length : lineEndIdx
        const currentLine = value.slice(lineStart, lineEnd)
        const bulletMatch = currentLine.match(/^(\s*)([•\-\*]\s*)/)

        if (bulletMatch) {
          e.preventDefault()
          if (
            currentLine.trim() === '•' ||
            currentLine.trim() === '-' ||
            currentLine.trim() === '*'
          ) {
            const nextVal = value.slice(0, lineStart) + value.slice(lineEnd)
            controller.update(note.id, { text: nextVal })
            setTimeout(() => {
              textarea.setSelectionRange(lineStart, lineStart)
            }, 0)
          } else {
            const indent = bulletMatch[1]
            const insertText = `\n${indent}• `
            const nextVal =
              value.slice(0, selectionStart) + insertText + value.slice(selectionEnd)
            controller.update(note.id, { text: nextVal })
            setTimeout(() => {
              const pos = selectionStart + insertText.length
              textarea.setSelectionRange(pos, pos)
            }, 0)
          }
        }
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    const converted = val.replace(/(^|\n)([-*])\s/g, '$1• ')
    controller.update(note.id, { text: converted })
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (controller.readOnly) return
    if ((e.target as HTMLElement).closest('textarea, .tual-note-handle')) return
    e.stopPropagation()
    controller.select(note.id)
    isDraggingRef.current = true
    map.dragging?.disable()

    const startClient = { clientX: e.clientX, clientY: e.clientY }
    const origCenterScr = { ...center }

    const getDragPatch = (dx: number, dy: number) => {
      const newCenterScr = { x: origCenterScr.x + dx, y: origCenterScr.y + dy }
      if (note.at) {
        return { at: screenToGeo(map, newCenterScr) }
      }
      const p1Scr = geoToScreen(map, note.from!)
      const p2Scr = geoToScreen(map, note.to!)
      return {
        from: screenToGeo(map, { x: p1Scr.x + dx, y: p1Scr.y + dy }),
        to: screenToGeo(map, { x: p2Scr.x + dx, y: p2Scr.y + dy }),
      }
    }

    const onPointerMove = (ev: PointerEvent) =>
      controller.update(
        note.id,
        getDragPatch(ev.clientX - startClient.clientX, ev.clientY - startClient.clientY),
        false,
      )

    const onPointerUp = (ev: PointerEvent) => {
      isDraggingRef.current = false
      controller.update(
        note.id,
        getDragPatch(ev.clientX - startClient.clientX, ev.clientY - startClient.clientY),
        true,
      )
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

    const getResizePatch = (cur: { x: number; y: number }) => {
      const dx = Math.abs(cur.x - oppScreen.x)
      const dy = Math.abs(cur.y - oppScreen.y)
      // Enforce 1:1 square ratio during resize
      const newScreenSide = Math.max(40, Math.max(dx, dy))
      const signX = corner === 'nw' || corner === 'sw' ? -1 : 1
      const signY = corner === 'nw' || corner === 'ne' ? -1 : 1
      const newCornerX = oppScreen.x + signX * newScreenSide
      const newCornerY = oppScreen.y + signY * newScreenSide

      const newCenterX = (oppScreen.x + newCornerX) / 2
      const newCenterY = (oppScreen.y + newCornerY) / 2
      const newBaseSide = Math.max(40, Math.round(newScreenSide / (zoomScale || 1)))

      if (note.at) {
        return {
          at: screenToGeo(map, { x: newCenterX, y: newCenterY }),
          width: newBaseSide,
          height: newBaseSide,
        }
      }

      const pMin = {
        x: Math.min(oppScreen.x, newCornerX),
        y: Math.min(oppScreen.y, newCornerY),
      }
      const pMax = {
        x: Math.max(oppScreen.x, newCornerX),
        y: Math.max(oppScreen.y, newCornerY),
      }
      return {
        from: screenToGeo(map, pMin),
        to: screenToGeo(map, pMax),
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

  return (
    <div
      ref={cardRef}
      className={`tual-note-card ${className ?? ''}`}
      data-selected={isSelected}
      style={{
        position: 'absolute',
        left: center.x,
        top: center.y,
        width: baseSide,
        height: baseSide,
        aspectRatio: '1 / 1',
        transform: `translate(-50%, -50%) scale(${zoomScale})`,
        transformOrigin: 'center center',
        backgroundColor: colors.bg,
        color: colors.text,
        border: borderWidth > 0 ? `${borderWidth}px ${borderDash} ${borderColor}` : 'none',
        borderRadius: radius,
      }}
      onPointerDown={handlePointerDown}
    >
      <textarea
        className="tual-note-textarea"
        data-focused={isFocused}
        value={note.text}
        placeholder="Note text..."
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
          e.stopPropagation()
          controller.select(note.id)
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onChange={handleChange}
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
