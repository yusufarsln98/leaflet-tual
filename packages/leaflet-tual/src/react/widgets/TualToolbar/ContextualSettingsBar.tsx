import React, { useEffect, useRef } from 'react'
import type {
  ArrowItem,
  TualIcons,
  TualItem,
  TualLabels,
  LeafletTualClassNames,
  LeafletTualStyles,
  ShapeItem,
  TextItem,
  ToolbarOrientation,
} from '../../types/index.js'
import {
  DEFAULT_FONT_SIZE_OPTIONS,
  DEFAULT_STROKE_WIDTH_OPTIONS,
  NOTE_COLOR_THEMES,
} from '../../shared/constants.js'
import { DEFAULT_ICONS } from './icons.js'
import { PixelSelect } from './PixelSelect.js'

export interface ContextualSettingsBarProps {
  isArrowContext: boolean
  isFreeDrawContext: boolean
  isShapeContext: boolean
  isRulerContext?: boolean
  isTextContext: boolean
  isNoteContext: boolean
  selectedItem: TualItem | null | undefined
  selectedShape: ShapeItem | null
  selectedArrow: ArrowItem | null
  selectedText?: TextItem | null
  activeColor: string
  setActiveColor: (color: string) => void
  strokeWidth: number
  setStrokeWidth: (width: number) => void
  strokeWidthOptions?: readonly number[]
  dashed: boolean
  setDashed: (dashed: boolean) => void
  shapeFilled: boolean
  setShapeFilled: (filled: boolean) => void
  noteColor: string
  setNoteColor: (color: string) => void
  fontSize?: number
  setFontSize?: (size: number) => void
  fontSizeOptions?: readonly number[]
  fontWeight?: 'normal' | 'bold'
  setFontWeight?: (weight: 'normal' | 'bold') => void
  updateItem: (id: string, patch: any) => void
  notifyChangeComplete?: (targetItem?: TualItem | null) => void
  isEditingLabel?: boolean
  setEditingLabel?: (editing: boolean) => void
  strokeColors: readonly string[]
  orientation?: ToolbarOrientation
  labels?: TualLabels
  icons?: TualIcons
  unstyled?: boolean
  classNames?: LeafletTualClassNames
  styles?: LeafletTualStyles
}

