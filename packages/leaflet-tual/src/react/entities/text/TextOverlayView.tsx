import type React from 'react'
import type L from 'leaflet'
import type {
  CanvasLabels,
  LeafletCanvasClassNames,
  LeafletCanvasStyles,
  TextItem,
} from '../../types/index.js'

export interface TextOverlayViewProps {
  item: TextItem
  map: L.Map
  isCompact: boolean
  isEditing: boolean
  isSelected: boolean
  readOnly: boolean
  unstyled: boolean
  dynamicFontSize: number
  labels?: CanvasLabels
  classNames?: LeafletCanvasClassNames
  styles?: LeafletCanvasStyles
  inputRef: React.RefObject<HTMLTextAreaElement | null>
  setIsEditing: (editing: boolean) => void
  onUpdate: (id: string, patch: Partial<TextItem>) => void
  onComplete?: () => void
}

export function TextOverlayView({
  item,
  map,
  isCompact,
  isEditing,
  isSelected,
  readOnly,
  unstyled,
  dynamicFontSize,
  labels,
  classNames,
  styles,
  inputRef,
  setIsEditing,
  onUpdate,
  onComplete,
}: TextOverlayViewProps) {
  if (isCompact) {
    return (
      <div
        data-compact="true"
        className={[
          'rlc-text-display',
          'rlc-text-compact-pill',
          classNames?.textDisplay,
          classNames?.textCompact,
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          ...(unstyled
            ? {}
            : {
                display: 'inline-flex',
                alignItems: 'center',
                height: '22px',
                padding: '0 8px',
                backgroundColor: item.backgroundColor ?? '#ffffff',
                color: item.color,
                border: `1px solid ${item.color ? `${item.color}40` : '#cbd5e1'}`,
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 600,
                lineHeight: 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '120px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
                cursor: 'pointer',
                userSelect: 'none',
              }),
          ...styles?.textDisplay,
          ...styles?.textCompact,
        }}
        title={item.text || 'Text'}
      >
        {item.text || labels?.textEmptyFallback || 'Text'}
      </div>
    )
  }

  const finishEditing = () => {
    setIsEditing(false)
    if (!item.text.trim()) {
      onUpdate(item.id, { text: labels?.textEmptyFallback ?? 'Label' })
    }
    onComplete?.()
  }

  if (isEditing) {
    return (
      <textarea
        ref={inputRef}
        value={item.text}
        placeholder={labels?.textPlaceholder ?? 'Type text...'}
        aria-label={labels?.textPlaceholder ?? 'Map text annotation'}
        rows={Math.max(1, item.text.split('\n').length)}
        className={['rlc-text-input', classNames?.textInput].filter(Boolean).join(' ')}
        onChange={(e) => onUpdate(item.id, { text: e.target.value })}
        onBlur={finishEditing}
        onKeyDown={(e) => {
          if (e.key === 'Escape' || (e.key === 'Enter' && !e.shiftKey)) {
            e.preventDefault()
            finishEditing()
          }
        }}
        onPointerDown={(e) => {
          e.stopPropagation()
          map.dragging.disable()
          const handleUp = () => {
            map.dragging.enable()
            window.removeEventListener('pointerup', handleUp)
          }
          window.addEventListener('pointerup', handleUp)
        }}
        onMouseDown={(e) => {
          e.stopPropagation()
          map.dragging.disable()
          const handleUp = () => {
            map.dragging.enable()
            window.removeEventListener('mouseup', handleUp)
          }
          window.addEventListener('mouseup', handleUp)
        }}
        style={{
          fontSize: `${dynamicFontSize}px`,
          fontWeight: item.fontWeight ?? 'bold',
          color: item.color,
          ...(unstyled
            ? {}
            : {
                minWidth: '80px',
                padding: '2px 4px',
                backgroundColor: '#ffffff',
                border: '1px solid #767676',
                borderRadius: '2px',
                outline: 'none',
                fontFamily: 'inherit',
                resize: 'both',
                lineHeight: 1.25,
                boxShadow: 'none',
              }),
          ...styles?.textInput,
        }}
      />
    )
  }

  return (
    <div
      className={['rlc-text-display', classNames?.textDisplay].filter(Boolean).join(' ')}
      style={{
        fontSize: `${dynamicFontSize}px`,
        fontWeight: item.fontWeight ?? 'bold',
        color: item.color,
        ...(unstyled
          ? {}
          : {
              padding: '2px 4px',
              backgroundColor: item.backgroundColor ?? '#ffffff',
              borderRadius: '2px',
              border: !readOnly && isSelected ? '1px dashed #767676' : '1px solid transparent',
              boxShadow: 'none',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.25,
            }),
        ...styles?.textDisplay,
      }}
    >
      {item.text || (readOnly ? '' : (labels?.textEmptyFallback ?? 'Double-click to edit'))}
    </div>
  )
}

