'use client'

import { useCallback, useRef, useState } from 'react'
import { useControllerState } from '../../features/index.js'
import { useTranslation } from '../../features/i18n/index.js'
import { IconButton, ICONS, PillButton, useOutsideDismiss } from '../../ui/index.js'
import type { SidebarTriggerBarProps } from './types.js'
import { ZoomMenuPopover } from './ZoomMenuPopover.js'
import { getZoomPercent, zoomPercentToLevel } from './zoom-utils.js'

export function SidebarTriggerBar({
  controller,
  map,
  currentZoom,
  sidebarOpen,
  onToggleSidebar,
  className,
}: SidebarTriggerBarProps) {
  const { t } = useTranslation(controller)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useControllerState(controller)


  const closeMenu = useCallback(() => setMenuOpen(false), [])
  useOutsideDismiss(menuRef, menuOpen, closeMenu)

  const zoomPercent = getZoomPercent(currentZoom ?? map?.getZoom())

  const handleSelectPreset = (percent: number) => {
    map?.setZoom(zoomPercentToLevel(percent))
    closeMenu()
  }

  return (
    <div
      className={`tual-toolbar tual-sidebar-trigger-bar ${className ?? ''}`}
      data-sidebar-open={sidebarOpen}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <IconButton
        icon={ICONS.sidebar()}
        label={t('toggleSidebar')}
        active={sidebarOpen}
        onClick={onToggleSidebar}
      />

      <div ref={menuRef} className="tual-zoom-menu-anchor">
        <PillButton
          variant="zoom"
          title={t('zoomLevel')}
          active={menuOpen}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          label={<span>{zoomPercent}%</span>}
          trailing={<span className="tual-page-chevron">{ICONS['chevron-down-sm']()}</span>}
          onClick={() => setMenuOpen((open) => !open)}
        />

        {menuOpen && (
          <ZoomMenuPopover
            controller={controller}
            map={map}
            zoomPercent={zoomPercent}
            onSelectPreset={handleSelectPreset}
            onClose={closeMenu}
          />
        )}
      </div>
    </div>
  )
}
