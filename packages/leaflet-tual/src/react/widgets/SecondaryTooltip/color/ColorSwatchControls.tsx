'use client'

import type L from 'leaflet'
import type { ResolvedItemStyle, Style } from '../../../../core/index.js'
import { resolveColor } from '../../../../core/index.js'
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
    const textColor = resolvedStyle?.text.color ?? resolveColor(style.textColor ?? 'ink')
    const backgroundColor =
      resolvedStyle?.fillColor ?? resolveColor(style.fillColor ?? style.color ?? 'yellow')

    return (
      <>
        <div style={{ position: 'relative' }}>
          <ColorSwatch
            variant="secondary-button"
            colorHex={textColor}
            title={t('textColor')}
            onClick={() => onToggle('textColor')}
          />
          {activePopover === 'textColor' && (
            <ColorDropdown
              map={map}
              title={t('textColor')}
              mode="stroke"
              currentColor={style.textColor ?? 'ink'}
              onSelectColor={(c) => onUpdateStyle({ textColor: c })}
              onClose={onClose}
            />
          )}
        </div>
        <div style={{ position: 'relative' }}>
          <ColorSwatch
            variant="secondary-button"
            colorHex={backgroundColor}
            noFill={style.fill === 'none'}
            title={t('color')}
            onClick={() => onToggle('color')}
          />
          {activePopover === 'color' && (
            <ColorDropdown
              map={map}
              title={t('color')}
              mode="fill"
              currentColor={style.fillColor ?? style.color ?? 'yellow'}
              currentOpacity={style.opacity}
              currentFill={style.fill}
              onSelectColor={(c, _hex, opacity) => {
                onUpdateStyle({
                  color: c,
                  fillColor: c,
                  ...(opacity !== undefined ? { opacity } : {}),
                })
              }}
              onSelectFillMode={(mode) => onUpdateStyle({ fill: mode })}
              onClose={onClose}
            />
          )}
        </div>
      </>
    )
  }

  const shapeOrArrowColor = style.color ?? (isShape || isArrow ? 'blue' : 'ink')
  const itemColor = isShape ? (style.fillColor ?? shapeOrArrowColor) : shapeOrArrowColor
  const itemOpacity = style.opacity ?? (isShape ? 0.5 : 1)

  return (
    <div style={{ position: 'relative' }}>
      <ColorSwatch
        variant="secondary-button"
        colorHex={colorHex}
        noFill={style.fill === 'none'}
        title={t('color')}
        onClick={() => onToggle('color')}
      />
      {activePopover === 'color' && (
        <ColorDropdown
          map={map}
          title={t('color')}
          mode={isShape ? 'fill' : 'stroke'}
          currentColor={itemColor}
          currentOpacity={itemOpacity}
          currentFill={style.fill}
          onSelectColor={(c, _hex, opacity) => {
            const nextStyle: Partial<Style> = {
              color: c,
              ...(opacity !== undefined ? { opacity } : {}),
            }
            if (isShape) {
              nextStyle.fillColor = c
              nextStyle.strokeColor = c
            } else if (isArrow) {
              nextStyle.strokeColor = c
            }
            if (style.fill === 'none') {
              nextStyle.fill = 'solid'
            }
            onUpdateStyle(nextStyle)
          }}
          onSelectFillMode={(mode) => onUpdateStyle({ fill: mode })}
          onClose={onClose}
        />
      )}
    </div>
  )
}
