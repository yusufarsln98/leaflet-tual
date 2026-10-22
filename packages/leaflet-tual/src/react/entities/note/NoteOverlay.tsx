import React, { useEffect, useRef, useState } from 'react'
import type { NoteOverlayProps } from './types.js'
import { clampNotePosition, getDefaultNoteCardStyle, resolveNoteTheme } from './utils.js'
import { useNoteDragResize } from './use-note-drag-resize.js'
import { NoteCardView } from './NoteCardView.js'
import { NoteCustomRenderView } from './NoteCustomRenderView.js'

export type { NoteOverlayProps } from './types.js'

export const NoteOverlay = React.memo(function NoteOverlay({
  item,
  screenPos,
  isSelected,
  map,
  readOnly = false,
  labels,
  icons,
  unstyled = false,
  classNames,
  styles,
  clampToViewport = true,
  autoMinimizeZoomThreshold,
  renderNote,
  onSelect,
  onUpdate,
  onDelete,
  onComplete,
}: NoteOverlayProps) {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const currentZoom = typeof map?.getZoom === 'function' ? map.getZoom() : null
  const [expandedLocally, setExpandedLocally] = useState(false)
  const lastZoomRef = useRef<number | null>(currentZoom)

  useEffect(() => {
    if (currentZoom !== null) {
      if (lastZoomRef.current !== null && lastZoomRef.current !== currentZoom) setExpandedLocally(false)
      lastZoomRef.current = currentZoom
    }
  }, [currentZoom])

  const autoCompact =
    typeof autoMinimizeZoomThreshold === 'number' && currentZoom !== null && !expandedLocally && currentZoom < autoMinimizeZoomThreshold

  const isCompact =
    !expandedLocally &&
    (autoCompact || item.collapseState === 'compact' || item.collapseState === 'collapsed' || item.minimized === true || item.minimized === 'compact')

  const {
    isDragging,
    didDragRef,
    handleHeaderPointerDown,
    handleResizePointerDown,
    handleTextareaPointerDown,
  } = useNoteDragResize({
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
  })

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const stopPropagation = (e: Event) => {
      const target = e.target as HTMLElement | null
      if (target?.closest('.rlc-note-header') && !target.closest('button, input')) return
      e.stopPropagation()
    }
    el.addEventListener('mousedown', stopPropagation)
    el.addEventListener('touchstart', stopPropagation)
    return () => {
      el.removeEventListener('mousedown', stopPropagation)
      el.removeEventListener('touchstart', stopPropagation)
    }
  }, [])

  const handleExpandFromCompact = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setExpandedLocally(true)
    if (!readOnly) onSelect(item.id)
    onUpdate(item.id, { minimized: false })
  }

  const theme = resolveNoteTheme(item.backgroundColor)
  const { x: renderX, y: renderY } = clampNotePosition(
    map,
    screenPos,
    item,
    isCompact,
    isDragging,
    clampToViewport,
  )

  const structuralRootStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${renderX}px`,
    top: `${renderY}px`,
    pointerEvents: 'auto',
    zIndex: !readOnly && isSelected ? 30 : 20,
    userSelect: readOnly ? 'text' : 'none',
  }

  const cardClassName = [
    'rlc-note-card',
    isCompact ? 'rlc-note-compact rlc-note-collapsed' : undefined,
    classNames?.noteCard,
    isCompact ? classNames?.noteCompact : undefined,
    isCompact ? classNames?.noteCollapsed : undefined,
    !readOnly && isSelected ? classNames?.noteCardSelected : undefined,
  ]
    .filter(Boolean)
    .join(' ')

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (didDragRef.current) {
      didDragRef.current = false
      return
    }
    if (isCompact) {
      handleExpandFromCompact(e)
      return
    }
    if (!readOnly) onSelect(item.id)
  }

  const handleCardDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (didDragRef.current) {
      didDragRef.current = false
      return
    }
    if (isCompact) handleExpandFromCompact(e)
  }

  if (renderNote) {
    return (
      <NoteCustomRenderView
        item={item}
        screenPos={screenPos}
        isSelected={isSelected}
        isDragging={isDragging}
        readOnly={readOnly}
        isCompact={isCompact}
        cardClassName={cardClassName}
        structuralRootStyle={structuralRootStyle}
        styles={styles}
        renderNote={renderNote}
        onCardClick={handleCardClick}
        onCardDoubleClick={handleCardDoubleClick}
        handleHeaderPointerDown={handleHeaderPointerDown}
        handleResizePointerDown={handleResizePointerDown}
        onSelect={onSelect}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    )
  }

  return (
    <div
      ref={cardRef}
      data-rlc-note={item.id}
      data-collapsed={isCompact ? 'true' : undefined}
      data-compact={isCompact ? 'true' : undefined}
      data-selected={(!readOnly && isSelected) || undefined}
      data-dragging={isDragging || undefined}
      className={cardClassName}
      onClick={handleCardClick}
      onDoubleClick={handleCardDoubleClick}
      onWheel={(e) => e.stopPropagation()}
      style={{
        ...structuralRootStyle,
        ...getDefaultNoteCardStyle(item, theme, isCompact, isSelected, readOnly, isDragging, unstyled),
        ...styles?.noteCard,
        ...(isCompact ? { borderRadius: '9999px', ...styles?.noteCollapsed, ...styles?.noteCompact } : undefined),
        ...(!readOnly && isSelected ? styles?.noteCardSelected : undefined),
      }}
    >
      <NoteCardView
        item={item}
        theme={theme}
        isCompact={isCompact}
        isDragging={isDragging}
        readOnly={readOnly}
        unstyled={unstyled}
        labels={labels}
        icons={icons}
        classNames={classNames}
        styles={styles}
        textareaRef={textareaRef}
        onHeaderPointerDown={handleHeaderPointerDown}
        onExpandFromCompact={handleExpandFromCompact}
        onCollapse={() => {
          setExpandedLocally(false)
          onUpdate(item.id, { minimized: true })
        }}
        onSelect={onSelect}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onComplete={onComplete}
        onTextareaPointerDown={handleTextareaPointerDown}
      />
    </div>
  )
})
