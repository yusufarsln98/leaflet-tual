'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '../button/index.js'
import { ICONS } from '../icons/index.js'
import { Popover } from './Popover.js'
import type { ConfirmPopoverProps } from './types.js'

export function ConfirmPopover({
  open: controlledOpen,
  onOpenChange,
  message,
  confirmLabel,
  cancelLabel,
  triggerTitle,
  triggerIcon,
  onConfirm,
  className,
}: ConfirmPopoverProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const rootRef = useRef<HTMLDivElement>(null)

  const setOpen = (next: boolean) => {
    setInternalOpen(next)
    onOpenChange?.(next)
  }

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDownOutside = (e: MouseEvent | PointerEvent) => {
      const target = e.target as Node | null
      if (rootRef.current && target && !rootRef.current.contains(target)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDownOutside, true)
    document.addEventListener('mousedown', handlePointerDownOutside, true)
    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDownOutside, true)
      document.removeEventListener('mousedown', handlePointerDownOutside, true)
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [isOpen])

  return (
    <div
      ref={rootRef}
      className={`tual-confirm-trigger-wrap ${className ?? ''}`}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="tual-confirm-trigger-btn"
        title={triggerTitle}
        aria-label={triggerTitle}
        data-active={isOpen}
        onClick={() => setOpen(!isOpen)}
      >
        {triggerIcon ?? ICONS.close()}
      </button>

      {isOpen && (
        <Popover
          className="tual-confirm-popover"
          role="dialog"
          aria-label={typeof message === 'string' ? message : triggerTitle}
        >
          <span className="tual-confirm-message">{message}</span>
          <div className="tual-confirm-actions">
            <Button
              className="tual-confirm-cancel-btn"
              onClick={() => setOpen(false)}
            >
              {cancelLabel}
            </Button>
            <Button
              className="tual-confirm-delete-btn"
              onClick={() => {
                onConfirm()
                setOpen(false)
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </Popover>
      )}
    </div>
  )
}

