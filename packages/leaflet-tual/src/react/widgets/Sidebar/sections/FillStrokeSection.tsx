'use client'

import { useEffect, useRef, useState } from 'react'
import type L from 'leaflet'
import type { ColorName, Item, ShapeItem, Style } from '../../../../core/index.js'
import { resolveColor, resolveNoteColors, resolveWidth } from '../../../../core/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import { NumberField, Select } from '../../../ui/index.js'
import { ColorDropdown } from '../../SecondaryTooltip/color/ColorDropdown.js'

export interface FillStrokeSectionProps {
  map?: L.Map
  selectedItem: Item
  style: Style
  scheme: 'light' | 'dark'
  onUpdateStyle: (patch: Partial<Style>) => void
}

const RADIUS_OPTIONS = [0, 8, 16].map((radius) => ({
  value: radius,
  label: String(radius),
}))

export function FillStrokeSection({
  map,
  selectedItem,
  style,
  scheme,
  onUpdateStyle,
}: FillStrokeSectionProps) {
  const { t } = useTranslation()
  const [openColorPicker, setOpenColorPicker] = useState<'stroke' | 'fill' | 'text' | null>(null)
  const strokeControlRef = useRef<HTMLDivElement>(null)
  const textControlRef = useRef<HTMLDivElement>(null)
  const fillControlRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!openColorPicker) return

    const activeRef =
      openColorPicker === 'stroke'
        ? strokeControlRef
        : openColorPicker === 'text'
          ? textControlRef
          : fillControlRef

    const handlePointerDownOutside = (e: MouseEvent | PointerEvent) => {
      const target = e.target as Node | null
      if (activeRef.current && target && !activeRef.current.contains(target)) {
        setOpenColorPicker(null)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenColorPicker(null)
      }
    }

    document.addEventListener('pointerdown', handlePointerDownOutside, true)
    document.addEventListener('mousedown', handlePointerDownOutside, true)
    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDownOutside, true)
      document.removeEventListener('mousedown', handlePointerDownOutside, true)
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [openColorPicker])

  const isShape = selectedItem.type === 'shape'
  const isArrow = selectedItem.type === 'arrow'
  const isNote = selectedItem.type === 'note'
  const isText = selectedItem.type === 'text'
  const isSquareShape = isShape && (selectedItem as ShapeItem).kind === 'square'
  const hasBorder =
    isShape ||
    isNote ||
    isArrow ||
    selectedItem.type === 'ruler' ||
    selectedItem.type === 'freedraw' ||
    selectedItem.type === 'pen'

  const strokeColorKey = isText || isNote
    ? (style.textColor ?? (isText ? style.color : undefined) ?? 'ink')
    : (style.strokeColor ?? style.color ?? (isShape || isArrow ? 'blue' : 'ink'))
  const strokeHex = resolveColor(strokeColorKey, 'light')

  const fillColorKey = isNote
    ? (style.fillColor ?? style.color ?? 'yellow')
    : (style.fillColor ?? style.color ?? 'blue')
  const fillHex = isNote
    ? resolveNoteColors(style.color ?? 'yellow', 'light', style.textColor, style.fillColor).bg
    : resolveColor(fillColorKey, 'light')

  const numWidth = resolveWidth(isNote ? (style.width ?? 's') : (style.width ?? 'm'))
  const dashOptions: Array<{ value: 'solid' | 'dashed' | 'dotted' | 'none'; label: string }> = [
    { value: 'solid', label: t('solid') },
    { value: 'dashed', label: t('dashed') },
    { value: 'dotted', label: t('dotted') },
    { value: 'none', label: t('noBorder') },
  ]

  const togglePicker = (which: 'stroke' | 'fill' | 'text') => {
    setOpenColorPicker((prev) => (prev === which ? null : which))
  }

  return (
    <div className="tual-sidebar-section">
      <div className="tual-sidebar-section-title">{t('fillAndStroke')}</div>

      {/* Primary Stroke / Text Color Row */}
      {!isNote && (
        <div className="tual-sidebar-prop-row">
          <span className="tual-sidebar-prop-label">
            {isText ? t('textColor') : t('stroke')}
          </span>
          <div
            ref={strokeControlRef}
            className="tual-sidebar-prop-control"
            style={{ position: 'relative' }}
          >
            <button
              type="button"
              className="tual-sidebar-color-field"
              title={isText ? t('textColor') : t('stroke')}
              onClick={() => togglePicker('stroke')}
            >
              <span
                className="tual-sidebar-color-swatch"
                style={{ backgroundColor: strokeHex }}
              />
              <span className="tual-sidebar-color-hex">{strokeHex.toUpperCase()}</span>
            </button>
            {openColorPicker === 'stroke' && (
              <div className="tual-sidebar-popover-anchor">
                <ColorDropdown
                  map={map}
                  title={isText ? t('textColor') : t('stroke')}
                  mode="stroke"
                  currentColor={strokeColorKey}
                  scheme={scheme}
                  onSelectColor={(c: ColorName | string) => {
                    if (isShape) {
                      onUpdateStyle({ strokeColor: c, ...(style.color ? {} : { color: c }) })
                    } else if (isArrow) {
                      onUpdateStyle({ color: c, strokeColor: c })
                    } else {
                      onUpdateStyle({ color: c })
                    }
                  }}
                  onClose={() => setOpenColorPicker(null)}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Note Text Color Row */}
      {isNote && (
        <div className="tual-sidebar-prop-row">
          <span className="tual-sidebar-prop-label">{t('textColor')}</span>
          <div
            ref={textControlRef}
            className="tual-sidebar-prop-control"
            style={{ position: 'relative' }}
          >
            <button
              type="button"
              className="tual-sidebar-color-field"
              title={t('textColor')}
              onClick={() => togglePicker('text')}
            >
              <span
                className="tual-sidebar-color-swatch"
                style={{ backgroundColor: strokeHex }}
              />
              <span className="tual-sidebar-color-hex">{strokeHex.toUpperCase()}</span>
            </button>
            {openColorPicker === 'text' && (
              <div className="tual-sidebar-popover-anchor">
                <ColorDropdown
                  map={map}
                  title={t('textColor')}
                  mode="stroke"
                  currentColor={style.textColor ?? 'ink'}
                  scheme={scheme}
                  onSelectColor={(c: ColorName | string) => onUpdateStyle({ textColor: c })}
                  onClose={() => setOpenColorPicker(null)}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Thickness Row */}
      {hasBorder && (
        <div className="tual-sidebar-prop-row">
          <span className="tual-sidebar-prop-label">{t('thickness')}</span>
          <div className="tual-sidebar-prop-control">
            <NumberField
              aria-label={t('strokeWidth')}
              min={0}
              max={32}
              value={numWidth}
              wrapperClassName="tual-sidebar-input-field"
              className="tual-sidebar-number-input"
              onChange={(w) => onUpdateStyle({ width: Math.max(0, w) })}
            />
          </div>
        </div>
      )}

      {/* Fill / Background Color Row */}
      {(isShape || isNote) && (
        <div className="tual-sidebar-prop-row">
          <span className="tual-sidebar-prop-label">
            {isNote ? t('backgroundColor') : t('fill')}
          </span>
          <div
            ref={fillControlRef}
            className="tual-sidebar-prop-control"
            style={{ position: 'relative' }}
          >
            <button
              type="button"
              className="tual-sidebar-color-field"
              title={isNote ? t('backgroundColor') : t('color')}
              onClick={() => togglePicker('fill')}
            >
              <span
                className={
                  isShape && style.fill === 'none'
                    ? 'tual-no-fill-swatch'
                    : 'tual-sidebar-color-swatch'
                }
                style={
                  isShape && style.fill === 'none'
                    ? undefined
                    : { backgroundColor: fillHex }
                }
              />
              <span className="tual-sidebar-color-hex">
                {isShape && style.fill === 'none' ? t('noFill') : fillHex.toUpperCase()}
              </span>
            </button>
            {openColorPicker === 'fill' && (
              <div className="tual-sidebar-popover-anchor">
                <ColorDropdown
                  map={map}
                  title={isNote ? t('backgroundColor') : t('color')}
                  mode="fill"
                  currentColor={fillColorKey}
                  currentFill={style.fill}
                  scheme={scheme}
                  onSelectColor={(c: ColorName | string) => {
                    if (isNote) {
                      onUpdateStyle({ fillColor: c, color: c })
                    } else {
                      const nextStyle: Partial<Style> = {
                        color: c,
                        fillColor: c,
                        strokeColor: style.strokeColor ?? c,
                      }
                      if (style.fill === 'none') {
                        nextStyle.fill = 'solid'
                      }
                      onUpdateStyle(nextStyle)
                    }
                  }}
                  onSelectFillMode={
                    isShape ? (mode) => onUpdateStyle({ fill: mode }) : undefined
                  }
                  onClose={() => setOpenColorPicker(null)}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dash / Border Style Row */}
      {hasBorder && (
        <div className="tual-sidebar-prop-row">
          <span className="tual-sidebar-prop-label">{t('borderStyle')}</span>
          <div className="tual-sidebar-prop-control">
            <Select
              ariaLabel={t('strokeDash')}
              title={t('strokeDash')}
              value={style.dash ?? 'solid'}
              options={dashOptions}
              align="start"
              className="tual-sidebar-select-field"
              onChange={(d) => onUpdateStyle({ dash: d })}
            />
          </div>
        </div>
      )}

      {/* Corner Radius Row */}
      {(isSquareShape || isNote) && (
        <div className="tual-sidebar-prop-row">
          <span className="tual-sidebar-prop-label">{t('cornerRadius')}</span>
          <div className="tual-sidebar-prop-control">
            <Select
              ariaLabel={t('cornerRadius')}
              title={t('cornerRadius')}
              value={style.radius ?? 8}
              options={RADIUS_OPTIONS}
              unit="px"
              align="start"
              className="tual-sidebar-select-field"
              onChange={(r) => onUpdateStyle({ radius: r })}
            />
          </div>
        </div>
      )}
    </div>
  )
}

