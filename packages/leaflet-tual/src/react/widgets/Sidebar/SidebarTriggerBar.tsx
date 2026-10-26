'use client'

import { useTranslation } from '../../features/i18n/index.js'
import { IconButton, ICONS, PillButton } from '../../ui/index.js'
import type { SidebarTriggerBarProps } from './types.js'

export function SidebarTriggerBar({
  controller,
  map,
  currentZoom,
  sidebarOpen,
  onToggleSidebar,
  className,
}: SidebarTriggerBarProps) {
  const { t } = useTranslation(controller)
  const effZoom = currentZoom ?? map?.getZoom()
  const zoomPercent = effZoom !== undefined ? Math.round(Math.pow(2, effZoom - 13) * 100) : 100

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
      <PillButton
        variant="zoom"
        title={t('zoomReset')}
        label={<span>{zoomPercent}%</span>}
        trailing={<span className="tual-page-chevron">{ICONS.chevronDown()}</span>}
        onClick={() => {
          map?.setZoom(13)
        }}
      />
    </div>
  )
}

