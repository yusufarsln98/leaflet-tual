import type { ReactNode } from 'react'

export interface SelectFieldOption<T extends string | number> {
  /** Value passed back to `onChange` when the option is chosen. */
  value: T
  /** Label shown both in the field and in the dropdown menu. */
  label: ReactNode
  /** Optional label used only inside the dropdown menu. */
  menuLabel?: ReactNode
}

export interface SelectFieldProps<T extends string | number> {
  /** Accessible name for the control (also used as the native select label). */
  ariaLabel: string
  value: T
  options: ReadonlyArray<SelectFieldOption<T>>
  onChange: (value: T) => void
  /** Native tooltip for the field. */
  title?: string
  /** Optional leading icon rendered inside the field. */
  icon?: ReactNode
  /** Unit suffix rendered after the value, e.g. `px`. Also appended in the menu. */
  unit?: string
  /** Extra classes merged onto the `.tual-select-field` wrapper. */
  className?: string
  /** Horizontal alignment of the value text. Defaults to `end`. */
  align?: 'start' | 'end'
  disabled?: boolean
  /** Called when the menu is opened, useful for closing sibling popovers. */
  onOpen?: () => void
}
