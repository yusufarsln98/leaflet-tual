import type React from 'react'
import type {
  TualIcons,
  TualLabels,
  LeafletTualClassNames,
  LeafletTualStyles,
  NoteItem,
} from '../../types/index.js'
import { DEFAULT_ICONS } from '../../widgets/TualToolbar/icons.js'
import type { ResolvedNoteTheme } from './types.js'
import { NoteCardHeader } from './NoteCardHeader.js'

export interface NoteCardViewProps {
  item: NoteItem
  theme: ResolvedNoteTheme
  isCompact: boolean
  isDragging: boolean
  readOnly: boolean
  unstyled: boolean
  labels?: TualLabels
  icons?: TualIcons
  classNames?: LeafletTualClassNames
  styles?: LeafletTualStyles
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  onHeaderPointerDown: (e: React.PointerEvent<HTMLElement>) => void
  onExpandFromCompact: (e?: React.MouseEvent) => void
  onCollapse: () => void
  onSelect: (id: string) => void
  onUpdate: (id: string, patch: Partial<NoteItem>) => void
  onDelete: (id: string) => void
  onComplete?: () => void
  onTextareaPointerDown: (e: React.PointerEvent<HTMLTextAreaElement>) => void
}

export function NoteCardView({
  item,
  theme,
  isCompact,
  isDragging,
  readOnly,
  unstyled,
  labels,
  icons,
  classNames,
  styles,
  textareaRef,
  onHeaderPointerDown,
  onExpandFromCompact,
  onCollapse,
  onSelect,
  onUpdate,
  onDelete,
  onComplete,
  onTextareaPointerDown,
}: NoteCardViewProps) {
  if (isCompact) {
    return (
      <div
        onPointerDown={onHeaderPointerDown}
        className={['rlc-note-header', classNames?.noteHeader].filter(Boolean).join(' ')}
        style={{
          cursor: readOnly ? 'default' : isDragging ? 'grabbing' : 'grab',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          width: '100%',
          height: '100%',
          userSelect: 'none',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            lineHeight: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '90px',
            color: item.textColor || theme.text,
          }}
          title={item.title || labels?.noteTitlePlaceholder || 'Note'}
        >
          {item.title || labels?.noteTitlePlaceholder || 'Note'}
        </span>
        <button
          type="button"
          title={labels?.noteExpand ?? 'Expand note'}
          aria-label={labels?.noteExpand ?? 'Expand note'}
          className={['rlc-note-header-btn', classNames?.noteHeaderButton].filter(Boolean).join(' ')}
          onClick={onExpandFromCompact}
          style={{
            border: 'none',
            background: 'transparent',
            color: item.textColor || theme.text,
            width: '12px',
            height: '12px',
            padding: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            opacity: 0.75,
            flexShrink: 0,
          }}
        >
          {icons?.noteExpand ?? DEFAULT_ICONS.noteExpand}
        </button>
      </div>
    )
  }

  return (
    <>
      <NoteCardHeader
        item={item}
        theme={theme}
        readOnly={readOnly}
        unstyled={unstyled}
        labels={labels}
        icons={icons}
        classNames={classNames}
        styles={styles}
        onHeaderPointerDown={onHeaderPointerDown}
        onCollapse={onCollapse}
        onSelect={onSelect}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onComplete={onComplete}
      />

      <div
        className={['rlc-note-body', classNames?.noteBody].filter(Boolean).join(' ')}
        style={{ ...(unstyled ? {} : { padding: 0 }), ...styles?.noteBody }}
      >
        <textarea
          ref={textareaRef}
          readOnly={readOnly}
          value={item.text}
          placeholder={labels?.noteTextPlaceholder ?? 'Write a note on the map...'}
          aria-label={labels?.noteTextPlaceholder ?? 'Note text'}
          rows={3}
          className={['rlc-note-textarea', classNames?.noteTextarea].filter(Boolean).join(' ')}
          onFocus={() => { if (!readOnly) onSelect(item.id) }}
          onBlur={() => onComplete?.()}
          onChange={(e) => { if (!readOnly) onUpdate(item.id, { text: e.target.value }) }}
          onPointerDown={onTextareaPointerDown}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            ...(unstyled
              ? {}
              : {
                  width: '100%',
                  height: item.height ? `${item.height}px` : undefined,
                  boxSizing: 'border-box',
                  display: 'block',
                  margin: 0,
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 0,
                  padding: '6px 10px 8px',
                  outline: 'none',
                  resize: readOnly ? 'none' : 'both',
                  minWidth: '160px',
                  maxWidth: '600px',
                  minHeight: '56px',
                  maxHeight: '800px',
                  fontSize: '12px',
                  lineHeight: 1.45,
                  color: item.textColor || theme.text,
                  fontFamily: 'inherit',
                  cursor: readOnly ? 'default' : 'text',
                }),
            ...styles?.noteTextarea,
          }}
        />
      </div>
    </>
  )
}
