import type React from 'react'
import type L from 'leaflet'
import type { Controller, Item } from '../../../core/index.js'

export interface SidebarProps {
  controller: Controller
  map?: L.Map
  onClose: () => void
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

export interface SidebarTriggerBarProps {
  controller: Controller
  map?: L.Map
  currentZoom?: number
  sidebarOpen: boolean
  onToggleSidebar: () => void
  className?: string
}

export interface ZoomMenuPopoverProps {
  controller: Controller
  map?: L.Map
  zoomPercent: number
  onSelectPreset: (percent: number) => void
  onClose: () => void
}
