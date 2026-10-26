'use client'

import type { Controller, Item, Style } from '../../../../core/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import { Collapsible } from '../../../ui/index.js'

export interface AppearanceSectionProps {
  selectedItem: Item
  style: Style
  controller: Controller
  onUpdateStyle: (patch: Partial<Style>) => void
}

export function AppearanceSection({
  style,
  controller,
  onUpdateStyle,
}: AppearanceSectionProps) {
  const { t } = useTranslation(controller)
  const opacity = style.opacity ?? 1

  return (
    <Collapsible title={t('appearance')} className="tual-sidebar-section">
      <div className="tual-sidebar-prop-row">
        <span className="tual-sidebar-prop-label">{t('opacity')}</span>
        <div className="tual-sidebar-prop-control">
          <div className="tual-sidebar-input-field">
            <input
              type="number"
              aria-label={t('opacity')}
              min={0}
              max={1}
              step={0.1}
              value={opacity}
              className="tual-sidebar-number-input"
              onChange={(e) => {
                const parsed = parseFloat(e.target.value)
                if (!Number.isNaN(parsed)) {
                  onUpdateStyle({ opacity: Math.max(0, Math.min(1, parsed)) })
                }
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      </div>
    </Collapsible>
  )
}

