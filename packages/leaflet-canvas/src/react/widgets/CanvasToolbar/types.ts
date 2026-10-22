import type React from 'react'
import type {
  ArrowStyle,
  CanvasIcons,
  CanvasLabels,
  CustomToolbarItem,
  LeafletCanvasClassNames,
  LeafletCanvasController,
  LeafletCanvasStyles,
  ShapeKind,
  ToolbarOrientation,
  ToolbarPosition,
  ToolbarToolGroupId,
} from '../../types/index.js'

export interface CanvasToolbarProps {
  controller: LeafletCanvasController
  position?: ToolbarPosition
  orientation?: ToolbarOrientation
  collapsible?: boolean
  defaultCollapsed?: boolean
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  showCollapseButton?: boolean
  readOnly?: boolean
  enabledTools?: readonly ToolbarToolGroupId[]
  customTools?: readonly CustomToolbarItem[]
  showHistoryControls?: boolean
  showDeleteButton?: boolean
  showClearButton?: boolean
  showToolLabels?: boolean
  labels?: CanvasLabels
  icons?: CanvasIcons
  unstyled?: boolean
  classNames?: LeafletCanvasClassNames
  styles?: LeafletCanvasStyles
  strokeColors?: readonly string[]
  strokeWidthOptions?: readonly number[]
  fontSizeOptions?: readonly number[]
  className?: string
  style?: React.CSSProperties
}

export const ARROW_TOOL_IDS = [
  'arrow-linear',
  'arrow-curved',
  'arrow-bi',
  'arrow-elbow',
  'arrow-s-curve',
] as const

export type ArrowToolId = (typeof ARROW_TOOL_IDS)[number]

export interface ArrowOption {
  id: ArrowToolId
  style: ArrowStyle
  label: string
  shortcut: string
  icon: React.ReactNode
}

export interface ShapeOption {
  kind: ShapeKind
  label: string
  icon: React.ReactNode
}
