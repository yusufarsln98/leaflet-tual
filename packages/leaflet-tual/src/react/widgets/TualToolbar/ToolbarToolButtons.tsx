import React from 'react'
import type {
  TualIcons,
  TualLabels,
  TualTool,
  CustomToolbarItem,
  LeafletTualController,
  ShapeKind,
  ToolbarOrientation,
  ToolbarPosition,
  ToolbarToolGroupId,
} from '../../types/index.js'
import { DEFAULT_ICONS } from './icons.js'
import type { ArrowOption, ArrowToolId, ShapeOption } from './types.js'
import { ArrowDropdown } from './ArrowDropdown.js'
import { ShapesModal } from './ShapesModal.js'

export interface ToolbarToolButtonsProps {
  controller: LeafletTualController
  readOnly: boolean
  position: ToolbarPosition
  orientation: ToolbarOrientation
  isVertical: boolean
  showToolLabels: boolean
  enabledTools: readonly ToolbarToolGroupId[]
  customTools?: readonly CustomToolbarItem[]
  labels?: TualLabels
  icons?: TualIcons
  unstyled: boolean
  classNames?: any
  styles?: any
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
}

export function ToolbarToolButtons(props: ToolbarToolButtonsProps) {
  const {
    controller,
    readOnly,
    position,
    orientation,
    isVertical,
    showToolLabels,
    enabledTools,
    customTools,
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
  } = props

  const { activeTool, setActiveTool, activeShape, setActiveShape } = controller

  const renderToolButtonInner = (icon: React.ReactNode, label: string) =>
    isVertical && showToolLabels ? (
      <>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px' }}>{icon}</span>
        <span style={{ whiteSpace: 'nowrap' }}>{label}</span>
        <span />
      </>
    ) : (
      <>
        {icon}
        {showToolLabels && <span>{label}</span>}
      </>
    )

  const renderSimpleToolBtn = (tool: TualTool, label: string, shortcut: string, icon: React.ReactNode, allowInReadOnly = false) => {
    const isActive = activeTool === tool
    return (
      <button
        key={tool}
        type="button"
        disabled={!allowInReadOnly && readOnly}
        aria-disabled={!allowInReadOnly && readOnly ? true : undefined}
        aria-pressed={isActive}
        data-tool={tool}
        data-active={isActive || undefined}
        title={`${label} (${shortcut})`}
        className={getButtonClassName(isActive)}
        onClick={() => {
          if (!allowInReadOnly && readOnly) return
          setActiveTool(tool)
          setArrowDropdownOpen(false)
          setShapesModalOpen(false)
        }}
        style={getButtonStyle(isActive)}
      >
        {renderToolButtonInner(icon, label)}
      </button>
    )
  }

  return (
    <>
      {enabledTools.map((groupId) => {
        if (groupId === 'select') return renderSimpleToolBtn('select', labels?.select ?? 'Select', 'V', icons?.select ?? DEFAULT_ICONS.select, true)
        if (groupId === 'freedraw') return renderSimpleToolBtn('freedraw', labels?.freedraw ?? 'Free Draw', 'P', icons?.freedraw ?? DEFAULT_ICONS.freedraw)
        if (groupId === 'ruler') return renderSimpleToolBtn('ruler', labels?.ruler ?? 'Ruler', 'R', icons?.ruler ?? DEFAULT_ICONS.ruler)
        if (groupId === 'note') return renderSimpleToolBtn('note', labels?.note ?? 'Note Card', 'N', icons?.note ?? DEFAULT_ICONS.note)
        if (groupId === 'text') return renderSimpleToolBtn('text', labels?.text ?? 'Normal Text', 'T', icons?.text ?? DEFAULT_ICONS.text)

        if (groupId === 'arrow') {
          return (
            <ArrowDropdown
              key="arrow"
              isOpen={arrowDropdownOpen}
              readOnly={readOnly}
              isArrowToolActive={isArrowToolActive}
              activeTool={activeTool}
              arrowOptions={arrowOptions}
              arrowGroupLabel={arrowGroupLabel}
              currentArrowIcon={currentArrowIcon}
              showToolLabels={showToolLabels}
              labels={labels}
              icons={icons}
              unstyled={unstyled}
              classNames={classNames}
              styles={styles}
              position={position}
              orientation={orientation}
              arrowGroupRef={arrowGroupRef}
              getButtonClassName={getButtonClassName}
              getButtonStyle={getButtonStyle}
              onToggle={() => { if (!readOnly) { setShapesModalOpen(false); setArrowDropdownOpen((o) => !o) } }}
              onSelectOption={(id: ArrowToolId) => { setActiveTool(id); setArrowDropdownOpen(false) }}
            />
          )
        }

        if (groupId === 'shape') {
          return (
            <ShapesModal
              key="shape"
              isOpen={shapesModalOpen}
              readOnly={readOnly}
              isShapeToolActive={isShapeToolActive}
              activeShape={activeShape}
              shapeOptions={shapeOptions}
              shapesGroupLabel={shapesGroupLabel}
              currentShapeIcon={currentShapeIcon}
              showToolLabels={showToolLabels}
              labels={labels}
              icons={icons}
              unstyled={unstyled}
              classNames={classNames}
              styles={styles}
              position={position}
              orientation={orientation}
              shapesGroupRef={shapesGroupRef}
              getButtonClassName={getButtonClassName}
              getButtonStyle={getButtonStyle}
              onToggle={() => { if (!readOnly) { setArrowDropdownOpen(false); setShapesModalOpen((o) => !o) } }}
              onSelectShape={(kind: ShapeKind) => { setActiveShape(kind); setActiveTool('shape'); setShapesModalOpen(false) }}
            />
          )
        }
        return null
      })}

      {customTools?.map((custom) => {
        if (custom.render) return <React.Fragment key={custom.id}>{custom.render(controller)}</React.Fragment>
        const isActive = Boolean(custom.isActive)
        return (
          <button key={custom.id} type="button" disabled={custom.disabled} aria-pressed={isActive} title={custom.title ?? custom.label} className={getButtonClassName(isActive)} onClick={() => custom.onClick?.(controller)} style={getButtonStyle(isActive)}>
            {renderToolButtonInner(custom.icon, custom.label ?? '')}
          </button>
        )
      })}
    </>
  )
}

