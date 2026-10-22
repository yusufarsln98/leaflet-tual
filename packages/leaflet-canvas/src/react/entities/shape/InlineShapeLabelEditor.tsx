'use client'

import { useEffect, useRef, useState } from 'react'
import type L from 'leaflet'
import type { CanvasLabels, ShapeItem } from '../../types/index.js'
import { projectShape } from '../../../core/entities/shape/render-shape.js'

export interface InlineShapeLabelEditorProps {
  shape: ShapeItem
  map: L.Map
  labels?: CanvasLabels
  onUpdate: (id: string, patch: Partial<ShapeItem>) => void
  onClose: () => void
}

export function InlineShapeLabelEditor({
  shape,
  map,
  labels,
  onUpdate,
  onClose,
}: InlineShapeLabelEditorProps) {
  const [text, setText] = useState(shape.label ?? '')
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const projected = projectShape(map, shape)
  const midX = Math.round(projected.cx)
  const midY = Math.round(
    shape.shape === 'actor' ? projected.maxY + 14 : projected.cy,
  )

  return (
    <div
      data-rlc-inline-shape-label
      style={{
        position: 'absolute',
        left: `${midX}px`,
        top: `${midY}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        pointerEvents: 'auto',
      }}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <input
        ref={inputRef}
        type="text"
        data-rlc-shape-label-input={shape.id}
        data-testid="inline-shape-label-input"
        data-label-mode="true"
        placeholder={labels?.shapeLabelPlaceholder ?? 'Shape label...'}
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          onUpdate(shape.id, { label: e.target.value })
        }}
        onBlur={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === 'Escape') {
            e.preventDefault()
            onClose()
          }
        }}
        style={{
          minWidth: '100px',
          padding: '2px 6px',
          borderRadius: '4px',
          border: '1px solid #2563eb',
          backgroundColor: '#ffffff',
          color: '#000000',
          fontSize: '12px',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
          outline: 'none',
        }}
      />
    </div>
  )
}
