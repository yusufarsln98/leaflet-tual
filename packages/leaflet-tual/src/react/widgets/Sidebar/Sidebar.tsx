'use client'

import { useEffect } from 'react'
import type { InternalController } from '../../../core/index.js'
import { useControllerState } from '../../features/index.js'
import { useTranslation } from '../../features/i18n/index.js'
import { IconButton, ICONS, useWheelGuard } from '../../ui/index.js'
import { SidebarLayerTree } from './SidebarLayerTree.js'
import { SidebarProperties } from './SidebarProperties.js'
import type { SidebarProps } from './types.js'

export function Sidebar({ controller, map, onClose, className }: SidebarProps) {
  const { t } = useTranslation(controller)
  const guardRef = useWheelGuard<HTMLElement>()

  useEffect(() => {
    if (map) {
      ;(controller as InternalController)._setMap?.(map)
    }
  }, [controller, map])

  useControllerState(controller)


  return (
    <aside
      ref={guardRef}
      className={`tual-sidebar ${className ?? ''}`}
      aria-label={t('properties')}
      onMouseEnter={() => map?.dragging?.disable()}
      onMouseLeave={() => {
        if (controller.tool === 'select') map?.dragging?.enable()
      }}
      onPointerDown={(e) => {
        e.stopPropagation()
        map?.dragging?.disable()
      }}
      onMouseDown={(e) => {
        e.stopPropagation()
        map?.dragging?.disable()
      }}
      onTouchStart={(e) => {
        e.stopPropagation()
        map?.dragging?.disable()
      }}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <div className="tual-sidebar-header">
        <div className="tual-sidebar-tabs">
          <span className="tual-sidebar-tab" data-active="true">
            {t('properties')}
          </span>
        </div>
        <IconButton
          icon={ICONS.close()}
          label={t('closeSidebar')}
          onClick={onClose}
        />
      </div>

      <SidebarLayerTree controller={controller} />
      <SidebarProperties controller={controller} map={map} />
    </aside>
  )
}

