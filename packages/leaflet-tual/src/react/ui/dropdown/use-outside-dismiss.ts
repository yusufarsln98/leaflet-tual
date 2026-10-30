'use client'

import { useEffect, type RefObject } from 'react'

/**
 * Dismisses an open floating element when clicking/tapping outside `ref`
 * or pressing `Escape`. Uses capture phase so stopPropagation inside
 * map/canvas containers does not block dismissal.
 */
export function useOutsideDismiss(
  ref: RefObject<HTMLElement | null> | Array<RefObject<HTMLElement | null>>,
  isOpen: boolean,
  onDismiss: () => void,
) {
  useEffect(() => {
    if (!isOpen) return

    const onDismissRef = () => onDismiss()

    const handlePointerDown = (e: MouseEvent | PointerEvent) => {
      const target = e.target as Node | null
      const refs = Array.isArray(ref) ? ref : [ref]
      const isInside = refs.some((r) => r.current && target && r.current.contains(target))
      if (!isInside) {
        onDismissRef()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onDismissRef()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown, true)
    document.addEventListener('mousedown', handlePointerDown, true)
    window.addEventListener('keydown', handleKeyDown, true)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true)
      document.removeEventListener('mousedown', handlePointerDown, true)
      window.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [ref, isOpen, onDismiss])
}

