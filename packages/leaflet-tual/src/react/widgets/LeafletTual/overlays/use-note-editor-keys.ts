'use client'

import type L from 'leaflet'
import type { Controller, ScreenPoint, Style } from '../../../../core/index.js'
import {
  getStyleShortcutPatch,
  screenToGeo,
  translateItem,
  worldDelta,
} from '../../../../core/index.js'

export interface EditableTextTarget {
  id: string
  text?: string
  style?: Style
}

export function applyStyleShortcutKeyDown(
  e: React.KeyboardEvent,
  item: { id: string; style?: Style },
  controller: Controller,
): boolean {
  if (!(e.metaKey || e.ctrlKey)) return false
  const patch = getStyleShortcutPatch(e.key, item.style)
  if (!patch) return false
  e.preventDefault()
  controller.update(item.id, { style: { ...item.style, ...patch } })
  return true
}

export function startOverlayDrag(
  e: React.PointerEvent,
  itemId: string,
  originScreen: ScreenPoint,
  map: L.Map,
  controller: Controller,
  onDragEnd?: () => void,
): void {
  const target = controller.items.find((i) => i.id === itemId)
  if (target?.locked) return
  map.dragging?.disable()
  const startX = e.clientX
  const startY = e.clientY
  const startGeo = screenToGeo(map, originScreen)
  const initialItems = controller.selected.filter((i) => !i.locked)
  const isMulti = initialItems.length > 1
  const getAt = (ev: PointerEvent) =>
    screenToGeo(map, {
      x: originScreen.x + ev.clientX - startX,
      y: originScreen.y + ev.clientY - startY,
    })

  const onPointerMove = (ev: PointerEvent) => {
    const nextGeo = getAt(ev)
    if (isMulti) {
      const delta = worldDelta(startGeo, nextGeo)
      controller.updateMany(
        initialItems.map((item) => ({ id: item.id, patch: translateItem(item, delta) })),
        false,
      )
    } else {
      controller.update(itemId, { at: nextGeo }, false)
    }
  }

  const onPointerUp = (ev: PointerEvent) => {
    onDragEnd?.()
    const nextGeo = getAt(ev)
    if (isMulti) {
      const delta = worldDelta(startGeo, nextGeo)
      controller.updateMany(
        initialItems.map((item) => ({ id: item.id, patch: translateItem(item, delta) })),
        true,
      )
    } else {
      controller.update(itemId, { at: nextGeo }, true)
    }
    if (controller.tool === 'select') map.dragging?.enable()
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
  }

  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
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

  if (applyStyleShortcutKeyDown(e, item, controller)) return

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
          const insertText = `\n${bulletMatch[1]}• `
          const nextVal = value.slice(0, selectionStart) + insertText + value.slice(selectionEnd)
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
