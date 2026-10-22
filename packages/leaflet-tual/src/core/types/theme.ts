export type ToolbarPosition =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-center'
  | 'bottom-center'
  | 'left-center'
  | 'right-center'

export type ToolbarOrientation = 'horizontal' | 'vertical'

export interface CanvasLabels {
  select?: string
  freedraw?: string
  arrowGroup?: string
  arrowLinear?: string
  arrowCurved?: string
  arrowBi?: string
  arrowElbow?: string
  arrowSCurve?: string
  shapesGroup?: string
  shapesModalTitle?: string
  shapeSquare?: string
  shapeCircle?: string
  shapeStar?: string
  shapeActor?: string
  shapeTriangle?: string
  shapeDiamond?: string
  shapeHexagon?: string
  shapeMarker?: string
  ruler?: string
  note?: string
  text?: string
  undo?: string
  redo?: string
  delete?: string
  clear?: string
  color?: string
  width?: string
  dashed?: string
  filled?: string
  arrowStylePrefix?: string
  arrowLabelPlaceholder?: string
  shapeLabelPlaceholder?: string
  noteTheme?: string
  noteDefaultTitle?: string
  noteTitlePlaceholder?: string
  noteTextPlaceholder?: string
  noteExpand?: string
  noteCollapse?: string
  noteCompact?: string
  noteDelete?: string
  noteResize?: string
  fontSize?: string
  textPlaceholder?: string
  textEmptyFallback?: string
  textEdit?: string
  textDone?: string
  textBold?: string
  textDecreaseSize?: string
  textIncreaseSize?: string
  textDelete?: string
  collapseToolbar?: string
  expandToolbar?: string
}

export interface CanvasAnnotationTheme {
  selectionGlowColor?: string
  selectionGlowWidth?: number
  guideLineDash?: readonly number[]
  guideLineColor?: string
  guideLineWidth?: number
  endpointHandleColor?: string
  controlHandleColor?: string
  handleFillColor?: string
  handleRadius?: number
  handleStrokeWidth?: number
  shadowColor?: string
  shadowBlur?: number
  shadowOffsetY?: number
  labelBackgroundColor?: string
  labelTextColor?: string
  labelFont?: string
  labelBorderColor?: string
  labelBorderWidth?: number
  labelBorderRadius?: number
  labelPaddingX?: number
  labelPaddingY?: number
  labelShadowColor?: string
  labelShadowBlur?: number
  shapeDefaultFillOpacity?: number
  shapeBorderRadius?: number
  labelMinShapeSize?: number
  labelMaxTextWidth?: number
  fitLabelsToShape?: boolean
}

export type ArrowRenderTheme = CanvasAnnotationTheme

export interface LeafletTualClassNames {
  overlay?: string
  canvas?: string
  drawingSurface?: string
  itemsContainer?: string
  toolbar?: string
  toolbarPrimary?: string
  toolbarSecondary?: string
  toolButton?: string
  toolButtonActive?: string
  arrowGroupWrapper?: string
  arrowDropdownMenu?: string
  arrowDropdownItem?: string
  arrowDropdownItemActive?: string
  shapesGroupWrapper?: string
  shapesModal?: string
  shapesModalHeader?: string
  shapesModalGrid?: string
  shapesModalItem?: string
  shapesModalItemActive?: string
  toolbarDivider?: string
  toolbarCollapseButton?: string
  toolbarCollapsed?: string
  actionButton?: string
  actionButtonDisabled?: string
  deleteButton?: string
  swatchButton?: string
  swatchButtonActive?: string
  toolbarInput?: string
  toolbarSelect?: string
  noteCard?: string
  noteCardSelected?: string
  noteCollapsed?: string
  noteCompact?: string
  noteHeader?: string
  noteTitleInput?: string
  noteHeaderActions?: string
  noteHeaderButton?: string
  noteDeleteButton?: string
  noteBody?: string
  noteTextarea?: string
  noteResizeHandle?: string
  textWrapper?: string
  textWrapperSelected?: string
  textCompact?: string
  textControls?: string
  textControlButton?: string
  textControlButtonActive?: string
  textInput?: string
  textDisplay?: string
}

export type LeafletCanvasClassNames = LeafletTualClassNames


