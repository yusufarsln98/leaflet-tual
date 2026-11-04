'use client'

import type L from 'leaflet'
import type { Item, ShapeItem, Style } from '../../../../core/index.js'
import {
  DEFAULT_PALETTE,
  isTransparentColor,
  resolveColor,
  resolveItemStyle,
  resolveWidth,
} from '../../../../core/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import { Collapsible, NumberField, PropertyRow, Select } from '../../../ui/index.js'
import { ColorFieldRow } from './ColorFieldRow.js'

export interface FillStrokeSectionProps {
  map?: L.Map
  selectedItem: Item
  style: Style
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onUpdateStyle: (patch: Partial<Style>) => void
}

const RADIUS_OPTIONS = [0, 8, 16].map((radius) => ({
  value: radius,
  label: String(radius),
}))

const DASH_KEYS = ['solid', 'dashed', 'dotted', 'none'] as const

export function FillStrokeSection({
  map,
  selectedItem,
  style,
  open,
  onOpenChange,
  onUpdateStyle,
}: FillStrokeSectionProps) {
  const { t } = useTranslation()
  const isShape = selectedItem.type === 'shape'
  const isArrow = selectedItem.type === 'arrow'
  const isNote = selectedItem.type === 'note'
  const isText = selectedItem.type === 'text'
  const isSquareShape = isShape && (selectedItem as ShapeItem).kind === 'square'
  const isBoxItem = isShape || isNote
  const hasBorder = !isText

  const visual = isBoxItem ? resolveItemStyle(selectedItem) : null

  const strokeColorKey =
    isText || (isNote && !style.strokeColor)
      ? style.textColor ?? style.color ?? (isNote ? DEFAULT_PALETTE.yellow : DEFAULT_PALETTE.ink)
      : style.strokeColor ??
        style.color ??
        (isShape || isArrow ? DEFAULT_PALETTE.blue : DEFAULT_PALETTE.ink)
  const strokeHex = isText
    ? resolveColor(style.textColor ?? style.color ?? DEFAULT_PALETTE.ink)
    : visual?.strokeColor ?? resolveColor(strokeColorKey)

  const textColorKey = style.textColor ?? DEFAULT_PALETTE.ink
  const textHex = visual?.text.color ?? resolveColor(textColorKey)

  const hasNoFill = isBoxItem && isTransparentColor(style.fillColor)
  const fillColorKey =
    style.fillColor && !hasNoFill
      ? style.fillColor
      : style.color ?? (isNote ? DEFAULT_PALETTE.yellow : DEFAULT_PALETTE.blue)
  const fillHex = hasNoFill
    ? resolveColor(fillColorKey)
    : visual?.fillColor ?? resolveColor(fillColorKey)

  const numWidth = visual?.strokeWidth ?? resolveWidth(style.width ?? 'm')
  const opacity = visual?.opacity ?? style.opacity ?? 1

  const dashOptions = DASH_KEYS.map((value) => ({
    value,
    label: value === 'none' ? t('noBorder') : t(value),
  }))

  const handleStrokeColor = (color: string, op?: number) => {
    const patch: Partial<Style> = {
      ...(op !== undefined ? { opacity: op } : {}),
    }
    if (isShape) {
      onUpdateStyle({ strokeColor: color, ...(style.color ? {} : { color }), ...patch })
    } else if (isNote) {
      onUpdateStyle({ strokeColor: color, ...patch })
    } else if (isArrow) {
      onUpdateStyle({ color, strokeColor: color, ...patch })
    } else {
      onUpdateStyle({ color, ...patch })
    }
  }

  const handleFillColor = (color: string, op?: number) => {
    onUpdateStyle({
      color,
      fillColor: color,
      ...(op !== undefined ? { opacity: op } : {}),
      ...(isNote ? {} : { strokeColor: style.strokeColor ?? color }),
    })
  }

  return (
    <Collapsible
      title={t('fillAndStroke')}
      className="tual-sidebar-section"
      open={open}
      onOpenChange={onOpenChange}
    >
      <ColorFieldRow
        map={map}
        label={isText ? t('textColor') : t('stroke')}
        title={isText ? t('textColor') : t('stroke')}
        currentColor={strokeColorKey}
        currentOpacity={opacity}
        colorHex={strokeHex}
        onSelectColor={(hex, op) => handleStrokeColor(hex, op)}
      />

      {isBoxItem && (
        <ColorFieldRow
          map={map}
          label={t('textColor')}
          title={t('textColor')}
          currentColor={textColorKey}
          colorHex={textHex}
          onSelectColor={(hex) => onUpdateStyle({ textColor: hex })}
        />
      )}

      {hasBorder && (
        <PropertyRow label={t('thickness')}>
          <NumberField
            aria-label={t('strokeWidth')}
            min={0}
            max={32}
            step={1}
            value={numWidth}
            wrapperClassName="tual-sidebar-input-field"
            className="tual-sidebar-number-input"
            onChange={(width) => onUpdateStyle({ width: Math.max(0, width) })}
          />
        </PropertyRow>
      )}

      {isBoxItem && (
        <ColorFieldRow
          map={map}
          label={t('fill')}
          title={t('fill')}
          currentColor={fillColorKey}
          currentOpacity={opacity}
          colorHex={fillHex}
          value={hasNoFill ? t('noFill') : undefined}
          noFill={hasNoFill}
          allowNoFill
          onSelectColor={(hex, op) => handleFillColor(hex, op)}
          onSelectNoFill={() => onUpdateStyle({ fillColor: 'transparent' })}
        />
      )}

      {hasBorder && (
        <PropertyRow label={t('borderStyle')}>
          <Select
            ariaLabel={t('strokeDash')}
            title={t('strokeDash')}
            value={style.dash ?? 'solid'}
            options={dashOptions}
            align="start"
            className="tual-sidebar-select-field"
            onChange={(dash) => onUpdateStyle({ dash })}
          />
        </PropertyRow>
      )}

      {(isNote || isSquareShape) && (
        <PropertyRow label={t('cornerRadius')}>
          <Select
            ariaLabel={t('cornerRadius')}
            title={t('cornerRadius')}
            value={style.radius ?? 8}
            options={RADIUS_OPTIONS}
            unit="px"
            align="start"
            className="tual-sidebar-select-field"
            onChange={(radius) => onUpdateStyle({ radius })}
          />
        </PropertyRow>
      )}

      <PropertyRow label={t('opacity')}>
        <NumberField
          aria-label={t('opacity')}
          min={0}
          max={1}
          step={0.1}
          value={opacity}
          wrapperClassName="tual-sidebar-input-field"
          className="tual-sidebar-number-input"
          onChange={(val) =>
            onUpdateStyle({ opacity: Math.max(0, Math.min(1, Math.round(val * 100) / 100)) })
          }
        />
      </PropertyRow>
    </Collapsible>
  )
}

