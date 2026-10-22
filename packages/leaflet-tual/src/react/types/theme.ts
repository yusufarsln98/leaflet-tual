import type React from 'react'
import type { LeafletTualClassNames } from '../../core/types/theme.js'

export * from '../../core/types/theme.js'

export interface CanvasIcons {
  select?: React.ReactNode
  freedraw?: React.ReactNode
  arrowGroup?: React.ReactNode
  arrowLinear?: React.ReactNode
  arrowCurved?: React.ReactNode
  arrowBi?: React.ReactNode
  arrowElbow?: React.ReactNode
  arrowSCurve?: React.ReactNode
  shapesGroup?: React.ReactNode
  shapeSquare?: React.ReactNode
  shapeCircle?: React.ReactNode
  shapeStar?: React.ReactNode
  shapeActor?: React.ReactNode
  shapeTriangle?: React.ReactNode
  shapeDiamond?: React.ReactNode
  shapeHexagon?: React.ReactNode
  shapeMarker?: React.ReactNode
  dropdownChevron?: React.ReactNode
  ruler?: React.ReactNode
  note?: React.ReactNode
  text?: React.ReactNode
  undo?: React.ReactNode
  redo?: React.ReactNode
  delete?: React.ReactNode
  clear?: React.ReactNode
  noteExpand?: React.ReactNode
  noteCollapse?: React.ReactNode
  noteCompact?: React.ReactNode
  noteDelete?: React.ReactNode
  noteResize?: React.ReactNode
  textEdit?: React.ReactNode
  textDone?: React.ReactNode
  textBold?: React.ReactNode
  textDecreaseSize?: React.ReactNode
  textIncreaseSize?: React.ReactNode
  textDelete?: React.ReactNode
  collapseToolbar?: React.ReactNode
  expandToolbar?: React.ReactNode
}

export type LeafletTualStyles = {
  [K in keyof LeafletTualClassNames]?: React.CSSProperties
}

export type LeafletCanvasStyles = LeafletTualStyles

