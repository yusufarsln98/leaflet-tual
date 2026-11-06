import type { InputHTMLAttributes, ReactNode } from 'react'

export interface PropertyRowProps {
  label: ReactNode
  controlClassName?: string
  children: ReactNode
}

export interface NumberFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number
  onChange: (value: number) => void
  unit?: string
  step?: number | string
  stepIcons?: boolean
  wrapperClassName?: string
  unitClassName?: string
}

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string
  onChange: (value: string) => void
}


