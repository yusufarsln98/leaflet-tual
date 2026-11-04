'use client'

import { memo, useEffect, useRef, useState } from 'react'
import type L from 'leaflet'
import type { ArrowItem, Controller, ShapeItem } from '../../../../core/index.js'
import {
  resolveColor,
  resolveItemStyle,
  resolveSize,
  resolveWeight,
} from '../../../../core/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import { getLabelAnchor } from '../../../../shared/drawing/canvas/shape-label.js'
import { getItemZoomScale } from '../../../../shared/geometry/zoom.js'
import { useOverlayMapSync } from '../../../features/use-overlay-map-sync.js'
import { useLeafletDomGuard } from '../../../ui/index.js'
import { applyStyleShortcutKeyDown } from './use-note-editor-keys.js'

export interface InlineShapeLabelEditorProps {
  map: L.Map
  item: ShapeItem | ArrowItem
  controller: Controller
  className?: string
}

export const InlineShapeLabelEditor = memo(function InlineShapeLabelEditor({
  map,
  item: target,
  controller,
  className,
}: InlineShapeLabelEditorProps) {
  const { t } = useTranslation(controller)
  const [value, setValue] = useState(target.label ?? '')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useLeafletDomGuard(containerRef)

  const { x: midX, y: midY } = getLabelAnchor(map, target)

  useOverlayMapSync(map, () => {
    const el = containerRef.current
    if (!el) return
    const anchor = getLabelAnchor(map, target)
    el.style.left = `${anchor.x}px`
    el.style.top = `${anchor.y}px`
  })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const anchor = getLabelAnchor(map, target)
    el.style.left = `${anchor.x}px`
    el.style.top = `${anchor.y}px`
  }, [map, target])

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
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      setValue(target.label ?? '')
      inputRef.current?.blur()
      return
    }
    applyStyleShortcutKeyDown(e, target, controller)
  }

  const isEditing = controller.editingId === target.id
  const scale = getItemZoomScale(map, target)
  const baseFontSize =
    target.style?.fontSize ?? (target.style?.size ? resolveSize(target.style.size) : 12)
  const fontSize = baseFontSize * scale
  const weight = resolveWeight(target.style?.weight)
  const fontStyle = target.style?.fontStyle === 'italic' ? 'italic' : 'normal'
  const isUnderline = Boolean(
    target.style?.underline || target.style?.textDecoration === 'underline',
  )
  const textDecoration = isUnderline ? 'underline' : 'none'
  const paddingX = Math.max(3, 4 * scale)
  const paddingY = Math.max(1.5, 2 * scale)
  const textColor =
    target.type === 'shape'
      ? resolveItemStyle(target).text.color
      : target.style?.textColor
        ? resolveColor(target.style.textColor)
        : '#1D1D1B'

  return (
    <div
      ref={containerRef}
      className={`tual-inline-label-editor ${className ?? ''}`}
      style={{
        position: 'absolute',
        left: `${midX}px`,
        top: `${midY}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: 800,
        pointerEvents: isEditing ? 'auto' : 'none',
      }}
      onPointerDown={(e) => {
        if (isEditing) e.stopPropagation()
      }}
      onMouseDown={(e) => {
        if (isEditing) e.stopPropagation()
      }}
      onClick={(e) => {
        if (isEditing) e.stopPropagation()
      }}
      onDoubleClick={(e) => {
        if (isEditing) e.stopPropagation()
      }}
      onContextMenu={(e) => {
        if (isEditing) e.stopPropagation()
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        placeholder={t('addLabel')}
        className="tual-label-input"
        readOnly={!isEditing}
        style={{
          color: textColor,
          fontFamily: 'inherit',
          fontSize: `${fontSize}px`,
          fontWeight: weight,
          fontStyle,
          textDecoration,
          lineHeight: 1,
          padding: `${paddingY}px ${paddingX}px`,
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
})
