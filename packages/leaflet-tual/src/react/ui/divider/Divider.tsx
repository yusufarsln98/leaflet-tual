'use client'

export type DividerVariant = 'toolbar' | 'secondary' | 'popover' | 'input'

export interface DividerProps {
  variant?: DividerVariant
  className?: string
}

const VARIANT_CLASSES: Record<DividerVariant, string> = {
  toolbar: 'tual-separator',
  secondary: 'tual-secondary-separator',
  popover: 'tual-popover-divider',
  input: 'tual-color-input-divider',
}

export function Divider({ variant = 'toolbar', className }: DividerProps) {
  const cls = [VARIANT_CLASSES[variant], className ?? ''].filter(Boolean).join(' ')
  return <div className={cls} />
}

