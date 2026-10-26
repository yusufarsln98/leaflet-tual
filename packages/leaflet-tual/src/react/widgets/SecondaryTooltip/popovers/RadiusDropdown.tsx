'use client'

import { Button, Popover } from '../../../ui/index.js'

export interface RadiusDropdownProps {
  currentRadius?: number
  onSelectRadius: (r: number) => void
  onClose?: () => void
}

const RADII = [
  { val: 0, label: '0px' },
  { val: 8, label: '8px' },
  { val: 16, label: '16px' },
]

export function RadiusDropdown({ currentRadius = 8, onSelectRadius }: RadiusDropdownProps) {
  return (
    <Popover variant="radius">
      {RADII.map((r) => (
        <Button
          key={r.val}
          variant="radius"
          active={(currentRadius ?? 8) === r.val}
          onClick={() => onSelectRadius(r.val)}
        >
          {r.label}
        </Button>
      ))}
    </Popover>
  )
}
