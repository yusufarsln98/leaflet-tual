'use client'

import { memo } from 'react'
import { useControllerState } from '../../features/index.js'
import { TranslationProvider, useTranslation } from '../../features/i18n/index.js'
import { IconButton, ICONS } from '../../ui/index.js'
import { ContextMenu } from '../ContextMenu/index.js'
import { SidebarLayerTree, SidebarProperties } from './components/index.js'
import { useSidebarInteractions } from './hooks/index.js'
import type { SidebarProps } from './types.js'

export const Sidebar = memo(function Sidebar({
  controller,
  map,
  onClose,
  onItemContextMenu,
  className,
}: SidebarProps) {
  const { t } = useTranslation(controller)
  useControllerState(controller)

  const {
    guardRef,
    internalMenuPos,
    handleClose,
    handleMouseEnter,
    handleMouseLeave,
    handlePointerDown,
    handleMouseDown,
    handleItemContextMenu,
    closeInternalMenu,
  } = useSidebarInteractions({
    controller,
    map,
    onClose,
    onItemContextMenu,
  })

  return (
    <TranslationProvider translations={controller.translations}>
      <aside
        ref={guardRef}
        className={`tual-sidebar ${className ?? ''}`}
        aria-label={t('properties')}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onPointerDown={handlePointerDown}
        onMouseDown={handleMouseDown}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        <div className="tual-sidebar-header">
          <div className="tual-sidebar-tabs">
            <span className="tual-sidebar-tab" data-active="true">
              {t('properties')}
            </span>
          </div>
          {onClose && (
            <IconButton
              className="tual-sidebar-close"
              icon={ICONS.close()}
              label={t('closeSidebar')}
              onClick={handleClose}
            />
          )}
        </div>

        <SidebarLayerTree controller={controller} onItemContextMenu={handleItemContextMenu} />
        <SidebarProperties controller={controller} map={map} />

        {internalMenuPos && !controller.readOnly && (
          <ContextMenu
            map={map}
            controller={controller}
            position={internalMenuPos}
            onClose={closeInternalMenu}
          />
        )}
      </aside>
    </TranslationProvider>
  )
})
