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
  currentZoom: number
  collapseThreshold?: number
  className?: string
}

export function TextOverlayView({
  map,
  textItem,
  controller,
  currentZoom,
  collapseThreshold,
  className,
}: TextOverlayViewProps) {
  const { t } = useTranslation(controller)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isEditing, setIsEditing] = useState(controller.editingId === textItem.id)

  useEffect(() => {
    setIsEditing(controller.editingId === textItem.id)
  }, [controller.editingId, textItem.id])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handleDoubleClick = (event: MouseEvent) => {
      event.stopPropagation()
      if (isEditing || controller.readOnly) return
      event.preventDefault()
      setIsEditing(true)
      controller.edit(textItem.id)
    }
    el.addEventListener('dblclick', handleDoubleClick)
    return () => el.removeEventListener('dblclick', handleDoubleClick)
  }, [controller, isEditing, textItem.id])

  const pt = geoToScreen(map, textItem.at)

  if (collapseThreshold !== undefined && currentZoom < collapseThreshold) {
    return null
  }

  const color = resolveColor(textItem.style?.color ?? 'ink', 'light')
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
    controller.select(textItem.id)
    startOverlayDrag(e, textItem.id, pt, map, controller)
  }

  if (isEditing) {
    return (
      <div
        ref={containerRef}
        className={`tual-text-item ${className ?? ''}`}
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
        <textarea
          autoFocus
          value={textItem.text}
          placeholder={t('placeholderText')}
          rows={Math.max(1, textItem.text.split('\n').length)}
          style={{
            background: 'transparent',
            border: '1px dashed var(--tual-accent)',
            outline: 'none',
            color: 'inherit',
            fontSize: 'inherit',
            fontWeight: 'inherit',
            fontStyle: 'inherit',
            textDecoration,
            fontFamily: 'inherit',
            textAlign: align,
            resize: 'none',
            whiteSpace: 'pre-wrap',
          }}
          onFocus={() => map.dragging?.disable()}
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
    )
  }

  return (
    <div
      ref={containerRef}
      className={`tual-text-item ${className ?? ''}`}
      style={{
        left: pt.x,
        top: pt.y,
        color,
        fontSize,
        fontWeight: weight,
        fontStyle,
        textDecoration,
        textAlign: align,
        opacity: textItem.style?.opacity ?? 1,
        whiteSpace: 'pre-wrap',
        outline: controller.selection.includes(textItem.id)
          ? '1.5px solid var(--tual-accent)'
          : undefined,
        outlineOffset: 4,
      }}
      onPointerDown={handlePointerDown}
    >
      {textItem.text}
    </div>
  )
}

