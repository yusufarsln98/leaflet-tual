'use client'

import type L from 'leaflet'
import type { ColorName, Item, ShapeItem, Style } from '../../../../core/index.js'
import { resolveColor, resolveItemStyle, resolveWidth } from '../../../../core/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import { Collapsible, NumberField, PropertyRow, Select } from '../../../ui/index.js'
import { ColorFieldRow } from './ColorFieldRow.js'

export interface FillStrokeSectionProps {
  map?: L.Map
  selectedItem: Item
  style: Style
  scheme: 'light' | 'dark'
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
  scheme,
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

  const visual = isBoxItem ? resolveItemStyle(selectedItem, 'light') : null

  const strokeColorKey =
    isText || (isNote && !style.strokeColor)
      ? style.textColor ?? style.color ?? (isNote ? 'yellow' : 'ink')
      : style.strokeColor ?? style.color ?? (isShape || isArrow ? 'blue' : 'ink')
  const strokeHex = isText
    ? resolveColor(style.textColor ?? style.color ?? 'ink', 'light')
    : visual?.strokeColor ?? resolveColor(strokeColorKey, 'light')

  const textColorKey = style.textColor ?? 'ink'
  const textHex = visual?.text.color ?? resolveColor(textColorKey, 'light')

  const fillColorKey = style.fillColor ?? style.color ?? (isNote ? 'yellow' : 'blue')
  const fillHex = visual?.fillColor ?? resolveColor(fillColorKey, 'light')
  const fillMode = style.fill ?? 'solid'
  const hasNoFill = isBoxItem && fillMode === 'none'

  const numWidth = visual?.strokeWidth ?? resolveWidth(style.width ?? 'm')
  const opacity = visual?.opacity ?? style.opacity ?? 1

  const dashOptions = DASH_KEYS.map((value) => ({
    value,
    label: value === 'none' ? t('noBorder') : t(value),
  }))

  const handleStrokeColor = (color: ColorName | string) => {
    if (isShape) {
      onUpdateStyle({ strokeColor: color, ...(style.color ? {} : { color }) })
    } else if (isNote) {
      onUpdateStyle({ strokeColor: color })
    } else if (isArrow) {
      onUpdateStyle({ color, strokeColor: color })
    } else {
      onUpdateStyle({ color })
    }
  }

  const handleFillColor = (color: ColorName | string) => {
    onUpdateStyle({
      color,
      fillColor: color,
      ...(isNote ? {} : { strokeColor: style.strokeColor ?? color }),
      ...(fillMode === 'none' ? { fill: 'solid' as const } : {}),
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
        mode="stroke"
        currentColor={strokeColorKey}
        scheme={scheme}
        colorHex={strokeHex}
        onSelectColor={handleStrokeColor}
      />

      {isBoxItem && (
        <ColorFieldRow
          map={map}
          label={t('textColor')}
          title={t('textColor')}
          mode="stroke"
          currentColor={textColorKey}
          scheme={scheme}
          colorHex={textHex}
          onSelectColor={(color) => onUpdateStyle({ textColor: color })}
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
          mode="fill"
          currentColor={fillColorKey}
          currentFill={fillMode}
          scheme={scheme}
          colorHex={fillHex}
          value={hasNoFill ? t('noFill') : undefined}
          noFill={hasNoFill}
          onSelectColor={handleFillColor}
          onSelectFillMode={(mode) => onUpdateStyle({ fill: mode })}
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

