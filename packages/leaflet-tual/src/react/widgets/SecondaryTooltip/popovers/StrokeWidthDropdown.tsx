'use client'

import type { Style } from '../../../../core/types/index.js'
import { useTranslation } from '../../../features/i18n/index.js'

export interface StrokeWidthDropdownProps {
  currentWidth?: Style['width']
  onSelectWidth: (w: NonNullable<Style['width']>) => void
  onClose: () => void
}

const WIDTHS: { id: NonNullable<Style['width']>; label: string; tokenKey: 'thin' | 'medium' | 'thick'; px: number }[] = [
  { id: 's', label: 'Thin', tokenKey: 'thin', px: 2 },
  { id: 'm', label: 'Medium', tokenKey: 'medium', px: 4 },
  { id: 'l', label: 'Thick', tokenKey: 'thick', px: 6 },
]

export function StrokeWidthDropdown({
  currentWidth = 'm',
  onSelectWidth,
}: StrokeWidthDropdownProps) {
  const { t } = useTranslation()

  return (
    <div className="tual-popover tual-options-popover" onMouseDown={(e) => e.stopPropagation()}>
      <div className="tual-popover-header">{t('strokeWidth')}</div>
      <div className="tual-options-list">
        {WIDTHS.map((w) => {
          const isSelected = currentWidth === w.id
          return (
            <button
              key={w.id}
              type="button"
              className="tual-option-row"
              data-active={isSelected}
              onClick={() => onSelectWidth(w.id)}
            >
              <div
                style={{
                  width: 32,
                  height: w.px,
                  backgroundColor: 'currentColor',
                  borderRadius: 9999,
                }}
              />
              <span className="tual-option-label">{t(w.tokenKey, undefined, w.label)}</span>
              {isSelected && <span className="tual-check">✓</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

