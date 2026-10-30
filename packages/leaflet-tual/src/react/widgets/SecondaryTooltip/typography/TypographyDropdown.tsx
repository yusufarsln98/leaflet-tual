'use client'

import { useState } from 'react'
import type { FontWeight, Style } from '../../../../core/index.js'
import { resolveSize, THEME_PRESETS, WEIGHT_OPTIONS } from '../../../../core/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import {
  Button,
  DropdownItem,
  DropdownMenu,
  NumberField,
  Popover,
  SegmentedControl,
  Select,
} from '../../../ui/index.js'

export { THEME_PRESETS, WEIGHT_OPTIONS } from '../../../../core/index.js'

export interface TypographyDropdownProps {
  currentSize?: Style['size']
  currentFontSize?: number
  currentWeight?: Style['weight']
  currentFontStyle?: Style['fontStyle']
  currentUnderline?: boolean
  currentAlign?: Style['align']
  onUpdateStyle: (patch: Partial<Style>) => void
  onClose: () => void
}

export function TypographyDropdown({
  currentSize = 'm',
  currentFontSize,
  currentWeight = 'regular',
  currentFontStyle = 'normal',
  currentUnderline = false,
  onUpdateStyle,
}: TypographyDropdownProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'theme' | 'custom'>(
    currentFontSize ? 'custom' : 'theme',
  )

  const effectivePx = resolveSize(currentSize, currentFontSize)

  const handleSelectPreset = (presetId: NonNullable<Style['size']>) =>
    onUpdateStyle({ size: presetId, fontSize: undefined })
  const handleCustomPxChange = (px: number) =>
    onUpdateStyle({ fontSize: Math.max(8, Math.min(144, Math.round(px))) })
  const handleWeightChange = (w: FontWeight) => onUpdateStyle({ weight: w })
  const handleFontStyleChange = (fs: 'normal' | 'italic') =>
    onUpdateStyle({ fontStyle: fs })
  const handleUnderlineToggle = () =>
    onUpdateStyle({
      underline: !currentUnderline,
      textDecoration: !currentUnderline ? 'underline' : 'none',
    })

  return (
    <Popover variant="typography">
      <SegmentedControl
        variant="pill-tabs"
        value={activeTab}
        options={[
          { value: 'theme', label: t('theme', undefined, 'Theme') },
          { value: 'custom', label: t('custom', undefined, 'Custom') },
        ]}
        onChange={setActiveTab}
      />

      {activeTab === 'theme' ? (
        <DropdownMenu layout="typo-list">
          {THEME_PRESETS.map((p) => {
            const isSelected =
              !currentFontSize && (currentSize === p.id || (p.id === 'm' && !currentSize))
            return (
              <DropdownItem
                key={p.id}
                variant="typo"
                data-size={String(p.id)}
                selected={isSelected}
                label={t(p.id, undefined, p.label)}
                meta={`${p.px}px`}
                onClick={() => handleSelectPreset(p.id)}
              />
            )
          })}
        </DropdownMenu>
      ) : (
        <div className="tual-typo-custom-panel">
          <div className="tual-typo-fields-row" onPointerDown={(e) => e.stopPropagation()}>
            <Select
              ariaLabel={t('fontWeight')}
              title={t('fontWeight')}
              value={typeof currentWeight === 'string' ? currentWeight : 'regular'}
              options={WEIGHT_OPTIONS.map((weight) => ({
                value: weight.id,
                label: t(weight.id, undefined, weight.label),
              }))}
              onChange={(weight) => handleWeightChange(weight as FontWeight)}
              align="start"
              className="tual-typo-weight-field"
            />

            <NumberField
              aria-label={t('fontSizePx')}
              min={8}
              max={144}
              step={1}
              value={effectivePx}
              unit="px"
              onChange={handleCustomPxChange}
            />
          </div>

          <div className="tual-typo-styles-row">
            <Button
              variant="style-toggle"
              active={!currentFontStyle || currentFontStyle === 'normal'}
              onClick={() => handleFontStyleChange('normal')}
            >
              {t('normal')}
            </Button>
            <Button
              variant="style-toggle"
              active={currentFontStyle === 'italic'}
              style={{ fontStyle: 'italic' }}
              onClick={() => handleFontStyleChange('italic')}
            >
              {t('italic')}
            </Button>
            <Button
              variant="style-toggle"
              active={currentUnderline}
              style={{ textDecoration: 'underline' }}
              onClick={handleUnderlineToggle}
            >
              {t('underline')}
            </Button>
          </div>
        </div>
      )}
    </Popover>
  )
}
