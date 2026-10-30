'use client'

import type { LabelPosition } from '../../../../core/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import {
  DropdownItem,
  DropdownMenu,
  ICONS,
  Popover,
} from '../../../ui/index.js'

export interface LabelPositionDropdownProps {
  currentPosition?: LabelPosition
  onSelectPosition: (p: LabelPosition) => void
  onClose: () => void
}

const POSITIONS: { id: LabelPosition; label: string }[] = [
  { id: 'top', label: 'Top' },
  { id: 'center', label: 'Center' },
  { id: 'bottom', label: 'Bottom' },
]

export function LabelPositionDropdown({
  currentPosition = 'center',
  onSelectPosition,
}: LabelPositionDropdownProps) {
  const { t } = useTranslation()

  return (
    <Popover variant="options" header={t('labelPosition')}>
      <DropdownMenu>
        {POSITIONS.map((p) => (
          <DropdownItem
            key={p.id}
            selected={currentPosition === p.id}
            leading={ICONS[p.id]()}
            label={t(p.id, undefined, p.label)}
            onClick={() => onSelectPosition(p.id)}
          />
        ))}
      </DropdownMenu>
    </Popover>
  )
}
