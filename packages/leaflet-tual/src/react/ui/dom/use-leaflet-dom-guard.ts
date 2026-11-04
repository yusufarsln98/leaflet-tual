'use client'

import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import {
  disableTualDomPropagation,
  type DisableDomPropagationOptions,
} from '../../../shared/dom/ui-guard.js'

export { disableTualDomPropagation, type DisableDomPropagationOptions }

/**
 * Hook that isolates a DOM container from propagating events (clicks, mousedown,
 * dblclick, wheel, contextmenu) into the Leaflet map container and other extensions.
 */
export function useLeafletDomGuard<T extends HTMLElement = HTMLDivElement>(
  externalRef?: RefObject<T | null>,
  options?: DisableDomPropagationOptions,
) {
  const internalRef = useRef<T>(null)
  const targetRef = externalRef ?? internalRef
  const stopContextMenu = options?.stopContextMenu
  const stopWheel = options?.stopWheel

  useEffect(() => {
    return disableTualDomPropagation(targetRef.current, { stopContextMenu, stopWheel })
  }, [targetRef, stopContextMenu, stopWheel])

  return targetRef
}
