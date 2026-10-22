import type React from 'react'
import type { RenderTextProps, ScreenPoint, TextItem } from '../../types/index.js'

export interface TextCustomRenderViewProps {
  item: TextItem
  screenPos: ScreenPoint
  isSelected: boolean
  isEditing: boolean
  isDragging: boolean
  readOnly: boolean
  isCompact: boolean
  dynamicFontSize: number
  dragHandleProps: { onPointerDown: (e: React.PointerEvent<HTMLElement>) => void; style: React.CSSProperties }
  wrapperClassName: string
  structuralWrapperStyle: React.CSSProperties
  styles?: { textWrapper?: React.CSSProperties; textCompact?: React.CSSProperties; textWrapperSelected?: React.CSSProperties }
  renderText: (props: RenderTextProps) => React.ReactNode
  onClick: (e: React.MouseEvent) => void
  onDoubleClick: (e: React.MouseEvent) => void
  setIsEditing: (editing: boolean) => void
  onSelect: (id: string) => void
  onUpdate: (id: string, patch: Partial<TextItem>) => void
  onDelete: (id: string) => void
}

export function TextCustomRenderView({
  item,
  screenPos,
  isSelected,
  isEditing,
  isDragging,
  readOnly,
  isCompact,
  dynamicFontSize,
  dragHandleProps,
  wrapperClassName,
  structuralWrapperStyle,
  styles,
  renderText,
  onClick,
  onDoubleClick,
  setIsEditing,
  onSelect,
  onUpdate,
  onDelete,
}: TextCustomRenderViewProps) {
  return (
    <div
      data-rlc-text={item.id}
      data-compact={isCompact ? 'true' : undefined}
      data-selected={(!readOnly && isSelected) || undefined}
      className={wrapperClassName}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onWheel={(e) => e.stopPropagation()}
      style={{
        ...structuralWrapperStyle,
        ...styles?.textWrapper,
        ...(isCompact ? styles?.textCompact : undefined),
        ...(!readOnly && isSelected ? styles?.textWrapperSelected : undefined),
      }}
    >
      {renderText({
        item,
        screenPos,
        isSelected: !readOnly && isSelected,
        isEditing: !readOnly && isEditing,
        isDragging,
        readOnly,
        isCompact,
        dynamicFontSize,
        setIsEditing,
        dragHandleProps,
        onSelect: () => { if (!readOnly) onSelect(item.id) },
        onUpdate: (patch) => { if (!readOnly) onUpdate(item.id, patch) },
        onDelete: () => { if (!readOnly) onDelete(item.id) },
      })}
    </div>
  )
}

