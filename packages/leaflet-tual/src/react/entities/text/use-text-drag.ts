import { useRef, useState } from 'react'
import type React from 'react'
import type L from 'leaflet'
import type { ScreenPoint, TextItem } from '../../types/index.js'
import { screenToGeo } from '../../shared/geo.js'

export interface UseTextDragOptions {
  item: TextItem
  screenPos: ScreenPoint
  map: L.Map
  readOnly: boolean
  isEditing: boolean
  onSelect: (id: string) => void
  onUpdate: (id: string, patch: Partial<TextItem>) => void
}

export function useTextDrag({
  item,
  screenPos,
  map,
  readOnly,
  isEditing,
  onSelect,
  onUpdate,
}: UseTextDragOptions) {
  const [isDragging, setIsDragging] = useState(false)
  const dragOffsetRef = useRef({ dx: 0, dy: 0 })
  const didDragRef = useRef(false)
  const dragStartPosRef = useRef({ x: 0, y: 0 })

  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (readOnly || isEditing || (e.target as HTMLElement).closest('button, textarea, input')) {
      return
    }
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

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (Math.hypot(moveEvent.clientX - dragStartPosRef.current.x, moveEvent.clientY - dragStartPosRef.current.y) > 2) {
        didDragRef.current = true
      }
      const nextX = moveEvent.clientX - rect.left - dragOffsetRef.current.dx
      const nextY = moveEvent.clientY - rect.top - dragOffsetRef.current.dy
      onUpdate(item.id, { position: screenToGeo(map, { x: nextX, y: nextY }) })
    }

    const handlePointerUp = () => {
      setIsDragging(false)
      map.dragging.enable()
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  return { isDragging, didDragRef, handlePointerDown }
}

