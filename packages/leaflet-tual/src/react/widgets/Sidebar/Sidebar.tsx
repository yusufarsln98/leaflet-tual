'use client'

import { useEffect } from 'react'
import type { InternalController } from '../../../core/index.js'
import { useControllerState } from '../../features/index.js'
import { TranslationProvider, useTranslation } from '../../features/i18n/index.js'
import { IconButton, ICONS, useWheelGuard } from '../../ui/index.js'
import { SidebarLayerTree } from './SidebarLayerTree.js'
import { SidebarProperties } from './SidebarProperties.js'
import type { SidebarProps } from './types.js'

export function Sidebar({ controller, map, onClose, onItemContextMenu, className }: SidebarProps) {
  const { t } = useTranslation(controller)
  const guardRef = useWheelGuard<HTMLElement>()

  useEffect(() => {
    if (map) {
      ;(controller as InternalController)._setMap?.(map)
    }
  }, [controller, map])

  useControllerState(controller)

  useEffect(() => {
    return () => {
      if (controller.tool === 'select') {
        map?.dragging?.enable()
      }
    }
  }, [controller.tool, map])

  const handleClose = () => {
    if (controller.tool === 'select') {
      map?.dragging?.enable()
    }
    onClose()
  }

  return (
    <TranslationProvider translations={controller.translations}>
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
            onClick={handleClose}
          />
        </div>

        <SidebarLayerTree
          controller={controller}
          onItemContextMenu={onItemContextMenu}
        />
        <SidebarProperties controller={controller} map={map} />
      </aside>
    </TranslationProvider>
  )
}

