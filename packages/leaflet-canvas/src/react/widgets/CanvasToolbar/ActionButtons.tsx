import type React from 'react'
import type {
  CanvasIcons,
  CanvasItem,
  CanvasLabels,
  LeafletCanvasClassNames,
  LeafletCanvasStyles,
  ToolbarOrientation,
} from '../../types/index.js'
import { DEFAULT_ICONS } from './icons.js'
import { getActionRowStyle, getHistoryBtnStyle } from './action-buttons-styles.js'

export interface ActionButtonsProps {
  readOnly: boolean
  showHistoryControls: boolean
  showDeleteButton: boolean
  showClearButton: boolean
  showToolLabels?: boolean
  selectedItem: CanvasItem | null | undefined
  itemsCount: number
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
  deleteSelected: () => void
  clearAll: () => void
  orientation?: ToolbarOrientation
  labels?: CanvasLabels
  icons?: CanvasIcons
  unstyled?: boolean
  classNames?: LeafletCanvasClassNames
  styles?: LeafletCanvasStyles
}

export function ActionButtons({
  readOnly,
  showHistoryControls,
  showDeleteButton,
  showClearButton,
  showToolLabels = true,
  selectedItem,
  itemsCount,
  canUndo,
  canRedo,
  undo,
  redo,
  deleteSelected,
  clearAll,
  orientation = 'horizontal',
  labels,
  icons,
  unstyled,
  classNames,
  styles,
}: ActionButtonsProps) {
  const isVertical = orientation === 'vertical'

  const showDivider =
    showHistoryControls ||
    (!readOnly && showDeleteButton && selectedItem) ||
    (!readOnly && showClearButton && itemsCount > 0)

  if (!showDivider) return null

  const renderActionContent = (icon: React.ReactNode, label: string) =>
    isVertical && showToolLabels ? (
      <>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px' }}>
          {icon}
        </span>
        <span style={{ whiteSpace: 'nowrap' }}>{label}</span>
        <span />
      </>
    ) : (
      <>
        {icon}
        {showToolLabels && <span>{label}</span>}
      </>
    )

  const getHistoryBtnClass = (enabled: boolean) => [
    'rlc-action-btn',
    !enabled ? 'rlc-action-btn-disabled' : undefined,
    classNames?.actionButton,
    !enabled ? classNames?.actionButtonDisabled : undefined,
  ].filter(Boolean).join(' ')

  const undoBtn = (
    <button
      key="undo"
      type="button"
      title={labels?.undo ?? 'Undo'}
      aria-label={labels?.undo ?? 'Undo'}
      disabled={!canUndo}
      className={getHistoryBtnClass(canUndo)}
      onClick={undo}
      style={getHistoryBtnStyle(canUndo, isVertical, showToolLabels, Boolean(unstyled), styles)}
    >
      {icons?.undo ?? DEFAULT_ICONS.undo}
    </button>
  )

  const redoBtn = (
    <button
      key="redo"
      type="button"
      title={labels?.redo ?? 'Redo'}
      aria-label={labels?.redo ?? 'Redo'}
      disabled={!canRedo}
      className={getHistoryBtnClass(canRedo)}
      onClick={redo}
      style={getHistoryBtnStyle(canRedo, isVertical, showToolLabels, Boolean(unstyled), styles)}
    >
      {icons?.redo ?? DEFAULT_ICONS.redo}
    </button>
  )

  return (
    <>
      <div
        className={['rlc-toolbar-divider', classNames?.toolbarDivider].filter(Boolean).join(' ')}
        style={{
          ...(unstyled
            ? {}
            : isVertical
              ? { width: showToolLabels ? '100%' : '18px', height: '1px', backgroundColor: '#767676', margin: showToolLabels ? '3px 0' : '3px auto' }
              : { width: '1px', height: '18px', backgroundColor: '#767676', margin: '0 3px' }),
          ...styles?.toolbarDivider,
        }}
      />

      {showHistoryControls &&
        (isVertical ? (
          <div
            style={{
              display: 'flex',
              flexDirection: showToolLabels ? 'row' : 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              width: showToolLabels ? '100%' : 'auto',
            }}
          >
            {undoBtn}
            {redoBtn}
          </div>
        ) : (
          <>
            {undoBtn}
            {redoBtn}
          </>
        ))}

      {!readOnly && showDeleteButton && selectedItem && (
        <button
          type="button"
          title={labels?.delete ?? 'Delete selected item (Del)'}
          aria-label={labels?.delete ?? 'Delete selected item'}
          className={['rlc-action-btn', 'rlc-delete-btn', classNames?.actionButton, classNames?.deleteButton].filter(Boolean).join(' ')}
          onClick={deleteSelected}
          style={getActionRowStyle('#b91c1c', isVertical, showToolLabels, Boolean(unstyled), styles, styles?.deleteButton)}
        >
          {renderActionContent(icons?.delete ?? DEFAULT_ICONS.delete, labels?.delete ?? 'Delete')}
        </button>
      )}

      {!readOnly && showClearButton && itemsCount > 0 && (
        <button
          type="button"
          title={labels?.clear ?? 'Clear all annotations'}
          aria-label={labels?.clear ?? 'Clear all annotations'}
          className={['rlc-action-btn', classNames?.actionButton].filter(Boolean).join(' ')}
          onClick={clearAll}
          style={getActionRowStyle('#000000', isVertical, showToolLabels, Boolean(unstyled), styles)}
        >
          {renderActionContent(icons?.clear ?? DEFAULT_ICONS.clear, labels?.clear ?? 'Clear')}
        </button>
      )}
    </>
  )
}
