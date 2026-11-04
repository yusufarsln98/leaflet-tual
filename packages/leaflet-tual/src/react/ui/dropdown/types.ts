import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

export interface PopoverProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: 'default' | 'options' | 'color' | 'typography' | 'radius' | 'page'
  header?: ReactNode
  wheelGuard?: boolean
  stopEvents?: boolean
  disableMapDraggingOnPointerDown?: () => void
  style?: CSSProperties
}

export interface PopoverHeaderProps {
  children: ReactNode
  style?: CSSProperties
  className?: string
}

export interface DropdownItemProps {
  leading?: ReactNode
  label: ReactNode
  meta?: ReactNode
  selected?: boolean
  danger?: boolean
  disabled?: boolean
  variant?: 'option' | 'action-menu' | 'variant' | 'typo'
  title?: string
  onClick?: () => void
  'data-size'?: string
}

export interface DropdownMenuProps {
  children: ReactNode
  layout?: 'list' | 'variant-list' | 'variant-grid' | 'typo-list' | 'action-menu'
  className?: string
}

export interface ConfirmPopoverProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  message: ReactNode
  confirmLabel: ReactNode
  cancelLabel: ReactNode
  triggerTitle?: string
  triggerIcon?: ReactNode
  onConfirm: () => void
  className?: string
}
