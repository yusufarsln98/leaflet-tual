'use client'

import { memo, useEffect, useRef, useState } from 'react'
import type L from 'leaflet'
import type { Controller, NoteItem } from '../../../../core/index.js'
import { formatBulletInput, geoToScreen, resolveItemStyle } from '../../../../core/index.js'
import { getItemZoomScale } from '../../../../shared/geometry/zoom.js'
import { useTranslation } from '../../../features/i18n/index.js'
import { useControllerStore } from '../../../features/use-controller-store.js'
import { useOverlayMapSync } from '../../../features/use-overlay-map-sync.js'
import { ResizeHandles, useLeafletDisableClick } from '../../../ui/index.js'
import { handleNoteKeyDown, startOverlayDrag } from './use-note-editor-keys.js'
import { startNoteResize } from './use-note-resize.js'

export interface NoteOverlayViewProps {
  map: L.Map
  note: NoteItem
  controller: Controller
  currentZoom?: number
  className?: string
  onContextMenu?: (e: React.MouseEvent) => void
}

export const NoteOverlayView = memo(function NoteOverlayView({
  map,
  note,
  controller,
  className,
  onContextMenu,
}: NoteOverlayViewProps) {
  const { t } = useTranslation(controller)
  const cardRef = useRef<HTMLDivElement>(null)
  useLeafletDisableClick(cardRef)
  useLeafletDisableClick(cardRef)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isDraggingRef = useRef(false)
  const [isFocused, setIsFocused] = useState(false)
  const isFocusedRef = useRef(isFocused)
  isFocusedRef.current = isFocused

  const isSelected = useControllerStore(controller, (s) => s.selection.includes(note.id))
  const isReadOnly = useControllerStore(controller, (s) => s.readOnly)

  const zoomScale = getItemZoomScale(map, note)
  const center = geoToScreen(map, note.at)
  const baseWidth = Math.max(40, note.width ?? note.height ?? 180)
  const baseHeight = Math.max(40, note.height ?? note.width ?? 180)

  const visual = resolveItemStyle(note)

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const handleWheel = (e: WheelEvent) => {
      // Scroll only when the text is focused
      if (!isFocusedRef.current) return

      const textarea = textareaRef.current
      if (!textarea) return

      const hasVerticalOverflow = textarea.scrollHeight > textarea.clientHeight + 1
      const hasHorizontalOverflow = textarea.scrollWidth > textarea.clientWidth + 1
      const hasOverflow = hasVerticalOverflow || hasHorizontalOverflow
      if (!hasOverflow) return

      // Stop wheel event from reaching Leaflet map container to prevent unwanted zoom
      e.stopPropagation()

      // If the event target is not the textarea directly (e.g. card border), update scroll manually
      if (e.target !== textarea) {
        const lineMultiplier =
          e.deltaMode === 1 ? 20 : e.deltaMode === 2 ? textarea.clientHeight : 1
        if (hasVerticalOverflow && e.deltaY) {
          textarea.scrollTop += e.deltaY * lineMultiplier
        }
        if (hasHorizontalOverflow && e.deltaX) {
          textarea.scrollLeft += e.deltaX * lineMultiplier
        }
      }
    }

    card.addEventListener('wheel', handleWheel, { passive: true })

    return () => {
      card.removeEventListener('wheel', handleWheel)
    }
  }, [])

  useOverlayMapSync(map, () => {
    const el = cardRef.current
    if (!el) return
    const scale = getItemZoomScale(map, note)
    const pt = geoToScreen(map, note.at)
    el.style.left = `${pt.x}px`
    el.style.top = `${pt.y}px`
    el.style.transform = `translate(-50%, -50%) scale(${scale})`
  })

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
    if (isReadOnly || e.button !== 0) return
    if ((e.target as HTMLElement).closest('textarea, .tual-note-handle')) return
    e.stopPropagation()
    const wasSelected = controller.selection.includes(note.id)
    if (!wasSelected) {
      controller.select(note.id)
      return
    }
    isDraggingRef.current = true
    const currentCenter = geoToScreen(map, note.at)
    startOverlayDrag(e, note.id, currentCenter, map, controller, () => {
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
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => {
        if (isReadOnly) return
        e.preventDefault()
        e.stopPropagation()
        if (!controller.selection.includes(note.id)) {
          controller.select(note.id)
        }
        onContextMenu?.(e)
      }}
    >
      <textarea
        ref={textareaRef}
        className="tual-note-textarea"
        data-focused={isFocused}
        value={note.text}
        placeholder={t('placeholderNote')}
        readOnly={isReadOnly || Boolean(note.locked)}
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
          if (e.button !== 0) return
          e.stopPropagation()
          controller.select(note.id)
        }}
        onMouseDown={(e) => {
          if (e.button !== 0) return
          e.stopPropagation()
        }}
        onChange={(e) => controller.update(note.id, { text: formatBulletInput(e.target.value) })}
      />

      {isSelected && !isReadOnly && !note.locked && (
        <ResizeHandles
          classNamePrefix="tual-note-handle"
          onResizeStart={(e, handle) => {
            const currentScale = getItemZoomScale(map, note)
            const currentCenter = geoToScreen(map, note.at)
            const w = baseWidth * currentScale
            const h = baseHeight * currentScale
            startNoteResize(handle, e, note, map, controller, {
              minX: currentCenter.x - w / 2,
              maxX: currentCenter.x + w / 2,
              minY: currentCenter.y - h / 2,
              maxY: currentCenter.y + h / 2,
              zoomScale: currentScale,
            })
          }}
        />
      )}
    </div>
  )
})
