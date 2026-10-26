'use client'

import { useEffect, useRef, useState } from 'react'
import type L from 'leaflet'
import type { ArrowItem, Controller, ShapeItem } from '../../../core/index.js'
import {
  defaultVia,
  geoToScreen,
  getQuadraticBezierPoint,
  resolveSize,
  resolveWeight,
} from '../../../core/index.js'
import { getShapeLabelY } from '../../../core/shared/shape-label.js'
import { getItemZoomScale } from '../../../core/shared/zoom.js'

export interface InlineShapeLabelEditorProps {
  map: L.Map
  shape?: ShapeItem
  item?: ShapeItem | ArrowItem
  controller: Controller
  className?: string
}

export function InlineShapeLabelEditor({
  map,
  shape,
  item,
  controller,
  className,
}: InlineShapeLabelEditorProps) {
  const target = item ?? shape!
  const [value, setValue] = useState(target.label ?? '')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  let midX = 0
  let midY = 0

  if (target.type === 'shape') {
    const p1 = geoToScreen(map, target.from)
    const p2 = geoToScreen(map, target.to)
    midX = (p1.x + p2.x) / 2
    const position = target.labelPosition ?? 'center'
    midY = getShapeLabelY(
      position,
      Math.min(p1.y, p2.y),
      Math.max(p1.y, p2.y),
      (p1.y + p2.y) / 2,
    )
  } else if (target.type === 'arrow') {
    const start = geoToScreen(map, target.from)
    const end = geoToScreen(map, target.to)
    if (target.kind === 'curved') {
      const viaGeo = target.via ?? defaultVia(target.from, target.to)
      const viaScreen = geoToScreen(map, viaGeo)
      const pt = getQuadraticBezierPoint(start, viaScreen, end, 0.5)
      midX = pt.x
      midY = pt.y
    } else {
      midX = (start.x + end.x) / 2
      midY = (start.y + end.y) / 2
    }
  }

  useEffect(() => {
    setValue(target.label ?? '')
  }, [target.label])

  useEffect(() => {
    if (controller.editingId === target.id) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [controller.editingId, target.id])

  const handleCommit = (newVal: string) => {
    const trimmed = newVal.trim()
    controller.update(target.id, { label: trimmed || undefined })
  }

  const handleFocus = () => {
    map.dragging?.disable()
    controller.edit(target.id)
  }

  const handleBlur = () => {
    handleCommit(value)
    controller.edit(null)
    if (controller.tool === 'select') {
      map.dragging?.enable()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCommit(value)
      inputRef.current?.blur()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setValue(target.label ?? '')
      inputRef.current?.blur()
    }
  }

  const isEditing = controller.editingId === target.id
  const scale = getItemZoomScale(map, target)
  const baseFontSize = target.style?.fontSize ?? (target.style?.size ? resolveSize(target.style.size) : 12)
  const fontSize = Math.max(9, Math.round(baseFontSize * scale))
  const weight = resolveWeight(target.style?.weight)
  const fontStyle = target.style?.fontStyle === 'italic' ? 'italic' : 'normal'

  return (
    <div
      ref={containerRef}
      className={`tual-inline-label-editor ${className ?? ''}`}
      style={{
        position: 'absolute',
        left: midX,
        top: midY,
        transform: 'translate(-50%, -50%)',
        zIndex: 100,
        pointerEvents: isEditing ? 'auto' : 'none',
      }}
      onPointerDown={(e) => {
        if (isEditing) e.stopPropagation()
      }}
      onMouseDown={(e) => {
        if (isEditing) e.stopPropagation()
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        placeholder="Add label..."
        className="tual-label-input"
        readOnly={!isEditing}
        style={{
          fontSize: `${fontSize}px`,
          fontWeight: weight,
          fontStyle,
        }}
        onFocus={handleFocus}
        onChange={(e) => {
          setValue(e.target.value)
          handleCommit(e.target.value)
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
    </div>
  )
}
