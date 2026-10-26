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
  const isUnderline = Boolean(
    item.style?.underline || item.style?.textDecoration === 'underline',
  )
  const textDecoration = isUnderline ? 'underline' : 'none'
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      setValue(item.text ?? '')
      controller.edit(null)
      return
    }

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault()
      const isBold = item.style?.weight === 'bold' || item.style?.weight === 700
      controller.update(item.id, {
        style: { ...item.style, weight: isBold ? 'regular' : 'bold' },
      })
      return
    }

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault()
      const isItalic = item.style?.fontStyle === 'italic'
      controller.update(item.id, {
        style: { ...item.style, fontStyle: isItalic ? 'normal' : 'italic' },
      })
      return
    }

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'u') {
      e.preventDefault()
      controller.update(item.id, {
        style: {
          ...item.style,
          underline: !isUnderline,
          textDecoration: !isUnderline ? 'underline' : 'none',
        },
      })
      return
    }

    if (e.key === 'Enter') {
      const textarea = e.currentTarget
      const { selectionStart, selectionEnd } = textarea
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
            setValue(nextVal)
            handleCommit(nextVal)
            setTimeout(() => {
              textarea.setSelectionRange(lineStart, lineStart)
            }, 0)
          } else {
            const indent = bulletMatch[1]
            const insertText = `\n${indent}• `
            const nextVal =
              value.slice(0, selectionStart) + insertText + value.slice(selectionEnd)
            setValue(nextVal)
            handleCommit(nextVal)
            setTimeout(() => {
              const pos = selectionStart + insertText.length
              textarea.setSelectionRange(pos, pos)
            }, 0)
          }
        }
      }
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
        onChange={(e) => {
          const val = e.target.value.replace(/(^|\n)([-*])\s/g, '$1• ')
          setValue(val)
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        style={{
          width: '100%',
          height: '100%',
          font: `${fontStyle} ${weight} ${fontSize}px system-ui, sans-serif`,
          color: noteColors.text,
          textAlign: (item.style?.align as any) ?? 'left',
          textDecoration,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          resize: 'none',
          whiteSpace: 'pre-wrap',
          padding: 0,
          margin: 0,
          lineHeight: 1.35,
        }}
      />
    </div>
  )
}

