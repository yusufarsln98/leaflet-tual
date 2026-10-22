import type React from 'react'
import type L from 'leaflet'
import type { NoteItem } from '../../types/index.js'

export interface StartNoteResizeOptions {
  e: React.PointerEvent<HTMLElement>
  item: NoteItem
  map: L.Map
  cardRef: React.RefObject<HTMLDivElement | null>
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  onSelect: (id: string) => void
  onUpdate: (id: string, patch: Partial<NoteItem>) => void
  onComplete?: () => void
}

export function startNoteResize(options: StartNoteResizeOptions) {
  const { e, item, map, cardRef, textareaRef, onSelect, onUpdate, onComplete } = options
  e.stopPropagation()
  e.preventDefault()
  onSelect(item.id)

  if (cardRef.current) {
    cardRef.current.style.transition = 'none'
    cardRef.current.setAttribute('data-resizing', 'true')
  }
  const target = e.currentTarget
  const pointerId = e.pointerId
  try { target?.setPointerCapture?.(pointerId) } catch { /* ignore */ }

  const startX = e.clientX
  const startY = e.clientY
  const startWidth = item.width ?? 230
  const startHeight = item.height ?? textareaRef.current?.offsetHeight ?? 62
  map.dragging.disable()

  let rafId: number | null = null
  let latestWidth = startWidth
  let latestHeight = startHeight
  let hasMovedY = false
  const isTestEnv = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test'

  const flushUpdate = () => {
    rafId = null
    const patch: Partial<NoteItem> = { width: latestWidth }
    if (hasMovedY || item.height !== undefined) patch.height = latestHeight
    onUpdate(item.id, patch)
  }

  const handlePointerMove = (moveEvent: PointerEvent) => {
    const dx = moveEvent.clientX - startX
    const dy = moveEvent.clientY - startY
    latestWidth = Math.max(160, Math.min(600, Math.round(startWidth + dx)))
    latestHeight = Math.max(50, Math.min(800, Math.round(startHeight + dy)))
    if (dy !== 0) hasMovedY = true
    if (cardRef.current) cardRef.current.style.width = `${latestWidth}px`
    if (textareaRef.current && (hasMovedY || item.height !== undefined)) {
      textareaRef.current.style.height = `${latestHeight}px`
    }
    if (isTestEnv) flushUpdate()
    else if (rafId === null) rafId = requestAnimationFrame(flushUpdate)
  }

  const handlePointerUp = () => {
    if (rafId !== null) cancelAnimationFrame(rafId)
    if (cardRef.current) {
      cardRef.current.style.transition = 'none'
      cardRef.current.removeAttribute('data-resizing')
    }
    map.dragging.enable()
    try { target?.releasePointerCapture?.(pointerId) } catch { /* ignore */ }
    const patch: Partial<NoteItem> = { width: latestWidth }
    if (hasMovedY || item.height !== undefined) patch.height = latestHeight
    onUpdate(item.id, patch)
    onComplete?.()
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerUp)
    window.removeEventListener('pointercancel', handlePointerUp)
  }

  window.addEventListener('pointermove', handlePointerMove)
  window.addEventListener('pointerup', handlePointerUp)
  window.addEventListener('pointercancel', handlePointerUp)
}

