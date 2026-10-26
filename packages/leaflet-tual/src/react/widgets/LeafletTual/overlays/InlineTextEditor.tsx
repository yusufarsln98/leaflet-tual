'use client'

import { useEffect, useRef, useState } from 'react'
import type L from 'leaflet'
import type { Controller, TextItem } from '../../../../core/index.js'
import { geoToScreen, resolveColor, resolveSize, resolveWeight } from '../../../../core/index.js'
import { getItemZoomScale } from '../../../../core/shared/geometry/zoom.js'
import { useTranslation } from '../../../features/i18n/index.js'

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
  const { t } = useTranslation(controller)
  const [value, setValue] = useState(item.text ?? '')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const pt = geoToScreen(map, item.at)
  const scale = getItemZoomScale(map, item)
  const color = resolveColor(item.style?.color ?? 'ink', 'light')
  const baseFontSize = resolveSize(item.style?.size ?? 'm', item.style?.fontSize)
  const fontSize = Math.max(10, Math.round(baseFontSize * scale))
  const weight = resolveWeight(item.style?.weight)
  const fontStyle = item.style?.fontStyle === 'italic' ? 'italic' : 'normal'
  const isUnderline = Boolean(
    item.style?.underline || item.style?.textDecoration === 'underline',
  )
  const textDecoration = isUnderline ? 'underline' : 'none'
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
          return
        }
      }

      if (!e.shiftKey) {
        e.preventDefault()
        handleCommit(value)
        controller.edit(null)
      }
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
        placeholder={t('placeholderText')}
        onChange={(e) => {
          const val = e.target.value.replace(/(^|\n)([-*])\s/g, '$1• ')
          setValue(val)
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        style={{
          font: `${fontStyle} ${weight} ${fontSize}px system-ui, -apple-system, sans-serif`,
          color,
          textAlign: align,
          textDecoration,
          background: 'transparent',
          border: '1px dashed var(--tual-accent, #2563eb)',
          outline: 'none',
          resize: 'none',
          whiteSpace: 'pre-wrap',
          padding: 0,
          margin: 0,
          lineHeight: 1.25,
          minWidth: '60px',
        }}
      />
    </div>
  )
}

