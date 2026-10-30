'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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
  const popoverRef = useRef<HTMLDivElement>(null)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)
  const [coords, setCoords] = useState<{
    top: number
    right: number
    placement: 'top' | 'bottom'
  } | null>(null)

  const setOpen = useCallback(
    (next: boolean) => {
      setInternalOpen(next)
      onOpenChange?.(next)
    },
    [onOpenChange],
  )

  const dismiss = useCallback(() => setOpen(false), [setOpen])

  const updatePosition = useCallback(() => {
    if (!rootRef.current || typeof window === 'undefined') return
    const root = rootRef.current
    const sidebar = root.closest('.tual-sidebar') as HTMLElement | null
    const triggerRect = root.getBoundingClientRect()

    if (sidebar) {
      const sidebarRect = sidebar.getBoundingClientRect()
      const spaceBelow = sidebarRect.bottom - triggerRect.bottom
      const placement =
        spaceBelow < 75 && triggerRect.top - sidebarRect.top > 75 ? 'top' : 'bottom'
      const top =
        placement === 'bottom'
          ? triggerRect.bottom - sidebarRect.top + 4
          : triggerRect.top - sidebarRect.top - 4

      setCoords({
        top,
        right: Math.max(6, sidebarRect.right - triggerRect.right),
        placement,
      })
      setPortalTarget(sidebar)
    } else {
      const spaceBelow = window.innerHeight - triggerRect.bottom
      const placement = spaceBelow < 75 && triggerRect.top > 75 ? 'top' : 'bottom'
      const top = placement === 'bottom' ? triggerRect.bottom + 4 : triggerRect.top - 4

      setCoords({
        top,
        right: Math.max(6, window.innerWidth - triggerRect.right),
        placement,
      })
      setPortalTarget(document.body)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      updatePosition()
    }
  }, [isOpen, updatePosition])

  useEffect(() => {
    if (!isOpen) return
    const handleScroll = (e: Event) => {
      if (popoverRef.current && e.target && popoverRef.current.contains(e.target as Node)) {
        return
      }
      dismiss()
    }
    window.addEventListener('scroll', handleScroll, true)
    return () => {
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [isOpen, dismiss])

  useOutsideDismiss([rootRef, popoverRef], isOpen, dismiss)

  const popoverContent = isOpen && (
    <div
      ref={popoverRef}
      className="tual-confirm-popover-portal"
      style={
        coords
          ? {
              position: portalTarget === document.body ? 'fixed' : 'absolute',
              top: coords.top,
              right: coords.right,
              transform: coords.placement === 'top' ? 'translateY(-100%)' : undefined,
              zIndex: 1000,
            }
          : undefined
      }
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
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
    </div>
  )

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
        onClick={() => {
          if (!isOpen) updatePosition()
          setOpen(!isOpen)
        }}
      >
        {triggerIcon ?? ICONS.close()}
      </button>

      {portalTarget && typeof document !== 'undefined'
        ? createPortal(popoverContent, portalTarget)
        : popoverContent}
    </div>
  )
}

