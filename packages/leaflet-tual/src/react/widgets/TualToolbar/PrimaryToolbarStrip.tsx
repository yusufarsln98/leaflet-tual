import type React from 'react'
import type {
  TualIcons,
  TualLabels,
  CustomToolbarItem,
  LeafletTualClassNames,
  LeafletTualController,
  LeafletTualStyles,
  ToolbarOrientation,
  ToolbarPosition,
  ToolbarToolGroupId,
} from '../../types/index.js'
import type { ArrowOption, ShapeOption } from './types.js'
import { ActionButtons } from './ActionButtons.js'
import { CollapseTriggerButton } from './CollapseButtons.js'
import { ToolbarToolButtons } from './ToolbarToolButtons.js'

export interface PrimaryToolbarStripProps {
  controller: LeafletTualController
  readOnly: boolean
  position: ToolbarPosition
  orientation: ToolbarOrientation
  isVertical: boolean
  showToolLabels: boolean
  collapsible: boolean
  showCollapseButton: boolean
  enabledTools: readonly ToolbarToolGroupId[]
  customTools?: readonly CustomToolbarItem[]
  showHistoryControls: boolean
  showDeleteButton: boolean
  showClearButton: boolean
  labels?: TualLabels
  icons?: TualIcons
  unstyled: boolean
  classNames?: LeafletTualClassNames
  styles?: LeafletTualStyles
  arrowOptions: readonly ArrowOption[]
  shapeOptions: readonly ShapeOption[]
  arrowGroupLabel: string
  currentArrowIcon: React.ReactNode
  shapesGroupLabel: string
  currentShapeIcon: React.ReactNode
  isArrowToolActive: boolean
  isShapeToolActive: boolean
  arrowDropdownOpen: boolean
  shapesModalOpen: boolean
  arrowGroupRef: React.RefObject<HTMLDivElement | null>
  shapesGroupRef: React.RefObject<HTMLDivElement | null>
  setArrowDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>
  setShapesModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  getButtonClassName: (isActive: boolean) => string
  getButtonStyle: (isActive: boolean) => React.CSSProperties
  onCollapse: () => void
}

export function PrimaryToolbarStrip(props: PrimaryToolbarStripProps) {
  const {
    controller,
    readOnly,
    position,
    orientation,
    isVertical,
    showToolLabels,
    collapsible,
    showCollapseButton,
    enabledTools,
    customTools,
    showHistoryControls,
    showDeleteButton,
    showClearButton,
    labels,
    icons,
    unstyled,
    classNames,
    styles,
    arrowOptions,
    shapeOptions,
    arrowGroupLabel,
    currentArrowIcon,
    shapesGroupLabel,
    currentShapeIcon,
    isArrowToolActive,
    isShapeToolActive,
    arrowDropdownOpen,
    shapesModalOpen,
    arrowGroupRef,
    shapesGroupRef,
    setArrowDropdownOpen,
    setShapesModalOpen,
    getButtonClassName,
    getButtonStyle,
    onCollapse,
  } = props

  return (
    <div
      role="toolbar"
      aria-label="Map annotation tools"
      className={['rlc-toolbar-primary', classNames?.toolbarPrimary].filter(Boolean).join(' ')}
      style={{
        ...(unstyled
          ? {}
          : {
              display: 'flex',
              flexDirection: isVertical ? 'column' : 'row',
              alignItems: isVertical && showToolLabels ? 'stretch' : 'center',
              gap: '3px',
              padding: '3px',
              boxSizing: 'border-box',
              minWidth: isVertical ? (showToolLabels ? 'auto' : '38px') : undefined,
              width: isVertical ? (showToolLabels ? 'auto' : '38px') : undefined,
              backgroundColor: '#f0f0f0',
              border: '1px solid #767676',
              borderRadius: '2px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
              color: '#000000',
            }),
        ...styles?.toolbarPrimary,
      }}
    >
      <ToolbarToolButtons
        controller={controller}
        readOnly={readOnly}
        position={position}
        orientation={orientation}
        isVertical={isVertical}
        showToolLabels={showToolLabels}
        enabledTools={enabledTools}
        customTools={customTools}
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
        getButtonClassName={getButtonClassName}
        getButtonStyle={getButtonStyle}
      />

      <ActionButtons
        readOnly={readOnly}
        showHistoryControls={showHistoryControls}
        showDeleteButton={showDeleteButton}
        showClearButton={showClearButton}
        showToolLabels={showToolLabels}
        selectedItem={controller.selectedItem}
        itemsCount={controller.items.length}
        canUndo={controller.canUndo}
        canRedo={controller.canRedo}
        undo={controller.undo}
        redo={controller.redo}
        deleteSelected={controller.deleteSelected}
        clearAll={controller.clearAll}
        orientation={orientation}
        labels={labels}
        icons={icons}
        unstyled={unstyled}
        classNames={classNames}
        styles={styles}
      />

      {collapsible && showCollapseButton && (
        <CollapseTriggerButton
          position={position}
          orientation={orientation}
          isVertical={isVertical}
          showToolLabels={showToolLabels}
          unstyled={unstyled}
          labels={labels}
          icons={icons}
          classNames={classNames}
          styles={styles}
          onCollapse={onCollapse}
        />
      )}
    </div>
  )
}
