import type React from 'react'
import type L from 'leaflet'
import type {
  TualIcons,
  TualLabels,
  LeafletTualClassNames,
  LeafletTualStyles,
  NoteItem,
  RenderNoteProps,
  ScreenPoint,
} from '../../types/index.js'

export interface NoteOverlayProps {
  item: NoteItem
  screenPos: ScreenPoint
  isSelected: boolean
  map: L.Map
  readOnly?: boolean
  labels?: TualLabels
  icons?: TualIcons
  unstyled?: boolean
  classNames?: LeafletTualClassNames
  styles?: LeafletTualStyles
  clampToViewport?: boolean
  autoMinimizeZoomThreshold?: number
  renderNote?: (props: RenderNoteProps) => React.ReactNode
  onSelect: (id: string) => void
  onUpdate: (id: string, patch: Partial<NoteItem>) => void
  onDelete: (id: string) => void
  onComplete?: () => void
}

export interface ResolvedNoteTheme {
  name: string
  bg: string
  border: string
  header: string
  text: string
}

