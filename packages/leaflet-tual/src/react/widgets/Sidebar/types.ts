import type L from 'leaflet'
import type { Controller } from '../../../core/index.js'

export interface SidebarTriggerBarProps {
  controller: Controller
  map?: L.Map
  currentZoom?: number
  sidebarOpen: boolean
  onToggleSidebar: () => void
  className?: string
}

export interface SidebarProps {
  controller: Controller
  map?: L.Map
  onClose: () => void
  className?: string
}

