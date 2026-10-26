'use client'

import { useEffect, useRef, useState } from 'react'
import type L from 'leaflet'
import type { Controller, NoteItem } from '../../../core/index.js'
import { geoToScreen, resolveNoteColors, resolveSize, resolveWeight } from '../../../core/index.js'
import { getItemZoomScale } from '../../../core/shared/zoom.js'

export interface InlineNoteEditorProps {
  map: L.Map
  item: NoteItem
  controller: Controller
  className?: string
}

export function InlineNoteEditor({
  map,
  item,
  controller,
  className,
}: InlineNoteEditorProps) {
  const [value, setValue] = useState(item.text ?? '')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  let from = item.from
  let to = item.to
  if (!from || !to) {
    if (item.at) {
      const p = geoToScreen(map, item.at)
      const w = (item.width ?? 180) / 2
      const h = (item.height ?? 120) / 2
      from = map.containerPointToLatLng([p.x - w, p.y - h])
      to = map.containerPointToLatLng([p.x + w, p.y + h])
    }
  }

  const p1 = from ? geoToScreen(map, from) : { x: 0, y: 0 }
  const p2 = to ? geoToScreen(map, to) : { x: 180, y: 120 }
  const minX = Math.min(p1.x, p2.x)
  const minY = Math.min(p1.y, p2.y)
  const cardW = Math.max(20, Math.abs(p2.x - p1.x))
  const cardH = Math.max(20, Math.abs(p2.y - p1.y))

  const scale = getItemZoomScale(map, item)
  const noteColors = resolveNoteColors(
    item.style?.color ?? 'yellow',
    controller.scheme,
    item.style?.textColor,
    item.style?.fillColor,
  )
  const baseFontSize = resolveSize(item.style?.size ?? 'm', item.style?.fontSize)
  const fontSize = Math.max(10, Math.round(baseFontSize * scale))
  const weight = resolveWeight(item.style?.weight)
  const fontStyle = item.style?.fontStyle === 'italic' ? 'italic' : 'normal'
  const pad = Math.max(4, Math.round(10 * scale))

  useEffect(() => {
    setValue(item.text ?? '')
  }, [item.text])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }, [])

  const handleCommit = (val: string) => {
    controller.update(item.id, { text: val })
  }

  const handleBlur = () => {
    handleCommit(value)
    controller.edit(null)
    if (controller.tool === 'select') {
      map.dragging?.enable()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      setValue(item.text ?? '')
      controller.edit(null)
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: minX,
        top: minY,
        width: cardW,
        height: cardH,
        padding: `${pad}px`,
        boxSizing: 'border-box',
        zIndex: 100,
      }}
      className={className}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        style={{
          width: '100%',
          height: '100%',
          font: `${fontStyle} ${weight} ${fontSize}px system-ui, sans-serif`,
          color: noteColors.text,
          textAlign: (item.style?.align as any) ?? 'left',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          resize: 'none',
          padding: 0,
          margin: 0,
          lineHeight: 1.35,
        }}
      />
    </div>
  )
}

