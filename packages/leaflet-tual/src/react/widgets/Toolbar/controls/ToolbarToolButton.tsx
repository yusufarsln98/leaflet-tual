'use client'

import type { ReactNode } from 'react'
import { Button } from '../../../ui/index.js'

export interface ToolbarToolButtonProps {
  label: string
  icon: ReactNode
  isActive: boolean
  hasVariants: boolean
  onSelect: () => void
}

export function ToolbarToolButton({
  label,
  icon,
  isActive,
  hasVariants,
  onSelect,
}: ToolbarToolButtonProps) {
  return (
    <Button
      variant="toolbar"
      active={isActive}
      hasVariants={hasVariants}
      title={label}
      onClick={onSelect}
    >
      {icon}
    </Button>
  )
}
