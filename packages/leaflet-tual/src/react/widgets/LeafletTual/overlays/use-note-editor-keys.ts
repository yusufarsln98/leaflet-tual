'use client'

import type { Controller, Style } from '../../../../core/index.js'

export interface EditableTextTarget {
  id: string
  text?: string
  style?: Style
}

export function handleTextEditorKeyDown(
  e: React.KeyboardEvent<HTMLTextAreaElement>,
  item: EditableTextTarget,
  controller: Controller,
  value: string,
  onCancel?: () => void,
): void {
  if (controller.readOnly) return

  if (e.key === 'Escape') {
    e.preventDefault()
    onCancel?.()
    controller.edit(null)
    return
  }

  const isMeta = e.metaKey || e.ctrlKey
  const key = e.key.toLowerCase()

  if (isMeta && key === 'b') {
    e.preventDefault()
    const isBold = item.style?.weight === 'bold' || item.style?.weight === 700
    controller.update(item.id, {
      style: { ...item.style, weight: isBold ? 'regular' : 'bold' },
    })
    return
  }

  if (isMeta && key === 'i') {
    e.preventDefault()
    const isItalic = item.style?.fontStyle === 'italic'
    controller.update(item.id, {
      style: { ...item.style, fontStyle: isItalic ? 'normal' : 'italic' },
    })
    return
  }

  if (isMeta && key === 'u') {
    e.preventDefault()
    const isUnderline = Boolean(
      item.style?.underline || item.style?.textDecoration === 'underline',
    )
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
        const trimmed = currentLine.trim()
        if (trimmed === '•' || trimmed === '-' || trimmed === '*') {
          const nextVal = value.slice(0, lineStart) + value.slice(lineEnd)
          controller.update(item.id, { text: nextVal })
          setTimeout(() => textarea.setSelectionRange(lineStart, lineStart), 0)
        } else {
          const indent = bulletMatch[1]
          const insertText = `\n${indent}• `
          const nextVal =
            value.slice(0, selectionStart) + insertText + value.slice(selectionEnd)
          controller.update(item.id, { text: nextVal })
          setTimeout(() => {
            const pos = selectionStart + insertText.length
            textarea.setSelectionRange(pos, pos)
          }, 0)
        }
      }
    }
  }
}

export const handleNoteKeyDown = handleTextEditorKeyDown
