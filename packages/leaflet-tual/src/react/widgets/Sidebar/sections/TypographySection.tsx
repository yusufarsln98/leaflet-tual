'use client'

import type {
  Controller,
  FontWeight,
  Item,
  LabelPosition,
  ShapeItem,
  Style,
} from '../../../../core/index.js'
import { resolveSize, WEIGHT_OPTIONS } from '../../../../core/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import { Collapsible, NumberField, PropertyRow, Select } from '../../../ui/index.js'
import { TextFormattingControls } from '../../SecondaryTooltip/typography/TextFormattingControls.js'

export interface TypographySectionProps {
  selectedItem: Item
  style: Style
  controller: Controller
  onUpdateStyle: (patch: Partial<Style>) => void
}

export function TypographySection({
  selectedItem,
  style,
  controller,
  onUpdateStyle,
}: TypographySectionProps) {
  const { t } = useTranslation(controller)
  const isShape = selectedItem.type === 'shape'
  const isArrow = selectedItem.type === 'arrow'
  const isNote = selectedItem.type === 'note'
  const isTextOrNote = isNote || selectedItem.type === 'text'
  const hasTypography = isTextOrNote || isShape || isArrow

  if (!hasTypography) return null

  const effectivePx = resolveSize(style.size ?? 'm', style.fontSize)

  const currentText =
    selectedItem.type === 'note' || selectedItem.type === 'text'
      ? selectedItem.text ?? ''
      : selectedItem.type === 'shape' || selectedItem.type === 'arrow'
      ? selectedItem.label ?? ''
      : ''

  const handleUpdateText = (newText: string, newStyle: Partial<Style>) => {
    if (selectedItem.type === 'note' || selectedItem.type === 'text') {
      controller.update(selectedItem.id, { text: newText, style: { ...style, ...newStyle } })
    } else if (selectedItem.type === 'shape' || selectedItem.type === 'arrow') {
      controller.update(selectedItem.id, { label: newText, style: { ...style, ...newStyle } })
    }
  }

  const labelPositionOptions: Array<{ value: LabelPosition; label: string }> = [
    { value: 'top', label: t('top') },
    { value: 'center', label: t('center') },
    { value: 'bottom', label: t('bottom') },
  ]

  return (
    <Collapsible title={t('typography')} className="tual-sidebar-section">
      <PropertyRow label={t('fontSize')}>
        <NumberField
          aria-label={t('fontSizePx')}
          min={8}
          max={144}
          step={1}
          value={effectivePx}
          unit="px"
          wrapperClassName="tual-sidebar-input-field"
          className="tual-sidebar-number-input"
          onChange={(px) =>
            onUpdateStyle({ fontSize: Math.max(8, Math.min(144, Math.round(px))) })
          }
        />
      </PropertyRow>

      <PropertyRow label={t('weight')}>
        <Select
          ariaLabel={t('fontWeight')}
          title={t('fontWeight')}
          value={typeof style.weight === 'string' ? style.weight : 'regular'}
          options={WEIGHT_OPTIONS.map((w) => ({
            value: w.id,
            label: t(w.id, undefined, w.label),
          }))}
          align="start"
          className="tual-sidebar-select-field"
          onChange={(weight) => onUpdateStyle({ weight: weight as FontWeight })}
        />
      </PropertyRow>

      {isTextOrNote && (
        <PropertyRow label={t('align')} controlClassName="tual-sidebar-formatting-row">
          <TextFormattingControls
            style={style}
            currentText={currentText}
            onUpdateStyle={onUpdateStyle}
            onUpdateText={handleUpdateText}
          />
        </PropertyRow>
      )}

      {isShape && (
        <PropertyRow label={t('labelPosition')}>
          <Select
            ariaLabel={t('labelPosition')}
            title={t('labelPosition')}
            value={(selectedItem as ShapeItem).labelPosition ?? 'center'}
            options={labelPositionOptions}
            align="start"
            className="tual-sidebar-select-field"
            onChange={(p) => controller.update(selectedItem.id, { labelPosition: p })}
          />
        </PropertyRow>
      )}
    </Collapsible>
  )
}

