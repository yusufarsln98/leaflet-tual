'use client'

import { useWheelGuard } from './use-wheel-guard.js'
import type { PopoverHeaderProps, PopoverProps } from './types.js'

const VARIANT_CLASSES: Record<NonNullable<PopoverProps['variant']>, string> = {
  default: 'tual-popover',
  options: 'tual-popover tual-options-popover',
  color: 'tual-popover tual-color-popover',
  typography: 'tual-popover tual-typography-popover',
  radius: 'tual-popover tual-radius-popover',
  page: 'tual-popover tual-page-popover',
}

export function PopoverHeader({ children, style, className }: PopoverHeaderProps) {
  const cls = ['tual-popover-header', className ?? ''].filter(Boolean).join(' ')
  return (
    <div className={cls} style={style}>
      {children}
    </div>
  )
}

export function Popover({
  variant = 'default',
  header,
  wheelGuard = true,
  stopEvents = true,
  disableMapDraggingOnPointerDown,
  className,
  style,
  children,
  onPointerDown,
  onMouseDown,
  onClick,
  ...rest
}: PopoverProps) {
  const guardRef = useWheelGuard<HTMLDivElement>()
  const classes = [VARIANT_CLASSES[variant], className ?? ''].filter(Boolean).join(' ')

  return (
    <div
      ref={wheelGuard ? guardRef : undefined}
      className={classes}
      style={style}
      onPointerDown={(e) => {
        if (stopEvents) e.stopPropagation()
        disableMapDraggingOnPointerDown?.()
        onPointerDown?.(e)
      }}
      onMouseDown={(e) => {
        if (stopEvents) e.stopPropagation()
        disableMapDraggingOnPointerDown?.()
        onMouseDown?.(e)
      }}
      onClick={(e) => {
        if (stopEvents) e.stopPropagation()
        onClick?.(e)
      }}
      {...rest}
    >
      {header !== undefined && <PopoverHeader>{header}</PopoverHeader>}
      {children}
    </div>
  )
}