export function ContextualSettingsBar(props: ContextualSettingsBarProps) {
  const {
    isArrowContext,
    isFreeDrawContext,
    isShapeContext,
    isRulerContext,
    isTextContext,
    isNoteContext,
    selectedItem,
    selectedShape,
    selectedArrow,
    selectedText,
    activeColor,
    setActiveColor,
    strokeWidth,
    setStrokeWidth,
    strokeWidthOptions,
    dashed,
    setDashed,
    shapeFilled,
    setShapeFilled,
    noteColor,
    setNoteColor,
    fontSize,
    setFontSize,
    fontSizeOptions,
    fontWeight,
    setFontWeight,
    updateItem,
    notifyChangeComplete,
    isEditingLabel,
    setEditingLabel,
    strokeColors,
    orientation = 'horizontal',
    labels,
    icons,
    unstyled,
    classNames,
    styles,
  } = props
  const isVertical = orientation === 'vertical'

  const shapeInputRef = useRef<HTMLInputElement | null>(null)
  const arrowInputRef = useRef<HTMLInputElement | null>(null)
  const textInputRef = useRef<HTMLInputElement | null>(null)

  const hasShapeLabelMode = selectedShape
    ? selectedShape.labelMode !== false && (selectedShape as any).hasLabelMode !== false
    : false
  const hasArrowLabelMode = selectedArrow
    ? selectedArrow.labelMode !== false && (selectedArrow as any).hasLabelMode !== false
    : false

  useEffect(() => {
    if (isEditingLabel) {
      if (selectedShape && hasShapeLabelMode && shapeInputRef.current) {
        shapeInputRef.current.focus()
        shapeInputRef.current.select()
      } else if (selectedArrow && hasArrowLabelMode && arrowInputRef.current) {
        arrowInputRef.current.focus()
        arrowInputRef.current.select()
      }
    }
  }, [
    isEditingLabel,
    selectedShape?.id,
    selectedArrow?.id,
    hasShapeLabelMode,
    hasArrowLabelMode,
  ])

  const getToggleBtnStyle = (active: boolean, bold = false): React.CSSProperties => ({
    ...(unstyled ? {} : { padding: '2px 6px', borderRadius: '2px', border: active ? '1px solid #4f4f4f' : '1px solid #767676', backgroundColor: active ? '#e0e0e0' : '#efefef', color: '#000000', boxShadow: active ? 'inset 1px 1px 2px rgba(0, 0, 0, 0.2)' : 'none', fontSize: '12px', fontWeight: bold ? 700 : undefined, cursor: 'pointer' }),
    ...styles?.actionButton,
    ...(active ? styles?.toolButtonActive : undefined),
  })
  const getToggleBtnClass = (active: boolean) => ['rlc-action-btn', classNames?.actionButton, active ? classNames?.toolButtonActive : undefined].filter(Boolean).join(' ')
  const getInputStyle = (w = '105px'): React.CSSProperties => ({
    ...(unstyled ? {} : { minWidth: '100px', width: isVertical ? 'auto' : w, flex: isVertical ? '1 1 auto' : undefined, boxSizing: 'border-box', padding: '2px 4px', borderRadius: '2px', border: '1px solid #767676', backgroundColor: '#ffffff', color: '#000000', fontSize: '12px' }),
    ...styles?.toolbarInput,
  })
  const dividerEl = (
    <div
      className={['rlc-toolbar-divider', classNames?.toolbarDivider].filter(Boolean).join(' ')}
      style={{ ...(unstyled ? {} : isVertical ? { width: '100%', height: '1px', backgroundColor: '#767676' } : { width: '1px', height: '16px', backgroundColor: '#767676' }), ...styles?.toolbarDivider }}
    />
  )

  const isDashedActive = Boolean(
    selectedItem &&
      (selectedItem.type === 'arrow' ||
        selectedItem.type === 'freedraw' ||
        selectedItem.type === 'shape' ||
        selectedItem.type === 'ruler')
      ? selectedItem.dashed
      : dashed,
  )
  const isFilledActive = Boolean(selectedShape ? selectedShape.filled : shapeFilled)
  const isBold = Boolean(selectedText ? selectedText.fontWeight === 'bold' : (fontWeight ?? 'bold') === 'bold')

  return (
    <div
      className={['rlc-toolbar-secondary', classNames?.toolbarSecondary].filter(Boolean).join(' ')}
      style={{
        ...(unstyled ? {} : { display: 'flex', flexDirection: 'row', flexWrap: isVertical ? 'wrap' : 'nowrap', alignItems: 'center', gap: isVertical ? '5px' : '6px', padding: isVertical ? '6px 8px' : '3px 6px', width: isVertical ? '230px' : undefined, maxWidth: isVertical ? '230px' : 'min(92vw, 620px)', overflowX: isVertical ? 'visible' : 'auto', scrollbarWidth: 'none', boxSizing: 'border-box', backgroundColor: '#f0f0f0', border: '1px solid #767676', borderRadius: '2px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)', color: '#000000', fontSize: '12px' }),
        ...styles?.toolbarSecondary,
      }}
    >
      {(isArrowContext || isFreeDrawContext || isShapeContext || isRulerContext || isTextContext) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: isVertical ? '100%' : undefined }}>
          <span style={{ fontSize: '12px', color: 'inherit' }}>{labels?.color ?? 'Color'}</span>
          {strokeColors.map((c) => {
            const selected = (selectedItem && selectedItem.type !== 'note' ? selectedItem.color : activeColor) === c
            return (
              <button
                key={c}
                type="button"
                title={`${labels?.color ?? 'Color'} ${c}`}
                data-active={selected || undefined}
                className={['rlc-swatch-btn', classNames?.swatchButton, selected ? classNames?.swatchButtonActive : undefined].filter(Boolean).join(' ')}
                onClick={() => setActiveColor(c)}
                style={{ backgroundColor: c, ...(unstyled ? {} : { width: '16px', height: '16px', borderRadius: '999px', border: selected ? '2px solid #000000' : '1px solid #767676', boxShadow: selected ? '0 0 0 1px #000000' : 'none', cursor: 'pointer', padding: 0 }), ...styles?.swatchButton, ...(selected ? styles?.swatchButtonActive : undefined) }}
              />
            )
          })}
        </div>
      )}

      {(isArrowContext || isFreeDrawContext || isShapeContext || isRulerContext) && (
        <>
          {dividerEl}
          <PixelSelect label={labels?.width ?? 'Width'} control="stroke-width" value={selectedItem && (selectedItem.type === 'arrow' || selectedItem.type === 'freedraw' || selectedItem.type === 'shape' || selectedItem.type === 'ruler') ? selectedItem.strokeWidth : strokeWidth} options={strokeWidthOptions ?? DEFAULT_STROKE_WIDTH_OPTIONS} onChange={setStrokeWidth} unstyled={unstyled} classNames={classNames} styles={styles} icons={icons} />
          <button type="button" data-active={isDashedActive || undefined} className={getToggleBtnClass(isDashedActive)} onClick={() => setDashed(!isDashedActive)} style={getToggleBtnStyle(isDashedActive)}>
            {labels?.dashed ?? 'Dashed'}
          </button>
        </>
      )}

      {isShapeContext && (
        <>
          <button type="button" data-active={isFilledActive || undefined} className={getToggleBtnClass(isFilledActive)} onClick={() => setShapeFilled(!isFilledActive)} style={getToggleBtnStyle(isFilledActive)}>
            {labels?.filled ?? 'Fill'}
          </button>
          {selectedShape && hasShapeLabelMode && (
            <input
              ref={shapeInputRef}
              type="text"
              data-tual-shape-label-input={selectedShape.id}
              data-testid="shape-label-input"
              data-label-mode="true"
              data-editing-label={isEditingLabel ? 'true' : undefined}
              placeholder={labels?.shapeLabelPlaceholder ?? 'Shape label...'}
              value={selectedShape.label ?? ''}
              className={['rlc-toolbar-input', classNames?.toolbarInput].filter(Boolean).join(' ')}
              onChange={(e) => updateItem(selectedShape.id, { label: e.target.value })}
              onFocus={() => setEditingLabel?.(true)}
              onBlur={(e) => {
                const next = e.relatedTarget as HTMLElement | null
                if (
                  next?.tagName === 'INPUT' ||
                  next?.tagName === 'TEXTAREA' ||
                  next?.closest('[data-tual-toolbar], [data-tual-inline-shape-label]')
                ) {
                  return
                }
                setEditingLabel?.(false)
                notifyChangeComplete?.(selectedShape)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') {
                  e.preventDefault()
                  setEditingLabel?.(false)
                  e.currentTarget.blur()
                  notifyChangeComplete?.(selectedShape)
                }
              }}
              style={getInputStyle()}
            />
          )}
        </>
      )}

      {selectedArrow && hasArrowLabelMode && (
        <input
          ref={arrowInputRef}
          type="text"
          data-tual-arrow-label-input={selectedArrow.id}
          data-testid="arrow-label-input"
          data-label-mode="true"
          data-editing-label={isEditingLabel ? 'true' : undefined}
          placeholder={labels?.arrowLabelPlaceholder ?? 'Arrow label...'}
          value={selectedArrow.label ?? ''}
          className={['rlc-toolbar-input', classNames?.toolbarInput].filter(Boolean).join(' ')}
          onChange={(e) => updateItem(selectedArrow.id, { label: e.target.value })}
          onFocus={() => setEditingLabel?.(true)}
          onBlur={() => {
            setEditingLabel?.(false)
            notifyChangeComplete?.(selectedArrow)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === 'Escape') {
              e.preventDefault()
              setEditingLabel?.(false)
              e.currentTarget.blur()
              notifyChangeComplete?.(selectedArrow)
            }
          }}
          style={getInputStyle()}
        />
      )}

      {isTextContext && (
        <>
          {dividerEl}
          <PixelSelect label={labels?.fontSize ?? 'Size'} control="font-size" value={selectedText ? (selectedText.initialFontSize ?? fontSize ?? 16) : (fontSize ?? 16)} options={fontSizeOptions ?? DEFAULT_FONT_SIZE_OPTIONS} onChange={(val) => setFontSize?.(val)} unstyled={unstyled} classNames={classNames} styles={styles} icons={icons} />
          <button type="button" data-active={isBold || undefined} title={labels?.textBold ?? 'Toggle bold'} aria-pressed={isBold} className={getToggleBtnClass(isBold)} onClick={() => setFontWeight?.(isBold ? 'normal' : 'bold')} style={getToggleBtnStyle(isBold, true)}>
            {icons?.textBold ?? DEFAULT_ICONS.textBold ?? labels?.textBold ?? 'B'}
          </button>
          {selectedText && (
            <input
              ref={textInputRef}
              type="text"
              data-tual-text-input={selectedText.id}
              data-testid="text-input"
              data-editing-label={isEditingLabel ? 'true' : undefined}
              placeholder={labels?.textPlaceholder ?? 'Text...'}
              value={selectedText.text ?? ''}
              className={['rlc-toolbar-input', classNames?.toolbarInput].filter(Boolean).join(' ')}
              onChange={(e) => updateItem(selectedText.id, { text: e.target.value })}
              onFocus={() => setEditingLabel?.(true)}
              onBlur={(e) => {
                const next = e.relatedTarget as HTMLElement | null
                if (
                  next?.tagName === 'INPUT' ||
                  next?.tagName === 'TEXTAREA' ||
                  next?.closest('[data-tual-text], [data-tual-toolbar]')
                ) {
                  return
                }
                setEditingLabel?.(false)
                notifyChangeComplete?.(selectedText)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') {
                  e.preventDefault()
                  setEditingLabel?.(false)
                  e.currentTarget.blur()
                  notifyChangeComplete?.(selectedText)
                }
              }}
              style={getInputStyle('120px')}
            />
          )}
        </>
      )}

      {isNoteContext && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ opacity: 0.75, fontSize: '11px' }}>{labels?.noteTheme ?? 'Theme'}</span>
          {NOTE_COLOR_THEMES.map((theme) => {
            const selected = (selectedItem?.type === 'note' ? selectedItem.backgroundColor : noteColor) === theme.bg
            return (
              <button
                key={theme.name}
                type="button"
                title={theme.name}
                data-active={selected || undefined}
                className={['rlc-swatch-btn', classNames?.swatchButton, selected ? classNames?.swatchButtonActive : undefined].filter(Boolean).join(' ')}
                onClick={() => setNoteColor(theme.bg)}
                style={{ backgroundColor: theme.header, ...(unstyled ? {} : { width: '18px', height: '18px', borderRadius: '999px', border: selected ? '2px solid #111827' : `1px solid ${theme.border}`, boxShadow: selected ? '0 0 0 1px #111827' : 'none', cursor: 'pointer', padding: 0 }), ...styles?.swatchButton, ...(selected ? styles?.swatchButtonActive : undefined) }}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
