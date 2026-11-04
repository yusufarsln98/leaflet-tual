'use client'

import type L from 'leaflet'
import type { ResolvedItemStyle, Style } from '../../../../core/index.js'
import { DEFAULT_PALETTE, isTransparentColor, resolveColor } from '../../../../core/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import { ColorSwatch } from '../../../ui/index.js'
import { ColorDropdown } from './ColorDropdown.js'

export interface ColorSwatchControlsProps {
  map?: L.Map
  isNote: boolean
  isShape: boolean
  isArrow?: boolean
  style: Style
  colorHex: string
  resolvedStyle?: ResolvedItemStyle
  activePopover: string | null
  onToggle: (popoverName: string) => void
  onClose: () => void
  onUpdateStyle: (patch: Partial<Style>) => void
}

export function ColorSwatchControls({
  map,
  isNote,
  isShape,
  isArrow,
  style,
  colorHex,
  resolvedStyle,
  activePopover,
  onToggle,
  onClose,
  onUpdateStyle,
}: ColorSwatchControlsProps) {
  const { t } = useTranslation()

  if (isNote) {
    const textColor =
      resolvedStyle?.text.color ?? resolveColor(style.textColor ?? DEFAULT_PALETTE.ink)
    const noFill = isTransparentColor(style.fillColor)
    const backgroundColor = noFill
      ? resolveColor(style.color ?? DEFAULT_PALETTE.yellow)
      : resolvedStyle?.fillColor ??
        resolveColor(style.fillColor ?? style.color ?? DEFAULT_PALETTE.yellow)

    return (
      <>
        <div style={{ position: 'relative' }}>
          <ColorSwatch
            variant="secondary-button"
            colorHex={textColor}
            title={t('textColor')}
            selected={activePopover === 'textColor'}
            onClick={() => onToggle('textColor')}
          />
          {activePopover === 'textColor' && (
            <ColorDropdown
              map={map}
              title={t('textColor')}
              currentColor={style.textColor ?? DEFAULT_PALETTE.ink}
              onSelectColor={(hex) => onUpdateStyle({ textColor: hex })}
              onClose={onClose}
            />
          )}
        </div>
        <div style={{ position: 'relative' }}>
          <ColorSwatch
            variant="secondary-button"
            colorHex={backgroundColor}
            noFill={noFill}
            title={t('color')}
            selected={activePopover === 'color'}
            onClick={() => onToggle('color')}
          />
          {activePopover === 'color' && (
            <ColorDropdown
              map={map}
              title={t('color')}
              currentColor={
                noFill
                  ? style.color ?? DEFAULT_PALETTE.yellow
                  : style.fillColor ?? style.color ?? DEFAULT_PALETTE.yellow
              }
              currentOpacity={style.opacity}
              allowNoFill
              noFillSelected={noFill}
              onSelectColor={(hex, opacity) => {
                onUpdateStyle({
                  color: hex,
                  fillColor: hex,
                  ...(opacity !== undefined ? { opacity } : {}),
                })
              }}
              onSelectNoFill={() => onUpdateStyle({ fillColor: 'transparent' })}
              onClose={onClose}
            />
          )}
        </div>
      </>
    )
  }

  const shapeOrArrowColor =
    style.color ?? (isShape || isArrow ? DEFAULT_PALETTE.blue : DEFAULT_PALETTE.ink)
  const noFill = isShape && isTransparentColor(style.fillColor)
  const itemColor = isShape
    ? noFill
      ? shapeOrArrowColor
      : style.fillColor ?? shapeOrArrowColor
    : shapeOrArrowColor
  const itemOpacity = style.opacity ?? (isShape ? 0.5 : 1)

  return (
    <div style={{ position: 'relative' }}>
      <ColorSwatch
        variant="secondary-button"
        colorHex={colorHex}
        noFill={noFill}
        title={t('color')}
        selected={activePopover === 'color'}
        onClick={() => onToggle('color')}
      />
      {activePopover === 'color' && (
        <ColorDropdown
          map={map}
          title={t('color')}
          currentColor={itemColor}
          currentOpacity={itemOpacity}
          allowNoFill={isShape}
          noFillSelected={noFill}
          onSelectColor={(hex, opacity) => {
            const nextStyle: Partial<Style> = {
              color: hex,
              ...(opacity !== undefined ? { opacity } : {}),
            }
            if (isShape) {
              nextStyle.fillColor = hex
              nextStyle.strokeColor = hex
            } else if (isArrow) {
              nextStyle.strokeColor = hex
            }
            onUpdateStyle(nextStyle)
          }}
          onSelectNoFill={() => onUpdateStyle({ fillColor: 'transparent' })}
          onClose={onClose}
        />
      )}
    </div>
  )
}
