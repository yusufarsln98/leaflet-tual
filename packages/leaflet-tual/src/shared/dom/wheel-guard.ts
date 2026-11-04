/**
 * Stops wheel scroll events from bubbling out of a container
 * into ancestor elements (such as the Leaflet map container), preventing
 * accidental map zoom while scrolling inside dropdowns or popovers.
 *
 * @param element Target container element
 * @returns Cleanup function removing registered listeners
 */
export function stopScrollPropagation(element: HTMLElement | null | undefined): () => void {
  if (!element) return () => {}

  const stop = (event: Event) => event.stopPropagation()

  element.addEventListener('wheel', stop, { passive: true })

  return () => {
    element.removeEventListener('wheel', stop)
  }
}
