'use client'

import { useEffect, type RefObject } from 'react'
import { setupOutsideDismiss } from '../../../shared/dom/outside-dismiss.js'

export { setupOutsideDismiss }

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
    const refs = Array.isArray(ref) ? ref : [ref]
    return setupOutsideDismiss(
      refs.map((r) => r.current),
      onDismiss,
    )
  }, [ref, isOpen, onDismiss])
}


