'use client'

import { useRef } from 'react'
import { useControllerState } from '../../../features/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import {
  IconButton,
  ICONS,
  PillButton,
  useLeafletDomGuard,
} from '../../../ui/index.js'
import type { SidebarTriggerBarProps } from '../types.js'
import { useZoomMenu } from '../hooks/use-zoom-menu.js'
import { ZoomMenuPopover } from './ZoomMenuPopover.js'

export function SidebarTriggerBar({
  controller,
  map,
  currentZoom,
  sidebarOpen,
  onToggleSidebar,
  className,
}: SidebarTriggerBarProps) {
  const { t } = useTranslation(controller)
  const barRef = useRef<HTMLDivElement>(null)

  useControllerState(controller)
  useLeafletDomGuard(barRef)

  const {
    menuOpen,
    menuRef,
    zoomPercent,
    closeMenu,
    toggleMenu,
    handleSelectPreset,
  } = useZoomMenu({ map, currentZoom })

  return (
    <div
      ref={barRef}
      className={`tual-toolbar tual-sidebar-trigger-bar ${className ?? ''}`}
      data-sidebar-open={sidebarOpen}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
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
          onClick={toggleMenu}
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

