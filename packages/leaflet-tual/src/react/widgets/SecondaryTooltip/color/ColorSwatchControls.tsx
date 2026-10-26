'use client'

import type L from 'leaflet'
import type { ColorName, Style } from '../../../../core/index.js'
import { resolveColor, resolveNoteColors } from '../../../../core/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import { ColorSwatch } from '../../../ui/index.js'
import { ColorDropdown } from './ColorDropdown.js'

export interface ColorSwatchControlsProps {
  map?: L.Map
  isNote: boolean
  isShape: boolean
  isArrow?: boolean
  style: Style
  scheme: 'light' | 'dark'
  colorHex: string
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
  scheme,
  colorHex,
  activePopover,
  onToggle,
  onClose,
  onUpdateStyle,
}: ColorSwatchControlsProps) {
  const { t } = useTranslation()

  if (isNote) {
    const noteColors = resolveNoteColors(
      style.color ?? 'yellow',
      'light',
      style.textColor,
      style.fillColor,
    )
    return (
      <>
        <div style={{ position: 'relative' }}>
          <ColorSwatch
            variant="secondary-button"
            colorHex={resolveColor(style.textColor ?? 'ink', 'light')}
            title={t('textColor')}
            onClick={() => onToggle('textColor')}
          />
          {activePopover === 'textColor' && (
            <ColorDropdown
              map={map}
              title={t('textColor')}
              mode="stroke"
              currentColor={style.textColor ?? 'ink'}
              scheme={scheme}
              onSelectColor={(c) => onUpdateStyle({ textColor: c })}
              onClose={onClose}
            />
          )}
        </div>
        <div style={{ position: 'relative' }}>
          <ColorSwatch
            variant="secondary-button"
            colorHex={noteColors.bg}
            title={t('backgroundColor')}
            onClick={() => onToggle('bgColor')}
          />
          {activePopover === 'bgColor' && (
            <ColorDropdown
              map={map}
              title={t('backgroundColor')}
              mode="fill"
              currentColor={style.fillColor ?? style.color ?? 'yellow'}
              scheme={scheme}
              onSelectColor={(c: ColorName | string) => onUpdateStyle({ fillColor: c, color: c })}
              onClose={onClose}
            />
          )}
        </div>
      </>
    )
  }

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
          currentColor={style.color}
          currentFill={style.fill}
          scheme={scheme}
          onSelectColor={(c) => {
            const nextStyle: Partial<Style> = { color: c }
            // Shapes paint both fill and stroke from their primary color, while
            // arrows only have a stroke. Mirror the color into those dedicated
            // fields so their defaults cannot override the user's selection.
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
