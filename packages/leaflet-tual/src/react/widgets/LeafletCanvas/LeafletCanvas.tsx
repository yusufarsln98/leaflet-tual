'use client'

import { createPortal } from 'react-dom'
import { useMap } from 'react-leaflet'
import type L from 'leaflet'
import type { LeafletCanvasProps } from '../../types/index.js'
import { LeafletCanvasDom } from './LeafletCanvasDom.js'
import { useLeafletCanvasOverlay } from './use-leaflet-canvas-overlay.js'

function LeafletCanvasWithContext(props: Omit<LeafletCanvasProps, 'map'>) {
  const map = useMap()
  return <LeafletCanvasOverlay {...props} map={map} />
}

export function LeafletCanvas(props: LeafletCanvasProps) {
  if (props.map !== undefined) {
    return <LeafletCanvasOverlay {...props} map={props.map} />
  }
  return <LeafletCanvasWithContext {...props} />
}

export const LeafletTual = LeafletCanvas

function LeafletCanvasOverlay(props: LeafletCanvasProps & { map: L.Map | null }) {
  const {
    map,
    toolbarPosition = 'top-center',
    toolbarOrientation,
    orientation: propOrientation,
    collapsible,
    defaultCollapsed,
    collapsed,
    onCollapsedChange,
    showCollapseButton,
    enabledTools,
    customTools,
    showHistoryControls,
    showDeleteButton,
    showClearButton,
    showToolLabels,
    labels,
    icons,
    zIndex = 650,
    unstyled = false,
    classNames,
    styles,
    strokeColors,
    strokeWidthOptions,
    fontSizeOptions,
    renderToolbar,
    renderNote,
    renderText,
    clampOverlaysToViewport = true,
    autoMinimizeNotesZoom,
    autoMinimizeTextZoom,
    className,
    style,
  } = props

  const overlayState = useLeafletCanvasOverlay(props)

  if (!map) return null

  return createPortal(
    <LeafletCanvasDom
      map={map}
      canvasRef={overlayState.canvasRef}
      viewport={overlayState.viewport}
      isReadOnly={overlayState.isReadOnly}
      isDrawingTool={overlayState.isDrawingTool}
      activeTool={overlayState.controller.activeTool}
      hoverCursor={overlayState.hoverCursor}
      zIndex={zIndex}
      className={className}
      style={style}
      classNames={classNames}
      styles={styles}
      handleInteractionPointerDown={overlayState.handleInteractionPointerDown}
      handleInteractionPointerMove={overlayState.handleInteractionPointerMove}
      noteItems={overlayState.noteItems}
      textItems={overlayState.textItems}
      selectedId={overlayState.selectedId}
      labels={labels}
      icons={icons}
      unstyled={unstyled}
      clampOverlaysToViewport={clampOverlaysToViewport}
      autoMinimizeNotesZoom={autoMinimizeNotesZoom}
      autoMinimizeTextZoom={autoMinimizeTextZoom}
      renderNote={renderNote}
      renderText={renderText}
      setSelectedId={overlayState.setSelectedId}
      updateItem={overlayState.updateItem}
      removeItem={overlayState.removeItem}
      notifyChangeComplete={overlayState.notifyChangeComplete}
      renderToolbar={renderToolbar}
      showToolbar={overlayState.showToolbar}
      controller={overlayState.controller}
      toolbarPosition={toolbarPosition}
      toolbarOrientation={toolbarOrientation ?? propOrientation}
      collapsible={collapsible}
      defaultCollapsed={defaultCollapsed}
      collapsed={collapsed}
      onCollapsedChange={onCollapsedChange}
      showCollapseButton={showCollapseButton}
      enabledTools={enabledTools}
      customTools={customTools}
      showHistoryControls={showHistoryControls}
      showDeleteButton={showDeleteButton}
      showClearButton={showClearButton}
      showToolLabels={showToolLabels}
      strokeColors={strokeColors}
      strokeWidthOptions={strokeWidthOptions}
      fontSizeOptions={fontSizeOptions}
    />,
    map.getContainer(),
  )
}
