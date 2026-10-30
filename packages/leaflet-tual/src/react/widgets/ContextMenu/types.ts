import type L from 'leaflet'
import type { Controller } from '../../../core/index.js'

export interface ContextMenuPosition {
  x: number
  y: number
}

export interface ContextMenuProps {
  map?: L.Map
  controller: Controller
  position: ContextMenuPosition | null
  onClose: () => void
  onOpenSidebar?: () => void
  className?: string
}
