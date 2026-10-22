import React, { useEffect, useRef, useState } from 'react'
import { calculateZoomFontSize } from '../../shared/geo.js'
import type { TextOverlayProps } from './types.js'
import { clampTextPosition, getTextCursor } from './utils.js'
import { useTextDrag } from './use-text-drag.js'
import { TextOverlayView } from './TextOverlayView.js'
import { TextCustomRenderView } from './TextCustomRenderView.js'

export type { TextOverlayProps } from './types.js'

export const TextOverlay = React.memo(function TextOverlay({
  item,
  screenPos,
  isSelected,
  isEditingLabel,
  map,
  readOnly = false,
  labels,
  icons: _icons,
  unstyled = false,
  classNames,
  styles,
  clampToViewport = true,
  autoMinimizeZoomThreshold,
  renderText,
  onSelect,
  onUpdate,
  onDelete,
  onComplete,
}: TextOverlayProps) {
  const [isEditing, setIsEditing] = useState(!readOnly && item.text === '')
  const [expandedLocally, setExpandedLocally] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  const { isDragging, didDragRef, handlePointerDown } = useTextDrag({
    item,
    screenPos,
    map,
    readOnly,
    isEditing,
    onSelect,
    onUpdate,
  })

  const currentZoom = typeof map?.getZoom === 'function' ? map.getZoom() : null
  const lastZoomRef = useRef<number | null>(currentZoom)

  const initialSize = item.initialFontSize ?? (item as { fontSize?: number }).fontSize ?? 16
  const baseZoom = item.baseZoom ?? 14
  const dynamicFontSize = calculateZoomFontSize(initialSize, currentZoom, baseZoom)

  useEffect(() => {
    if (currentZoom !== null) {
      if (lastZoomRef.current !== null && lastZoomRef.current !== currentZoom) {
        setExpandedLocally(false)
      }
      lastZoomRef.current = currentZoom
    }
  }, [currentZoom])

  const isLowZoom =
    typeof autoMinimizeZoomThreshold === 'number' &&
    currentZoom !== null &&
    currentZoom < autoMinimizeZoomThreshold

  const isCompact = isLowZoom && !isSelected && !isEditing && !expandedLocally

  useEffect(() => {
    if (isSelected && isEditingLabel && !readOnly) {
      setIsEditing(true)
    }
  }, [isSelected, isEditingLabel, readOnly])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const cursor = getTextCursor(readOnly, isEditing, isDragging, isCompact)
  const dragHandleProps = {
    onPointerDown: handlePointerDown,
    style: { cursor } as React.CSSProperties,
  }

  const wrapperClassName = [
    'rlc-text-wrapper',
    isCompact ? 'rlc-text-compact' : undefined,
    classNames?.textWrapper,
    isCompact ? classNames?.textCompact : undefined,
    !readOnly && isSelected ? classNames?.textWrapperSelected : undefined,
  ]
    .filter(Boolean)
    .join(' ')

  const { x: renderX, y: renderY } = clampTextPosition(
    map,
    screenPos,
    item,
    dynamicFontSize,
    isCompact,
    isDragging,
    clampToViewport,
  )

  const structuralWrapperStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${renderX}px`,
    top: `${renderY}px`,
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'auto',
    zIndex: !readOnly && isSelected ? 28 : 18,
    cursor,
    userSelect: readOnly || isEditing ? 'text' : 'none',
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (didDragRef.current) {
      didDragRef.current = false
      return
    }
    if (isCompact) setExpandedLocally(true)
    if (!readOnly) onSelect(item.id)
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isCompact) setExpandedLocally(true)
    if (!readOnly) {
      onSelect(item.id)
      setIsEditing(true)
    }
  }

  if (renderText) {
    return (
      <TextCustomRenderView
        item={item}
        screenPos={screenPos}
        isSelected={isSelected}
        isEditing={isEditing}
        isDragging={isDragging}
        readOnly={readOnly}
        isCompact={isCompact}
        dynamicFontSize={dynamicFontSize}
        dragHandleProps={dragHandleProps}
        wrapperClassName={wrapperClassName}
        structuralWrapperStyle={structuralWrapperStyle}
        styles={styles}
        renderText={renderText}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        setIsEditing={(ed) => { if (!readOnly) setIsEditing(ed) }}
        onSelect={onSelect}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    )
  }

  return (
    <div
      data-tual-text={item.id}
      data-compact={isCompact ? 'true' : undefined}
      data-selected={(!readOnly && isSelected) || undefined}
      className={wrapperClassName}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onWheel={(e) => e.stopPropagation()}
      style={{
        ...structuralWrapperStyle,
        ...(unstyled ? {} : { fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }),
        ...styles?.textWrapper,
        ...(isCompact ? styles?.textCompact : undefined),
        ...(!readOnly && isSelected ? styles?.textWrapperSelected : undefined),
      }}
    >
      <TextOverlayView
        item={item}
        map={map}
        isCompact={isCompact}
        isEditing={isEditing}
        isSelected={isSelected}
        readOnly={readOnly}
        unstyled={unstyled}
        dynamicFontSize={dynamicFontSize}
        labels={labels}
        classNames={classNames}
        styles={styles}
        inputRef={inputRef}
        setIsEditing={setIsEditing}
        onUpdate={onUpdate}
        onComplete={onComplete}
      />
    </div>
  )
})
