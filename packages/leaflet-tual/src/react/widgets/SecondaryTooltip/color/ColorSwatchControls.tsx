'use client'

import type L from 'leaflet'
import type { ColorName, Style } from '../../../../core/index.js'
import { resolveColor, resolveNoteColors } from '../../../../core/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import { ColorDropdown } from './ColorDropdown.js'

export interface ColorSwatchControlsProps {
  map?: L.Map
  isNote: boolean
  isShape: boolean
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
          <button
            type="button"
            className="tual-secondary-swatch-btn"
            title={t('textColor')}
            onClick={() => onToggle('textColor')}
          >
            <div
              className="tual-secondary-swatch-box"
              style={{ backgroundColor: resolveColor(style.textColor ?? 'ink', 'light') }}
            />
          </button>
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
          <button
            type="button"
            className="tual-secondary-swatch-btn"
            title={t('backgroundColor')}
            onClick={() => onToggle('bgColor')}
          >
            <div
              className="tual-secondary-swatch-box"
              style={{ backgroundColor: noteColors.bg }}
            />
          </button>
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
      <button
        type="button"
        className="tual-secondary-swatch-btn"
        title={t('color')}
        onClick={() => onToggle('color')}
      >
        {style.fill === 'none' ? (
          <div className="tual-secondary-swatch-box tual-no-fill-swatch" />
        ) : (
          <div className="tual-secondary-swatch-box" style={{ backgroundColor: colorHex }} />
        )}
      </button>
      {activePopover === 'color' && (
        <ColorDropdown
          map={map}
          title={t('color')}
          mode={isShape ? 'fill' : 'stroke'}
          currentColor={style.color}
          currentFill={style.fill}
          scheme={scheme}
          onSelectColor={(c) =>
            onUpdateStyle(style.fill === 'none' ? { color: c, fill: 'solid' } : { color: c })
          }
          onSelectFillMode={(mode) => onUpdateStyle({ fill: mode })}
          onClose={onClose}
        />
      )}
    </div>
  )
}
