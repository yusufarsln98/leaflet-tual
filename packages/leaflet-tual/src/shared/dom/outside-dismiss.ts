import { markEscapeHandled } from './escape-handled.js'

/**
 * Sets up listeners to dismiss an open floating element when clicking/tapping
 * outside the specified target element(s) or pressing `Escape`.
 * Uses the capture phase so stopPropagation inside child containers does not block dismissal.
 * Escape is marked as handled for Tual's global shortcuts, but propagation is left intact
 * so host application listeners (e.g. modal dismiss handlers) still receive it.
 *
 * @param elements Target element or array of elements to consider "inside"
 * @param onDismiss Callback invoked when clicking outside or pressing Escape
 * @returns Cleanup function removing all registered listeners
 */
export function setupOutsideDismiss(
  elements: HTMLElement | null | undefined | Array<HTMLElement | null | undefined>,
  onDismiss: () => void,
): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {}
  }

  const list = Array.isArray(elements) ? elements : [elements]

  const handlePointerDown = (e: MouseEvent | PointerEvent) => {
    const target = e.target as Node | null
    const isInside = list.some((el) => el && target && el.contains(target))
    if (!isInside) {
      onDismiss()
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      markEscapeHandled(e)
      onDismiss()
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
}
