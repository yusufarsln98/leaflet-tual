'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import type { Controller, TextItem } from '../../../../core/index.js'
import {
  formatBulletInput,
  geoToScreen,
  resolveColor,
  resolveSize,
  resolveWeight,
} from '../../../../core/index.js'
import { getItemZoomScale } from '../../../../core/shared/geometry/zoom.js'
import { useTranslation } from '../../../features/i18n/index.js'
import { handleTextEditorKeyDown, startOverlayDrag } from './use-note-editor-keys.js'

export interface TextOverlayViewProps {
  map: L.Map
  textItem: TextItem
  controller: Controller
  currentZoom?: number
  className?: string
}

export function TextOverlayView({
  map,
  textItem,
  controller,
  className,
}: TextOverlayViewProps) {
  const { t } = useTranslation(controller)
  const containerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isEditing, setIsEditing] = useState(controller.editingId === textItem.id)

  useEffect(() => {
    setIsEditing(controller.editingId === textItem.id)
  }, [controller.editingId, textItem.id])

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
    const el = containerRef.current
    if (!el) return
    const handleDoubleClick = (event: MouseEvent) => {
      event.stopPropagation()
      if (isEditing || controller.readOnly || textItem.locked) return
      event.preventDefault()
      setIsEditing(true)
      controller.edit(textItem.id)
    }
    el.addEventListener('dblclick', handleDoubleClick)
    return () => el.removeEventListener('dblclick', handleDoubleClick)
  }, [controller, isEditing, textItem.id])

  const pt = geoToScreen(map, textItem.at)

  const color = resolveColor(textItem.style?.color ?? 'ink')
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

  const handlePointerDown = (e: React.PointerEvent) => {
    if (controller.readOnly || isEditing || e.button !== 0) return
    e.stopPropagation()
    const wasSelected = controller.selection.includes(textItem.id)
    if (!wasSelected) {
      controller.select(textItem.id)
    }
    startOverlayDrag(e, textItem.id, pt, map, controller)
  }

  const isSelected = controller.selection.includes(textItem.id)
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
              color: 'inherit',
              fontSize: 'inherit',
              fontWeight: weight,
              fontStyle,
              textDecoration,
              fontFamily: 'inherit',
              textAlign: align,
            }}
            onFocus={(e) => {
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
        color: isEmpty ? 'var(--tual-text-muted, #9ca3af)' : color,
        fontSize,
        fontWeight: weight,
        fontStyle: isEmpty ? 'normal' : fontStyle,
        textDecoration: isEmpty ? 'none' : textDecoration,
        textAlign: align,
        opacity: textItem.style?.opacity ?? 1,
      }}
      onPointerDown={handlePointerDown}
      onContextMenu={() => {
        if (controller.readOnly) return
        if (!controller.selection.includes(textItem.id)) {
          controller.select(textItem.id)
        }
      }}
    >
      {textItem.text || placeholder}
    </div>
  )
}

