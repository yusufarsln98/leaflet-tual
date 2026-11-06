import type React from 'react'
import type L from 'leaflet'
import type { Controller, Item } from '../../../core/index.js'

export interface SidebarProps {
  controller: Controller
  map?: L.Map
  /** Renders a close button when provided. Visibility itself is controlled by the host. */
  onClose?: () => void
  onItemContextMenu?: (item: Item, e: React.MouseEvent) => void
  className?: string
}

export interface SidebarLayerTreeProps {
  controller: Controller
  onItemContextMenu?: (item: Item, e: React.MouseEvent) => void
}

export interface SidebarPropertiesProps {
  controller: Controller
  map?: L.Map
}
