'use client'

import type React from 'react'
import type L from 'leaflet'
import type { Controller, Item } from '../../../../core/index.js'
import { Toolbar } from '../../Toolbar/Toolbar.js'
import { Sidebar, SidebarTriggerBar } from '../../Sidebar/index.js'
import { ContextMenu, type ContextMenuPosition } from '../../ContextMenu/index.js'

export interface LeafletTualWidgetsProps {
  map: L.Map
  controller: Controller
  currentZoom: number
  isSidebarOpen: boolean
  contextMenuPos: ContextMenuPosition | null
  resolvedScheme: string
  toolbarProps?: boolean | object
  readOnly?: boolean
  onToggleSidebar: () => void
  onCloseSidebar: () => void
  onCloseContextMenu: () => void
  onOpenSidebar: () => void
  onSidebarItemContextMenu: (item: Item, e: React.MouseEvent) => void
}

export function LeafletTualWidgets({
  map,
  controller,
  currentZoom,
  isSidebarOpen,
  contextMenuPos,
  resolvedScheme,
  toolbarProps,
  readOnly,
  onToggleSidebar,
  onCloseSidebar,
  onCloseContextMenu,
  onOpenSidebar,
  onSidebarItemContextMenu,
}: LeafletTualWidgetsProps) {
  const showToolbar = toolbarProps !== false && (!readOnly || Boolean(toolbarProps))

  return (
    <>
      {/* Floating Toolbar */}
      {showToolbar && (
        <Toolbar
          controller={controller}
          map={map}
          currentZoom={currentZoom}
          {...(typeof toolbarProps === 'object' ? toolbarProps : {})}
        />
      )}

      {/* Floating Sidebar & Zoom Trigger Tooltip */}
      {showToolbar && (
        <SidebarTriggerBar
          controller={controller}
          map={map}
          currentZoom={currentZoom}
          sidebarOpen={isSidebarOpen}
          onToggleSidebar={onToggleSidebar}
        />
      )}

      {/* Right Properties & Layers Sidebar overlay */}
      {isSidebarOpen && !controller.readOnly && (
        <div className="tual tual-sidebar-layer" data-theme={resolvedScheme}>
          <Sidebar
            controller={controller}
            map={map}
            onClose={onCloseSidebar}
            onItemContextMenu={onSidebarItemContextMenu}
          />
        </div>
      )}

      {/* Right-click Context Menu overlay */}
      {contextMenuPos && !controller.readOnly && (
        <div className="tual tual-context-menu-layer" data-theme={resolvedScheme}>
          <ContextMenu
            map={map}
            controller={controller}
            position={contextMenuPos}
            onClose={onCloseContextMenu}
            onOpenSidebar={onOpenSidebar}
          />
        </div>
      )}
    </>
  )
}
