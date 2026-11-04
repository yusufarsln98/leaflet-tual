import type L from 'leaflet'
import type { Controller } from '../../../core/types.js'
import type { ScreenPoint } from '../../types/index.js'
import type { NoteItem, Style } from '../../../entities/index.js'
import { screenToGeo } from '../../geometry/coordinates.js'
import { translateItem, worldDelta } from '../../geometry/translate.js'
import { getStyleShortcutPatch } from '../canvas/text-formatting.js'

export interface EditableTextTarget {
  id: string
  text?: string
  style?: Style
}

export type NoteResizeHandle = 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'e' | 'w'

export interface NoteBounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
  zoomScale: number
}

export function applyStyleShortcutKeyDown(
  e: KeyboardEvent | { metaKey: boolean; ctrlKey: boolean; key: string; preventDefault(): void },
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
  e: PointerEvent | MouseEvent | { clientX: number; clientY: number },
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

export function startNoteResize(
  handle: NoteResizeHandle,
  e: PointerEvent | MouseEvent | { button: number; clientX: number; clientY: number; stopPropagation(): void; preventDefault(): void },
  note: NoteItem,
  map: L.Map,
  controller: Controller,
  bounds: NoteBounds,
): void {
  if (controller.readOnly || e.button !== 0) return
  e.stopPropagation()
  e.preventDefault()
  map.dragging?.disable()

  const containerRect = map.getContainer().getBoundingClientRect()
  const scale = bounds.zoomScale || 1
  const minScreenW = 40 * scale
  const minScreenH = 40 * scale

  const getResizePatch = (cur: { x: number; y: number }) => {
    const left = handle.includes('w') ? Math.min(cur.x, bounds.maxX - minScreenW) : bounds.minX
    const right = handle.includes('e') ? Math.max(cur.x, bounds.minX + minScreenW) : bounds.maxX
    const top = handle.includes('n') ? Math.min(cur.y, bounds.maxY - minScreenH) : bounds.minY
    const bottom = handle.includes('s') ? Math.max(cur.y, bounds.minY + minScreenH) : bounds.maxY

    return {
      at: screenToGeo(map, { x: (left + right) / 2, y: (top + bottom) / 2 }),
      width: Math.max(40, Math.round((right - left) / scale)),
      height: Math.max(40, Math.round((bottom - top) / scale)),
    }
  }

  const onPointerMove = (ev: PointerEvent) =>
    controller.update(
      note.id,
      getResizePatch({ x: ev.clientX - containerRect.left, y: ev.clientY - containerRect.top }),
      false,
    )

  const onPointerUp = (ev: PointerEvent) => {
    controller.update(
      note.id,
      getResizePatch({ x: ev.clientX - containerRect.left, y: ev.clientY - containerRect.top }),
      true,
    )
    if (controller.tool === 'select') map.dragging?.enable()
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
  }

  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
}

export function handleTextEditorKeyDown(
  e: KeyboardEvent | { key: string; currentTarget: HTMLTextAreaElement; metaKey: boolean; ctrlKey: boolean; preventDefault(): void },
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
    const textarea = e.currentTarget as HTMLTextAreaElement | null
    if (!textarea) return
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
