import { useEffect, useRef, useState } from 'react'
import type React from 'react'
import type L from 'leaflet'
import type { NoteItem, ScreenPoint } from '../../types/index.js'
import { screenToGeo } from '../../shared/geo.js'
import { startNoteResize } from './note-resize-handler.js'

export interface UseNoteDragResizeOptions {
  item: NoteItem
  screenPos: ScreenPoint
  map: L.Map
  readOnly: boolean
  isCompact: boolean
  cardRef: React.RefObject<HTMLDivElement | null>
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  onSelect: (id: string) => void
  onUpdate: (id: string, patch: Partial<NoteItem>) => void
  onComplete?: () => void
}

export function useNoteDragResize({
  item,
  screenPos,
  map,
  readOnly,
  isCompact,
  cardRef,
  textareaRef,
  onSelect,
  onUpdate,
  onComplete,
}: UseNoteDragResizeOptions) {
  const [isDragging, setIsDragging] = useState(false)
  const dragOffsetRef = useRef({ dx: 0, dy: 0 })
  const didDragRef = useRef(false)
  const dragStartPosRef = useRef({ x: 0, y: 0 })
  const pendingCommitRef = useRef<{ timer: ReturnType<typeof setTimeout> | null }>({ timer: null })

  const commitResize = (nextW: number, nextH: number) => {
    if (pendingCommitRef.current.timer) {
      clearTimeout(pendingCommitRef.current.timer)
      pendingCommitRef.current.timer = null
    }
    map.dragging?.enable?.()
    if (cardRef.current) cardRef.current.style.transition = 'none'

    const patch: Partial<NoteItem> = {}
    if (nextW > 0 && Math.abs(nextW - (item.width ?? 230)) > 2) {
      patch.width = Math.max(160, Math.min(600, nextW))
    }
    if (nextH > 0 && Math.abs(nextH - (item.height ?? 0)) > 2) {
      patch.height = Math.max(50, Math.min(800, nextH))
    }
    if (Object.keys(patch).length > 0) {
      onUpdate(item.id, patch)
      onComplete?.()
    }
  }

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea || typeof ResizeObserver === 'undefined') return

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const measuredW = Math.round(entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width)
        const measuredH = Math.round(entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height)
        if (measuredW < 50 || measuredH < 20) continue

        const widthDiff = Math.abs(measuredW - (item.width ?? 230))
        const heightDiff = Math.abs(measuredH - (item.height ?? textarea.offsetHeight))
        if (widthDiff > 2 || heightDiff > 2) {
          if (cardRef.current && widthDiff > 2) {
            cardRef.current.style.transition = 'none'
            cardRef.current.style.width = `${measuredW}px`
          }
          map.dragging?.disable?.()
          if (pendingCommitRef.current.timer) clearTimeout(pendingCommitRef.current.timer)
          pendingCommitRef.current.timer = setTimeout(() => {
            commitResize(measuredW, measuredH)
          }, 150)
        }
      }
    })
    ro.observe(textarea)

    const handleWindowPointerUp = () => {
      if (pendingCommitRef.current.timer) {
        commitResize(textareaRef.current?.offsetWidth ?? 0, textareaRef.current?.offsetHeight ?? 0)
      }
    }
    window.addEventListener('pointerup', handleWindowPointerUp)
    window.addEventListener('mouseup', handleWindowPointerUp)

    return () => {
      ro.disconnect()
      window.removeEventListener('pointerup', handleWindowPointerUp)
      window.removeEventListener('mouseup', handleWindowPointerUp)
      if (pendingCommitRef.current.timer) {
        clearTimeout(pendingCommitRef.current.timer)
        pendingCommitRef.current.timer = null
      }
    }
  }, [item.id, item.width, item.height, map, onUpdate, onComplete])

  const handleResizePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (readOnly || isCompact) return
    startNoteResize({ e, item, map, cardRef, textareaRef, onSelect, onUpdate, onComplete })
  }

  const handleHeaderPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (readOnly || (e.target as HTMLElement).closest('button, input, textarea')) return
    e.stopPropagation()
    e.preventDefault()
    onSelect(item.id)
    setIsDragging(true)
    didDragRef.current = false
    dragStartPosRef.current = { x: e.clientX, y: e.clientY }

    const rect = map.getContainer().getBoundingClientRect()
    dragOffsetRef.current = {
      dx: e.clientX - rect.left - screenPos.x,
      dy: e.clientY - rect.top - screenPos.y,
    }
    map.dragging.disable()

    let dragRafId: number | null = null
    let latestGeo = item.position
    const isTestEnv = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test'

    const flushDrag = () => {
      dragRafId = null
      onUpdate(item.id, { position: latestGeo })
    }

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (Math.hypot(moveEvent.clientX - dragStartPosRef.current.x, moveEvent.clientY - dragStartPosRef.current.y) > 2) {
        didDragRef.current = true
      }
      const nextX = moveEvent.clientX - rect.left - dragOffsetRef.current.dx
      const nextY = moveEvent.clientY - rect.top - dragOffsetRef.current.dy
      if (cardRef.current) {
        cardRef.current.style.left = `${nextX}px`
        cardRef.current.style.top = `${nextY}px`
      }
      latestGeo = screenToGeo(map, { x: nextX, y: nextY })
      if (isTestEnv) flushDrag()
      else if (dragRafId === null) dragRafId = requestAnimationFrame(flushDrag)
    }

    const handlePointerUp = () => {
      if (dragRafId !== null) cancelAnimationFrame(dragRafId)
      setIsDragging(false)
      map.dragging.enable()
      if (didDragRef.current) {
        onUpdate(item.id, { position: latestGeo })
        onComplete?.()
      }
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)
  }

  const handleTextareaPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation()
    map.dragging.disable()
    const startW = textareaRef.current?.offsetWidth ?? 0
    const startH = textareaRef.current?.offsetHeight ?? 0
    if (cardRef.current) cardRef.current.style.transition = 'none'
    const handleUp = () => {
      const currentW = textareaRef.current?.offsetWidth ?? 0
      const currentH = textareaRef.current?.offsetHeight ?? 0
      if (Math.abs(currentW - startW) > 2 || Math.abs(currentH - startH) > 2) {
        commitResize(currentW, currentH)
      } else {
        map.dragging?.enable?.()
        if (cardRef.current) cardRef.current.style.transition = 'none'
      }
      window.removeEventListener('pointerup', handleUp)
      window.removeEventListener('mouseup', handleUp)
    }
    window.addEventListener('pointerup', handleUp, { once: true })
    window.addEventListener('mouseup', handleUp, { once: true })
  }

  return {
    isDragging,
    didDragRef,
    commitResize,
    handleHeaderPointerDown,
    handleResizePointerDown,
    handleTextareaPointerDown,
  }
}
