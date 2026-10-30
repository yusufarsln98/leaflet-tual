import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant =
  | 'toolbar'
  | 'secondary-icon'
  | 'secondary-pill'
  | 'swatch'
  | 'popover-action'
  | 'style-toggle'
  | 'radius'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  active?: boolean
  hasVariants?: boolean
  chevron?: ReactNode
}

export interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: ReactNode
  label?: string
}

export interface PillButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'page' | 'secondary' | 'border-color' | 'zoom'
  active?: boolean
  leading?: ReactNode
  label: ReactNode
  trailing?: ReactNode
}

export interface SegmentedOption<T extends string | number> {
  value: T
  label: ReactNode
  title?: string
}

export interface SegmentedControlProps<T extends string | number> {
  options: ReadonlyArray<SegmentedOption<T>>
  value: T
  onChange: (value: T) => void
  variant?: 'color-tabs' | 'typo-tabs' | 'border-dash' | 'button-group' | 'recessed' | 'pill-tabs'
  title?: string
  marginTop?: number
  className?: string
  stopPropagation?: boolean
}

