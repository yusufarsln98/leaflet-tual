'use client'

import type { Style } from '../../../../core/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import { DropdownItem, DropdownMenu, Popover } from '../../../ui/index.js'

export interface DashDropdownProps {
  currentDash?: Style['dash']
  onSelectDash: (d: NonNullable<Style['dash']>) => void
  onClose: () => void
}

const DASH_STYLES: { id: NonNullable<Style['dash']>; label: string; dasharray?: string }[] = [
  { id: 'solid', label: 'Solid' },
  { id: 'dashed', label: 'Dashed', dasharray: '4 4' },
  { id: 'dotted', label: 'Dotted', dasharray: '2 3' },
]

export function DashDropdown({ currentDash = 'solid', onSelectDash }: DashDropdownProps) {
  const { t } = useTranslation()

  return (
    <Popover variant="options" header={t('borderStyle')}>
      <DropdownMenu>
        {DASH_STYLES.map((d) => (
          <DropdownItem
            key={d.id}
            selected={currentDash === d.id}
            leading={
              <svg width="28" height="6" style={{ overflow: 'visible' }}>
                <line
                  x1="0"
                  y1="3"
                  x2="28"
                  y2="3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={d.dasharray}
                />
              </svg>
            }
            label={t(d.id, undefined, d.label)}
            onClick={() => onSelectDash(d.id)}
          />
        ))}
      </DropdownMenu>
    </Popover>
  )
}
