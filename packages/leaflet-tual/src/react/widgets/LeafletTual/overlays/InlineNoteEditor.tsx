'use client'

import { useEffect, useRef, useState } from 'react'
import type L from 'leaflet'
import type { Controller, NoteItem } from '../../../../core/index.js'
import { geoToScreen, resolveNoteColors, resolveSize, resolveWeight } from '../../../../core/index.js'
import { getItemZoomScale } from '../../../../core/shared/geometry/zoom.js'
import { useTranslation } from '../../../features/i18n/index.js'
import { handleNoteKeyDown } from './use-note-editor-keys.js'

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
  const { t } = useTranslation(controller)
  const [value, setValue] = useState(item.text ?? '')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const center = item.at ? geoToScreen(map, item.at) : { x: 0, y: 0 }
  const scale = getItemZoomScale(map, item)
  const cardW = Math.max(20, (item.width ?? 180) * scale)
  const cardH = Math.max(20, (item.height ?? 120) * scale)
  const minX = center.x - cardW / 2
  const minY = center.y - cardH / 2

  const noteColors = resolveNoteColors(
    item.style?.color ?? 'yellow',
    'light',
    item.style?.textColor,
    item.style?.fillColor,
  )
  const baseFontSize = resolveSize(item.style?.size ?? 'm', item.style?.fontSize)
  const fontSize = Math.max(10, Math.round(baseFontSize * scale))
  const weight = resolveWeight(item.style?.weight)
  const fontStyle = item.style?.fontStyle === 'italic' ? 'italic' : 'normal'
  const isUnderline = Boolean(item.style?.underline || item.style?.textDecoration === 'underline')
  const textDecoration = isUnderline ? 'underline' : 'none'
  const pad = Math.max(4, Math.round(10 * scale))

  useEffect(() => {
    setValue(item.text ?? '')
  }, [item.text])

  useEffect(() => {
    textareaRef.current?.focus()
    textareaRef.current?.select()
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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    const converted = val.replace(/(^|\n)([-*])\s/g, '$1• ')
    setValue(converted)
    handleCommit(converted)
  }

  return (
    <div
      className={`tual-inline-note-editor ${className ?? ''}`}
      style={{
        position: 'absolute',
        left: minX,
        top: minY,
        width: cardW,
        height: cardH,
        zIndex: 1000,
        backgroundColor: noteColors.bg,
        border: `1px solid ${noteColors.border}`,
        borderRadius: item.style?.radius ?? 8,
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
      }}
      onPointerDown={(e) => {
        e.stopPropagation()
        map.dragging?.disable()
      }}
      onMouseDown={(e) => {
        e.stopPropagation()
        map.dragging?.disable()
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <textarea
        ref={textareaRef}
        value={value}
        placeholder={t('placeholderNote')}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={(e) => handleNoteKeyDown(e, item, controller, value, () => setValue(item.text))}
        style={{
          width: '100%',
          height: '100%',
          resize: 'none',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          color: noteColors.text,
          fontSize,
          fontWeight: weight,
          fontStyle,
          textDecoration,
          padding: pad,
          fontFamily: 'inherit',
          lineHeight: 1.4,
          boxSizing: 'border-box',
        }}
      />
    </div>
  )
}
