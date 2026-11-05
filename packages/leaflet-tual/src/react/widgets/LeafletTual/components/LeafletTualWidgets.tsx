'use client'

import type L from 'leaflet'
import type { Controller } from '../../../../core/index.js'
import { Toolbar } from '../../Toolbar/Toolbar.js'
import { ContextMenu, type ContextMenuPosition } from '../../ContextMenu/index.js'

export interface LeafletTualWidgetsProps {
  map: L.Map
  controller: Controller
  contextMenuPos: ContextMenuPosition | null
  toolbarProps?: boolean | object
  readOnly?: boolean
  onCloseContextMenu: () => void
}

export function LeafletTualWidgets({
  map,
  controller,
  contextMenuPos,
  toolbarProps,
  readOnly,
  onCloseContextMenu,
}: LeafletTualWidgetsProps) {
  const showToolbar = toolbarProps !== false && (!readOnly || Boolean(toolbarProps))

  return (
    <>
      {showToolbar && (
        <Toolbar
          controller={controller}
          map={map}
          {...(typeof toolbarProps === 'object' ? toolbarProps : {})}
        />
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
