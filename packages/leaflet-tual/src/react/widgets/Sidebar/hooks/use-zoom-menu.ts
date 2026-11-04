import { useCallback, useRef, useState } from 'react'
import type L from 'leaflet'
import { useOutsideDismiss } from '../../../ui/index.js'
import { getZoomPercent, zoomPercentToLevel } from '../utils/zoom-utils.js'

export interface UseZoomMenuOptions {
  map?: L.Map
  currentZoom?: number
}

export function useZoomMenu({ map, currentZoom }: UseZoomMenuOptions) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const closeMenu = useCallback(() => {
    setMenuOpen(false)
  }, [])

  useOutsideDismiss(menuRef, menuOpen, closeMenu)

  const zoomPercent = getZoomPercent(currentZoom ?? map?.getZoom())

  const handleSelectPreset = useCallback(
    (percent: number) => {
      map?.setZoom(zoomPercentToLevel(percent))
      closeMenu()
    },
    [closeMenu, map],
  )

  const toggleMenu = useCallback(() => {
    setMenuOpen((open) => !open)
  }, [])

  return {
    menuOpen,
    menuRef,
    zoomPercent,
    closeMenu,
    toggleMenu,
    handleSelectPreset,
  }
}

