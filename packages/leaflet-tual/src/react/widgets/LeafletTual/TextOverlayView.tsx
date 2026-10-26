'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import type { Controller, TextItem } from '../../../core/index.js'
import {
  geoToScreen,
  screenToGeo,
  resolveColor,
  resolveSize,
  resolveWeight,
} from '../../../core/index.js'
import { getItemZoomScale } from '../../../core/shared/zoom.js'

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
  const containerRef = useRef<HTMLDivElement>(null)
  const [isEditing, setIsEditing] = useState(controller.editingId === textItem.id)
  const dragStartRef = useRef<{ clientX: number; clientY: number } | null>(null)

  useEffect(() => {
    setIsEditing(controller.editingId === textItem.id)
  }, [controller.editingId, textItem.id])

  // Native listener so the double-click never reaches Leaflet's map zoom.
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

  const color = resolveColor(textItem.style?.color ?? 'ink', controller.scheme)
  const baseFontSize = resolveSize(textItem.style?.size ?? 'm', textItem.style?.fontSize)
  const scale = getItemZoomScale(map, textItem)
  const fontSize = Math.max(8, Math.round(baseFontSize * scale))
  const weight = resolveWeight(textItem.style?.weight)
  const fontStyle = textItem.style?.fontStyle === 'italic' ? 'italic' : 'normal'
  const isUnderline = Boolean(
    textItem.style?.underline || textItem.style?.textDecoration === 'underline',
  )
  const textDecoration = isUnderline ? 'underline' : 'none'
  const align = textItem.style?.align ?? 'left'

  const handlePointerDown = (e: React.PointerEvent) => {
    if (controller.readOnly || isEditing) return
    e.stopPropagation()
    controller.select(textItem.id)
    map.dragging?.disable()

    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
    }

    let lastGeo = { ...textItem.at }

    const onPointerMove = (ev: PointerEvent) => {
      if (!dragStartRef.current) return
      const dx = ev.clientX - dragStartRef.current.clientX
      const dy = ev.clientY - dragStartRef.current.clientY
      const nextScreen = { x: pt.x + dx, y: pt.y + dy }
      lastGeo = screenToGeo(map, nextScreen)
      controller.update(textItem.id, { at: lastGeo }, false)
    }

    const onPointerUp = () => {
      dragStartRef.current = null
      controller.update(textItem.id, { at: lastGeo }, true)
      if (controller.tool === 'select') {
        map.dragging?.enable()
      }
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      setIsEditing(false)
      controller.edit(null)
      return
    }

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault()
      const isBold = textItem.style?.weight === 'bold' || textItem.style?.weight === 700
      controller.update(textItem.id, {
        style: { ...textItem.style, weight: isBold ? 'regular' : 'bold' },
      })
      return
    }

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault()
      const isItalic = textItem.style?.fontStyle === 'italic'
      controller.update(textItem.id, {
        style: { ...textItem.style, fontStyle: isItalic ? 'normal' : 'italic' },
      })
      return
    }

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'u') {
      e.preventDefault()
      controller.update(textItem.id, {
        style: {
          ...textItem.style,
          underline: !isUnderline,
          textDecoration: !isUnderline ? 'underline' : 'none',
        },
      })
      return
    }

    if (e.key === 'Enter' && !e.shiftKey) {
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
            controller.update(textItem.id, { text: nextVal })
            setTimeout(() => {
              textarea.setSelectionRange(lineStart, lineStart)
            }, 0)
          } else {
            const indent = bulletMatch[1]
            const insertText = `\n${indent}• `
            const nextVal =
              value.slice(0, selectionStart) + insertText + value.slice(selectionEnd)
            controller.update(textItem.id, { text: nextVal })
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
    controller.update(textItem.id, { text: converted })
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
          onFocus={() => {
            map.dragging?.disable()
          }}
          onChange={handleChange}
          onBlur={() => {
            setIsEditing(false)
            controller.edit(null)
            if (controller.tool === 'select') {
              map.dragging?.enable()
            }
          }}
          onKeyDown={handleKeyDown}
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
