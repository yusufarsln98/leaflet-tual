import type React from 'react'
import type L from 'leaflet'
import type {
  CanvasIcons,
  CanvasLabels,
  LeafletCanvasClassNames,
  LeafletCanvasStyles,
  RenderTextProps,
  ScreenPoint,
  TextItem,
} from '../../types/index.js'

export interface TextOverlayProps {
  item: TextItem
  screenPos: ScreenPoint
  isSelected: boolean
  isEditingLabel?: boolean
  map: L.Map
  readOnly?: boolean
  labels?: CanvasLabels
  icons?: CanvasIcons
  unstyled?: boolean
  classNames?: LeafletCanvasClassNames
  styles?: LeafletCanvasStyles
  clampToViewport?: boolean
  autoMinimizeZoomThreshold?: number
  renderText?: (props: RenderTextProps) => React.ReactNode
  onSelect: (id: string) => void
  onUpdate: (id: string, patch: Partial<TextItem>) => void
  onDelete: (id: string) => void
  onComplete?: () => void
}

