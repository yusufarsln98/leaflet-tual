'use client'

import { useCallback, useRef, useState } from 'react'
import { Button } from '../button/index.js'
import { ICONS } from '../icons/index.js'
import { Popover } from './Popover.js'
import type { ConfirmPopoverProps } from './types.js'
import { useOutsideDismiss } from './use-outside-dismiss.js'

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

  const setOpen = useCallback(
    (next: boolean) => {
      setInternalOpen(next)
      onOpenChange?.(next)
    },
    [onOpenChange],
  )

  const dismiss = useCallback(() => setOpen(false), [setOpen])
  useOutsideDismiss(rootRef, isOpen, dismiss)

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

