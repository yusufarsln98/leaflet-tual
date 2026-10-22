import type React from 'react'
import type {
  CanvasIcons,
  CanvasLabels,
  LeafletCanvasClassNames,
  LeafletCanvasStyles,
  NoteItem,
} from '../../types/index.js'
import { DEFAULT_ICONS } from '../../widgets/CanvasToolbar/icons.js'
import type { ResolvedNoteTheme } from './types.js'

export interface NoteCardHeaderProps {
  item: NoteItem
  theme: ResolvedNoteTheme
  readOnly: boolean
  unstyled: boolean
  labels?: CanvasLabels
  icons?: CanvasIcons
  classNames?: LeafletCanvasClassNames
  styles?: LeafletCanvasStyles
  onHeaderPointerDown: (e: React.PointerEvent<HTMLElement>) => void
  onCollapse: () => void
  onSelect: (id: string) => void
  onUpdate: (id: string, patch: Partial<NoteItem>) => void
  onDelete: (id: string) => void
  onComplete?: () => void
}

export function NoteCardHeader({
  item,
  theme,
  readOnly,
  unstyled,
  labels,
  icons,
  classNames,
  styles,
  onHeaderPointerDown,
  onCollapse,
  onSelect,
  onUpdate,
  onDelete,
  onComplete,
}: NoteCardHeaderProps) {
  const headerBtnBaseStyle: React.CSSProperties = unstyled
    ? {}
    : {
        border: 'none',
        background: 'transparent',
        color: item.textColor || theme.text,
        width: '20px',
        height: '20px',
        padding: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 700,
        lineHeight: 1,
        opacity: 0.75,
        borderRadius: '2px',
        flexShrink: 0,
      }

  return (
    <div
      onPointerDown={onHeaderPointerDown}
      className={['rlc-note-header', classNames?.noteHeader].filter(Boolean).join(' ')}
      style={{
        cursor: readOnly ? 'default' : 'grab',
        ...(unstyled
          ? {}
          : {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '6px',
              padding: '6px 8px 6px 10px',
              backgroundColor: theme.header,
              borderBottom: `1px solid ${theme.border}`,
              boxSizing: 'border-box',
            }),
        ...styles?.noteHeader,
      }}
    >
      <input
        type="text"
        readOnly={readOnly}
        value={item.title ?? ''}
        placeholder={labels?.noteTitlePlaceholder ?? 'Note title...'}
        aria-label={labels?.noteTitlePlaceholder ?? 'Note title'}
        title={item.title || labels?.noteTitlePlaceholder || 'Note'}
        className={['rlc-note-title-input', classNames?.noteTitleInput].filter(Boolean).join(' ')}
        onFocus={() => { if (!readOnly) onSelect(item.id) }}
        onBlur={() => onComplete?.()}
        onChange={(e) => { if (!readOnly) onUpdate(item.id, { title: e.target.value }) }}
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          ...(unstyled
            ? {}
            : {
                flex: 1,
                minWidth: 0,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontWeight: 600,
                fontSize: '12px',
                color: item.textColor || theme.text,
                fontFamily: 'inherit',
                cursor: readOnly ? 'default' : 'text',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }),
          ...styles?.noteTitleInput,
        }}
      />

      <div
        className={['rlc-note-header-actions', classNames?.noteHeaderActions].filter(Boolean).join(' ')}
        style={{
          ...(unstyled ? {} : { display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }),
          ...styles?.noteHeaderActions,
        }}
      >
        <button
          type="button"
          title={labels?.noteCollapse ?? 'Collapse note'}
          aria-label={labels?.noteCollapse ?? 'Collapse note'}
          className={['rlc-note-header-btn', classNames?.noteHeaderButton].filter(Boolean).join(' ')}
          onClick={(e) => {
            e.stopPropagation()
            onCollapse()
          }}
          style={{ ...headerBtnBaseStyle, ...styles?.noteHeaderButton }}
        >
          {icons?.noteCollapse ?? DEFAULT_ICONS.noteCollapse}
        </button>

        {!readOnly && (
          <button
            type="button"
            title={labels?.noteDelete ?? 'Delete note'}
            aria-label={labels?.noteDelete ?? 'Delete note'}
            className={['rlc-note-header-btn', 'rlc-note-delete-btn', classNames?.noteHeaderButton, classNames?.noteDeleteButton].filter(Boolean).join(' ')}
            onClick={(e) => {
              e.stopPropagation()
              onDelete(item.id)
            }}
            style={{
              ...headerBtnBaseStyle,
              ...styles?.noteHeaderButton,
              ...styles?.noteDeleteButton,
            }}
          >
            {icons?.noteDelete ?? DEFAULT_ICONS.noteDelete}
          </button>
        )}
      </div>
    </div>
  )
}

