import type L from 'leaflet'
import type { Controller, Item } from '../../../core/index.js'

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

export interface SidebarProps {
  controller: Controller
  map?: L.Map
  onClose: () => void
  onItemContextMenu?: (item: Item, e: React.MouseEvent) => void
  className?: string
}

