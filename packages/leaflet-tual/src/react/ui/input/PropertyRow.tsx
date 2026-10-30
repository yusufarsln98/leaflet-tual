import type { ReactNode } from 'react'
import type { PropertyRowProps } from './types.js'

export function PropertyRow({
  label,
  controlClassName,
  children,
}: PropertyRowProps): ReactNode {
  return (
    <div className="tual-sidebar-prop-row">
      <span className="tual-sidebar-prop-label">{label}</span>
      <div className={`tual-sidebar-prop-control${controlClassName ? ` ${controlClassName}` : ''}`}>
        {children}
      </div>
    </div>
  )
}
