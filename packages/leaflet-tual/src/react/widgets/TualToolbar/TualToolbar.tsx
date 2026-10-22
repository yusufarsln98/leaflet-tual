'use client'

import { useState } from 'react'
import type { ArrowItem, ShapeItem, TextItem } from '../../types/index.js'
import { STROKE_COLORS } from '../../shared/constants.js'
import { DEFAULT_ENABLED_TOOLS, POSITION_STYLES } from './constants.js'
import { DEFAULT_ICONS } from './icons.js'
import type { TualToolbarProps } from './types.js'
import {
  buildArrowOptions,
  buildShapeOptions,
  getActiveToolInfo,
  getToolbarButtonClassName,
  getToolbarButtonStyle,
  getToolbarContainerStyle,
} from './toolbar-helpers.js'
import { ExpandTriggerButton } from './CollapseButtons.js'
import { PrimaryToolbarStrip } from './PrimaryToolbarStrip.js'
import { ContextualSettingsBar } from './ContextualSettingsBar.js'
import { useToolbarContext } from './use-toolbar-context.js'

export function TualToolbar({
  controller,
  position = 'top-center',
  orientation: propOrientation,
  collapsible = true,
  defaultCollapsed = false,
  collapsed: propCollapsed,
  onCollapsedChange,
  showCollapseButton = true,
  readOnly: propReadOnly,
  enabledTools = DEFAULT_ENABLED_TOOLS,
  customTools,
  showHistoryControls = true,
  showDeleteButton = true,
  showClearButton = true,
  showToolLabels: explicitShowToolLabels,
  labels,
  icons,
  unstyled = false,
  classNames,
  styles,
  strokeColors = STROKE_COLORS,
  strokeWidthOptions,
  fontSizeOptions,
  className,
  style,
}: TualToolbarProps) {
  const readOnly = Boolean(propReadOnly ?? controller.readOnly)
  const isVerticalPosition = position === 'left' || position === 'right' || position === 'left-center' || position === 'right-center'
  const orientation = propOrientation ?? (isVerticalPosition ? 'vertical' : 'horizontal')
  const isVertical = orientation === 'vertical'
  const showToolLabels = explicitShowToolLabels ?? !isVertical

  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed)
  const isCollapsed = propCollapsed !== undefined ? propCollapsed : internalCollapsed
  const handleToggleCollapse = (next: boolean) => {
    if (propCollapsed === undefined) setInternalCollapsed(next)
    onCollapsedChange?.(next)
  }

  const { activeTool, activeShape, selectedItem } = controller

  const {
    isArrowToolActive,
    isShapeToolActive,
    isArrowContext,
    isFreeDrawContext,
    isShapeContext,
    isRulerContext,
    isNoteContext,
    isTextContext,
    showSettingsBar,
    arrowDropdownOpen,
    setArrowDropdownOpen,
    shapesModalOpen,
    setShapesModalOpen,
    arrowGroupRef,
    shapesGroupRef,
  } = useToolbarContext(controller, readOnly)

  const arrowOptions = buildArrowOptions(labels, icons)
  const shapeOptions = buildShapeOptions(labels, icons)

  const activeArrowDef = arrowOptions.find((a) => a.id === activeTool)
  const arrowGroupLabel = labels?.arrowGroup ?? (activeArrowDef ? activeArrowDef.label : 'Arrows')
  const currentArrowIcon = icons?.arrowGroup ?? (activeArrowDef ? activeArrowDef.icon : DEFAULT_ICONS.arrowLinear)

  const activeShapeDef = shapeOptions.find((s) => s.kind === activeShape)
  const shapesGroupLabel = labels?.shapesGroup ?? (isShapeToolActive && activeShapeDef ? activeShapeDef.label : 'Shapes')
  const currentShapeIcon = icons?.shapesGroup ?? (isShapeToolActive && activeShapeDef ? activeShapeDef.icon : DEFAULT_ICONS.shapesGroup)

  const activeToolInfo = getActiveToolInfo(
    activeTool,
    isArrowToolActive,
    currentArrowIcon,
    arrowGroupLabel,
    currentShapeIcon,
    shapesGroupLabel,
    icons,
    labels,
  )

  const stopEvent = (e: React.SyntheticEvent) => e.stopPropagation()

  if (isCollapsed) {
    return (
      <div
        data-tual-toolbar
        data-readonly={readOnly || undefined}
        data-position={position}
        data-orientation={orientation}
        data-collapsed="true"
        className={['rlc-toolbar', 'rlc-toolbar-collapsed', readOnly ? 'rlc-toolbar-readonly' : undefined, classNames?.toolbar, classNames?.toolbarCollapsed, className].filter(Boolean).join(' ')}
        onClick={stopEvent}
        onDoubleClick={stopEvent}
        onPointerDown={stopEvent}
        onWheel={stopEvent}
        style={{ position: 'absolute', zIndex: 1000, pointerEvents: 'auto', userSelect: 'none', ...POSITION_STYLES[position], ...styles?.toolbar, ...styles?.toolbarCollapsed, ...style }}
      >
        <ExpandTriggerButton position={position} orientation={orientation} showToolLabels={showToolLabels} unstyled={unstyled} activeToolInfo={activeToolInfo} labels={labels} icons={icons} classNames={classNames} styles={styles} onExpand={() => handleToggleCollapse(false)} />
      </div>
    )
  }

  return (
    <div
      data-tual-toolbar
      data-readonly={readOnly || undefined}
      data-position={position}
      data-orientation={orientation}
      className={['rlc-toolbar', readOnly ? 'rlc-toolbar-readonly' : undefined, classNames?.toolbar, className].filter(Boolean).join(' ')}
      onClick={stopEvent}
      onDoubleClick={stopEvent}
      onPointerDown={stopEvent}
      onWheel={stopEvent}
      style={{
        position: 'absolute',
        zIndex: 1000,
        pointerEvents: 'auto',
        userSelect: 'none',
        ...POSITION_STYLES[position],
        ...getToolbarContainerStyle(position, isVertical, unstyled),
        ...styles?.toolbar,
        ...style,
      }}
    >
      <PrimaryToolbarStrip
        controller={controller}
        readOnly={readOnly}
        position={position}
        orientation={orientation}
        isVertical={isVertical}
        showToolLabels={showToolLabels}
        collapsible={collapsible}
        showCollapseButton={showCollapseButton}
        enabledTools={enabledTools}
        customTools={customTools}
        showHistoryControls={showHistoryControls}
        showDeleteButton={showDeleteButton}
        showClearButton={showClearButton}
        labels={labels}
        icons={icons}
        unstyled={unstyled}
        classNames={classNames}
        styles={styles}
        arrowOptions={arrowOptions}
        shapeOptions={shapeOptions}
        arrowGroupLabel={arrowGroupLabel}
        currentArrowIcon={currentArrowIcon}
        shapesGroupLabel={shapesGroupLabel}
        currentShapeIcon={currentShapeIcon}
        isArrowToolActive={isArrowToolActive}
        isShapeToolActive={isShapeToolActive}
        arrowDropdownOpen={arrowDropdownOpen}
        shapesModalOpen={shapesModalOpen}
        arrowGroupRef={arrowGroupRef}
        shapesGroupRef={shapesGroupRef}
        setArrowDropdownOpen={setArrowDropdownOpen}
        setShapesModalOpen={setShapesModalOpen}
        getButtonClassName={(active) => getToolbarButtonClassName(active, classNames)}
        getButtonStyle={(active) => getToolbarButtonStyle(active, isVertical, showToolLabels, readOnly, unstyled, styles)}
        onCollapse={() => handleToggleCollapse(true)}
      />

      {showSettingsBar && (
        <ContextualSettingsBar
          isArrowContext={isArrowContext}
          isFreeDrawContext={isFreeDrawContext}
          isShapeContext={isShapeContext}
          isRulerContext={isRulerContext}
          isTextContext={isTextContext}
          isNoteContext={isNoteContext}
          selectedItem={selectedItem}
          selectedShape={selectedItem?.type === 'shape' ? (selectedItem as ShapeItem) : null}
          selectedArrow={selectedItem?.type === 'arrow' ? (selectedItem as ArrowItem) : null}
          selectedText={selectedItem?.type === 'text' ? (selectedItem as TextItem) : null}
          activeColor={controller.activeColor} setActiveColor={controller.setActiveColor}
          strokeWidth={controller.strokeWidth} setStrokeWidth={controller.setStrokeWidth}
          strokeWidthOptions={strokeWidthOptions}
          dashed={controller.dashed} setDashed={controller.setDashed}
          shapeFilled={controller.shapeFilled} setShapeFilled={controller.setShapeFilled}
          noteColor={controller.noteColor} setNoteColor={controller.setNoteColor}
          fontSize={controller.fontSize} setFontSize={controller.setFontSize}
          fontSizeOptions={fontSizeOptions}
          fontWeight={controller.fontWeight} setFontWeight={controller.setFontWeight}
          updateItem={controller.updateItem}
          notifyChangeComplete={controller.notifyChangeComplete}
          isEditingLabel={controller.isEditingLabel}
          setEditingLabel={controller.setEditingLabel}
          strokeColors={strokeColors}
          orientation={orientation}
          labels={labels}
          icons={icons}
          unstyled={unstyled}
          classNames={classNames}
          styles={styles}
        />
      )}
    </div>
  )
}
