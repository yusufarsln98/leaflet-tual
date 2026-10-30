'use client'

import { useRef, useState } from 'react'
import type L from 'leaflet'
import type { Controller, NoteItem } from '../../../../core/index.js'
import { formatBulletInput, geoToScreen, resolveItemStyle } from '../../../../core/index.js'
import { getItemZoomScale } from '../../../../core/shared/geometry/zoom.js'
import { useTranslation } from '../../../features/i18n/index.js'
import { ResizeHandles } from '../../../ui/index.js'
import { handleNoteKeyDown, startOverlayDrag } from './use-note-editor-keys.js'
import { startNoteResize } from './use-note-resize.js'

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
  const center = geoToScreen(map, note.at)
  const baseWidth = Math.max(40, note.width ?? note.height ?? 180)
  const baseHeight = Math.max(40, note.height ?? note.width ?? 180)

  const screenWidth = baseWidth * zoomScale
  const screenHeight = baseHeight * zoomScale
  const minX = center.x - screenWidth / 2
  const maxX = center.x + screenWidth / 2
  const minY = center.y - screenHeight / 2
  const maxY = center.y + screenHeight / 2

  const isSelected = controller.selection.includes(note.id)
  const visual = resolveItemStyle(note)

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

  const handlePointerDown = (e: React.PointerEvent) => {
    if (controller.readOnly || e.button !== 0) return
    if ((e.target as HTMLElement).closest('textarea, .tual-note-handle')) return
    e.stopPropagation()
    const wasSelected = controller.selection.includes(note.id)
    controller.select(note.id)
    if (!wasSelected) return
    isDraggingRef.current = true
    startOverlayDrag(e, note.id, center, map, controller, () => {
      isDraggingRef.current = false
    })
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
        backgroundColor: visual.backgroundColor,
        color: visual.text.color,
        border:
          visual.strokeWidth > 0
            ? `${visual.strokeWidth}px ${visual.dash} ${visual.strokeColor}`
            : 'none',
        borderRadius: visual.radius,
        opacity: visual.opacity,
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
          fontSize: visual.text.fontSize,
          color: visual.text.color,
          textAlign: visual.text.align,
          fontWeight: visual.text.fontWeight,
          fontStyle: visual.text.fontStyle,
          textDecoration: visual.text.textDecoration,
          overflowY: isFocused ? 'auto' : 'hidden',
          whiteSpace: 'pre-wrap',
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={(e) => handleNoteKeyDown(e, note, controller, e.currentTarget.value)}
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
        onChange={(e) => controller.update(note.id, { text: formatBulletInput(e.target.value) })}
      />

      {isSelected && !controller.readOnly && (
        <ResizeHandles
          classNamePrefix="tual-note-handle"
          onResizeStart={(e, handle) =>
            startNoteResize(handle, e, note, map, controller, { minX, maxX, minY, maxY, zoomScale })
          }
        />
      )}
    </div>
  )
}

