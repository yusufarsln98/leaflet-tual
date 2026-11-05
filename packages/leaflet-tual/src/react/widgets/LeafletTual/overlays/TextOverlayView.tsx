'use client'

import { memo, useEffect, useRef, useState } from 'react'
import type L from 'leaflet'
import type { Controller, TextItem } from '../../../../core/index.js'
import {
  DEFAULT_PALETTE,
  formatBulletInput,
  geoToScreen,
  resolveColor,
  resolveSize,
  resolveWeight,
} from '../../../../core/index.js'
import { getItemZoomScale } from '../../../../shared/geometry/zoom.js'
import { useTranslation } from '../../../features/i18n/index.js'
import { useControllerStore } from '../../../features/use-controller-store.js'
import { useLeafletDisableClick } from '../../../ui/index.js'
import { useOverlayMapSync } from '../../../features/use-overlay-map-sync.js'
import { handleTextEditorKeyDown, startOverlayDrag } from './use-note-editor-keys.js'

export interface TextOverlayViewProps {
  map: L.Map
  textItem: TextItem
  controller: Controller
  currentZoom?: number
  className?: string
  onContextMenu?: (e: React.MouseEvent) => void
}

export const TextOverlayView = memo(function TextOverlayView({
  map,
  textItem,
  controller,
  className,
  onContextMenu,
}: TextOverlayViewProps) {
  const { t } = useTranslation(controller)
  const containerRef = useRef<HTMLDivElement>(null)
  useLeafletDisableClick(containerRef)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isSelected = useControllerStore(controller, (s) => s.selection.includes(textItem.id))
  const isReadOnly = useControllerStore(controller, (s) => s.readOnly)
  const isEditingStore = useControllerStore(controller, (s) => s.editingId === textItem.id)

  const [isEditing, setIsEditing] = useState(isEditingStore)

  useEffect(() => {
    setIsEditing(isEditingStore)
  }, [isEditingStore])

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const el = textareaRef.current
      el.focus()
      el.select()
      const frame = requestAnimationFrame(() => {
        el.select()
      })
      return () => cancelAnimationFrame(frame)
    }
  }, [isEditing])

  useEffect(() => {
    if (!isReadOnly) return
    const el = textareaRef.current
    if (el && document.activeElement === el) {
      el.blur()
      map.dragging?.enable()
      map.doubleClickZoom?.enable()
    }
  }, [isReadOnly, map])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handleDoubleClick = (event: MouseEvent) => {
      event.stopPropagation()
      if (isEditing || isReadOnly || textItem.locked) return
      event.preventDefault()
      setIsEditing(true)
      controller.edit(textItem.id)
    }
    el.addEventListener('dblclick', handleDoubleClick)
    return () => el.removeEventListener('dblclick', handleDoubleClick)
  }, [controller, isEditing, isReadOnly, textItem.id, textItem.locked])

  const pt = geoToScreen(map, textItem.at)

  const color = resolveColor(textItem.style?.color ?? DEFAULT_PALETTE.ink)
  const baseFontSize = resolveSize(textItem.style?.size ?? 'm', textItem.style?.fontSize)
  const scale = getItemZoomScale(map, textItem)
  const fontSize = Math.max(8, Math.round(baseFontSize * scale))
  const weight = resolveWeight(textItem.style?.weight)
  const fontStyle = textItem.style?.fontStyle === 'italic' ? 'italic' : 'normal'
  const textDecoration =
    textItem.style?.underline || textItem.style?.textDecoration === 'underline'
      ? 'underline'
      : 'none'
  const align = textItem.style?.align ?? 'left'

  useOverlayMapSync(map, () => {
    const el = containerRef.current
    if (!el) return
    const freshPt = geoToScreen(map, textItem.at)
    const currentScale = getItemZoomScale(map, textItem)
    const fs = Math.max(8, Math.round(baseFontSize * currentScale))
    el.style.left = `${freshPt.x}px`
    el.style.top = `${freshPt.y}px`
    el.style.fontSize = `${fs}px`
  })

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isReadOnly || isEditing || e.button !== 0) return
    e.stopPropagation()
    const wasSelected = controller.selection.includes(textItem.id)
    if (!wasSelected) {
      controller.select(textItem.id)
    }
    const freshPt = geoToScreen(map, textItem.at)
    startOverlayDrag(e, textItem.id, freshPt, map, controller)
  }

  const isEmpty = !textItem.text || textItem.text.trim() === ''
  const placeholder = t('placeholderText', undefined, 'Double-click to type')

  if (isEditing) {
    return (
      <div
        ref={containerRef}
        className={`tual-text-item tual-text-item-editing ${className ?? ''}`}
        style={{
          left: pt.x,
          top: pt.y,
          color,
          fontSize,
          fontWeight: weight,
          fontStyle,
          textDecoration,
          textAlign: align,
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="tual-text-editor-wrapper">
          <span
            aria-hidden="true"
            className="tual-text-editor-sizer"
            style={{
              fontWeight: weight,
              fontStyle,
              textDecoration,
              textAlign: align,
            }}
          >
            {(textItem.text || placeholder) + ' '}
          </span>
          <textarea
            ref={textareaRef}
            autoFocus
            value={textItem.text}
            placeholder={placeholder}
            rows={1}
            className="tual-text-editor-input"
            style={{
              color: DEFAULT_PALETTE.ink,
              backgroundColor: '#FFFFFF',
              fontSize: 'inherit',
              fontWeight: weight,
              fontStyle,
              textDecoration,
              fontFamily: 'inherit',
              textAlign: align,
            }}
            onFocus={(e) => {
              if (isReadOnly) return
              map.dragging?.disable()
              e.currentTarget.select()
            }}
            onChange={(e) =>
              controller.update(textItem.id, { text: formatBulletInput(e.target.value) })
            }
            onBlur={() => {
              setIsEditing(false)
              controller.edit(null)
              if (controller.tool === 'select') map.dragging?.enable()
            }}
            onKeyDown={(e) =>
              handleTextEditorKeyDown(e, textItem, controller, e.currentTarget.value, () =>
                setIsEditing(false),
              )
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`tual-text-item ${className ?? ''}`}
      data-selected={isSelected}
      data-empty={isEmpty}
      style={{
        left: pt.x,
        top: pt.y,
        color: isEmpty ? 'var(--tual-fg-muted, #555555)' : color,
        fontSize,
        fontWeight: weight,
        fontStyle: isEmpty ? 'normal' : fontStyle,
        textDecoration: isEmpty ? 'none' : textDecoration,
        textAlign: align,
        opacity: textItem.style?.opacity ?? 1,
      }}
      onPointerDown={handlePointerDown}
      onContextMenu={(e) => {
        if (isReadOnly) return
        e.preventDefault()
        e.stopPropagation()
        if (!controller.selection.includes(textItem.id)) {
          controller.select(textItem.id)
        }
        onContextMenu?.(e)
      }}
    >
      {textItem.text || placeholder}
    </div>
  )
})
