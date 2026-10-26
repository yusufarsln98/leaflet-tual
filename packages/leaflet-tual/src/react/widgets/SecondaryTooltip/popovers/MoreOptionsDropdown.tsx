'use client'

import { useTranslation } from '../../../features/i18n/index.js'
import {
  Divider,
  DropdownItem,
  DropdownMenu,
  ICONS,
  Popover,
} from '../../../ui/index.js'

export interface MoreOptionsDropdownProps {
  onDuplicate: () => void
  onDelete: () => void
  onFitInView?: () => void
  onClose?: () => void
}

export function MoreOptionsDropdown({
  onDuplicate,
  onDelete,
  onFitInView,
}: MoreOptionsDropdownProps) {
  const { t } = useTranslation()

  return (
    <Popover variant="options">
      <DropdownMenu>
        <DropdownItem
          leading={ICONS.copy ? ICONS.copy() : <span>⧉</span>}
          label={t('duplicate')}
          onClick={onDuplicate}
        />

        {onFitInView && (
          <DropdownItem
            leading={<span>⛶</span>}
            label={t('fitInView')}
            onClick={onFitInView}
          />
        )}

        <Divider variant="popover" />

        <DropdownItem
          danger
          leading={ICONS.trash ? ICONS.trash() : <span>🗑</span>}
          label={t('delete')}
          onClick={onDelete}
        />
      </DropdownMenu>
    </Popover>
  )
}
