import type React from 'react'
import type { NoteItem, RenderNoteProps, ScreenPoint } from '../../types/index.js'

export interface NoteCustomRenderViewProps {
  item: NoteItem
  screenPos: ScreenPoint
  isSelected: boolean
  isDragging: boolean
  readOnly: boolean
  isCompact: boolean
  cardClassName: string
  structuralRootStyle: React.CSSProperties
  styles?: { noteCard?: React.CSSProperties; noteCollapsed?: React.CSSProperties; noteCompact?: React.CSSProperties; noteCardSelected?: React.CSSProperties }
  renderNote: (props: RenderNoteProps) => React.ReactNode
  onCardClick: (e: React.MouseEvent) => void
  onCardDoubleClick: (e: React.MouseEvent) => void
  handleHeaderPointerDown: (e: React.PointerEvent<HTMLElement>) => void
  handleResizePointerDown: (e: React.PointerEvent<HTMLElement>) => void
  onSelect: (id: string) => void
  onUpdate: (id: string, patch: Partial<NoteItem>) => void
  onDelete: (id: string) => void
}

export function NoteCustomRenderView({
  item,
  screenPos,
  isSelected,
  isDragging,
  readOnly,
  isCompact,
  cardClassName,
  structuralRootStyle,
  styles,
  renderNote,
  onCardClick,
  onCardDoubleClick,
  handleHeaderPointerDown,
  handleResizePointerDown,
  onSelect,
  onUpdate,
  onDelete,
}: NoteCustomRenderViewProps) {
  return (
    <div
      data-rlc-note={item.id}
      data-collapsed={isCompact ? 'true' : undefined}
      data-compact={isCompact ? 'true' : undefined}
      data-selected={(!readOnly && isSelected) || undefined}
      className={cardClassName}
      onClick={onCardClick}
      onDoubleClick={onCardDoubleClick}
      onWheel={(e) => e.stopPropagation()}
      style={{
        ...structuralRootStyle,
        ...styles?.noteCard,
        ...(isCompact ? { ...styles?.noteCollapsed, ...styles?.noteCompact } : undefined),
        ...(!readOnly && isSelected ? styles?.noteCardSelected : undefined),
      }}
    >
      {renderNote({
        item,
        screenPos,
        isSelected: !readOnly && isSelected,
        isDragging,
        readOnly,
        isCompact,
        dragHandleProps: {
          onPointerDown: handleHeaderPointerDown,
          style: { cursor: readOnly ? 'default' : isDragging ? 'grabbing' : 'grab' },
        },
        resizeHandleProps: {
          onPointerDown: handleResizePointerDown,
          style: { cursor: readOnly || isCompact ? 'default' : 'nwse-resize' },
        },
        onSelect: () => { if (!readOnly) onSelect(item.id) },
        onUpdate: (patch) => {
          if (!readOnly || (Object.keys(patch).length <= 2 && ('minimized' in patch || 'collapseState' in patch))) {
            onUpdate(item.id, patch)
          }
        },
        onDelete: () => { if (!readOnly) onDelete(item.id) },
      })}
    </div>
  )
}

