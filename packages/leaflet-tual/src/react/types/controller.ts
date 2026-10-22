import type React from 'react'
import type L from 'leaflet'
import type {
  NoteItem,
  ScreenPoint,
  TextItem,
  ToolbarToolGroupId,
} from '../../core/types/items.js'
import type {
  ArrowRenderTheme,
  TualAnnotationTheme,
  TualLabels,
  LeafletTualClassNames,
  ToolbarOrientation,
  ToolbarPosition,
} from '../../core/types/theme.js'
import type {
  LeafletTualController,
  UseLeafletTualOptions,
} from '../../core/types/controller.js'
import type { TualIcons, LeafletTualStyles } from './theme.js'

export * from '../../core/types/controller.js'

export interface CustomToolbarItem {
  id: string
  label?: string
  title?: string
  icon?: React.ReactNode
  isActive?: boolean
  disabled?: boolean
  onClick?: (controller: LeafletTualController) => void
  render?: (controller: LeafletTualController) => React.ReactNode
}

export interface DragHandleTriggerProps {
  onPointerDown: (e: React.PointerEvent<HTMLElement>) => void
  style: React.CSSProperties
}

export interface RenderNoteProps {
  item: NoteItem
  screenPos: ScreenPoint
  isSelected: boolean
  isDragging: boolean
  readOnly?: boolean
  isCompact?: boolean
  dragHandleProps: DragHandleTriggerProps
  resizeHandleProps?: DragHandleTriggerProps
  onSelect: () => void
  onUpdate: (patch: Partial<NoteItem>) => void
  onDelete: () => void
}

export interface RenderTextProps {
  item: TextItem
  screenPos: ScreenPoint
  isSelected: boolean
  isEditing: boolean
  isDragging: boolean
  readOnly?: boolean
  isCompact?: boolean
  dynamicFontSize?: number
  setIsEditing: (editing: boolean) => void
  dragHandleProps: DragHandleTriggerProps
  onSelect: () => void
  onUpdate: (patch: Partial<TextItem>) => void
  onDelete: () => void
}

export interface LeafletTualProps extends UseLeafletTualOptions {

  map?: L.Map | null
  controller?: LeafletTualController
  readOnly?: boolean
  showToolbar?: boolean
  toolbarPosition?: ToolbarPosition
  toolbarOrientation?: ToolbarOrientation
  orientation?: ToolbarOrientation
  collapsible?: boolean
  defaultCollapsed?: boolean
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  showCollapseButton?: boolean
  enabledTools?: readonly ToolbarToolGroupId[]
  customTools?: readonly CustomToolbarItem[]
  showHistoryControls?: boolean
  showDeleteButton?: boolean
  showClearButton?: boolean
  showToolLabels?: boolean
  labels?: TualLabels
  icons?: TualIcons
  unstyled?: boolean
  classNames?: LeafletTualClassNames
  styles?: LeafletTualStyles
  annotationTheme?: TualAnnotationTheme
  arrowTheme?: ArrowRenderTheme
  strokeColors?: readonly string[]
  strokeWidthOptions?: readonly number[]
  fontSizeOptions?: readonly number[]
  renderToolbar?: (controller: LeafletTualController) => React.ReactNode
  renderNote?: (props: RenderNoteProps) => React.ReactNode
  renderText?: (props: RenderTextProps) => React.ReactNode
  clampOverlaysToViewport?: boolean
  autoMinimizeNotesZoom?: number
  autoMinimizeTextZoom?: number
  className?: string
  style?: React.CSSProperties
}

