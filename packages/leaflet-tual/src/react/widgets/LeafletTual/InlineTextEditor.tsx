'use client'

import { useEffect, useRef, useState } from 'react'
import type L from 'leaflet'
import type { Controller, TextItem } from '../../../core/index.js'
import { geoToScreen, resolveColor, resolveSize, resolveWeight } from '../../../core/index.js'
import { getItemZoomScale } from '../../../core/shared/zoom.js'

export interface InlineTextEditorProps {
  map: L.Map
  item: TextItem
  controller: Controller
  className?: string
}

export function InlineTextEditor({
  map,
  item,
  controller,
  className,
}: InlineTextEditorProps) {
  const [value, setValue] = useState(item.text ?? '')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const pt = geoToScreen(map, item.at)
  const scale = getItemZoomScale(map, item)
  const color = resolveColor(item.style?.color ?? 'ink', controller.scheme)
  const baseFontSize = resolveSize(item.style?.size ?? 'm', item.style?.fontSize)
  const fontSize = Math.max(10, Math.round(baseFontSize * scale))
  const weight = resolveWeight(item.style?.weight)
  const fontStyle = item.style?.fontStyle === 'italic' ? 'italic' : 'normal'
  const align = item.style?.align ?? 'left'

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
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleCommit(value)
      controller.edit(null)
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: pt.x,
        top: pt.y,
        transform:
          align === 'center'
            ? 'translateX(-50%)'
            : align === 'right'
              ? 'translateX(-100%)'
              : undefined,
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
          font: `${fontStyle} ${weight} ${fontSize}px system-ui, -apple-system, sans-serif`,
          color,
          textAlign: align as any,
          background: 'transparent',
          border: '1px dashed var(--tual-accent, #2563eb)',
          outline: 'none',
          resize: 'none',
          padding: 0,
          margin: 0,
          lineHeight: 1.25,
          minWidth: '60px',
        }}
      />
    </div>
  )
}

