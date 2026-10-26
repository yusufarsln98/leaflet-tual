'use client'

import type { Style } from '../../../../core/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import { DropdownItem, DropdownMenu, Popover } from '../../../ui/index.js'

export interface StrokeWidthDropdownProps {
  currentWidth?: Style['width']
  onSelectWidth: (w: NonNullable<Style['width']>) => void
  onClose: () => void
}

const WIDTHS: {
  id: NonNullable<Style['width']>
  label: string
  tokenKey: 'thin' | 'medium' | 'thick'
  px: number
}[] = [
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
    <Popover variant="options" header={t('strokeWidth')}>
      <DropdownMenu>
        {WIDTHS.map((w) => (
          <DropdownItem
            key={w.id}
            selected={currentWidth === w.id}
            leading={
              <div
                style={{
                  width: 32,
                  height: w.px,
                  backgroundColor: 'currentColor',
                  borderRadius: 9999,
                }}
              />
            }
            label={t(w.tokenKey, undefined, w.label)}
            onClick={() => onSelectWidth(w.id)}
          />
        ))}
      </DropdownMenu>
    </Popover>
  )
}
