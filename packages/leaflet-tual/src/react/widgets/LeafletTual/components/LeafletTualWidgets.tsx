'use client'

import type React from 'react'
import type L from 'leaflet'
import type {
  Controller,
  Item,
  KeyboardShortcutsOptions,
  ToolbarOptions,
} from '../../../../core/index.js'
import { Toolbar } from '../../Toolbar/Toolbar.js'
import { Sidebar } from '../../Sidebar/index.js'
import { ContextMenu, type ContextMenuPosition } from '../../ContextMenu/index.js'

export interface LeafletTualWidgetsProps {
  map: L.Map
  controller: Controller
  sidebarOpen: boolean
  contextMenuPos: ContextMenuPosition | null
  toolbarProps?: boolean | ToolbarOptions
  shortcuts?: boolean | KeyboardShortcutsOptions
  readOnly?: boolean
  onCloseContextMenu: () => void
  onSidebarItemContextMenu: (item: Item, e: React.MouseEvent) => void
  onToggleSidebar: () => void
}

export function LeafletTualWidgets({
  map,
  controller,
  sidebarOpen,
  contextMenuPos,
  toolbarProps,
  shortcuts,
  readOnly,
  onCloseContextMenu,
  onSidebarItemContextMenu,
  onToggleSidebar,
}: LeafletTualWidgetsProps) {
  const showToolbar = toolbarProps !== false && (!readOnly || Boolean(toolbarProps))
  const toolbarOptions = typeof toolbarProps === 'object' ? toolbarProps : {}
  const toolbarPosition = sidebarOpen ? 'top' : toolbarOptions.position

  return (
    <>
      {showToolbar && (
        <Toolbar
          controller={controller}
          map={map}
          {...toolbarOptions}
          position={toolbarPosition}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={onToggleSidebar}
          shortcuts={shortcuts}
        />
      )}

      {sidebarOpen && !controller.readOnly && (
        <div className="tual tual-sidebar-layer">
          <Sidebar
            controller={controller}
            map={map}
            onClose={onToggleSidebar}
            onItemContextMenu={onSidebarItemContextMenu}
          />
        </div>
      )}

      {contextMenuPos && !controller.readOnly && (
        <div className="tual tual-context-menu-layer">
          <ContextMenu
            map={map}
            controller={controller}
            position={contextMenuPos}
            onClose={onCloseContextMenu}
          />
        </div>
      )}
    </>
  )
}
