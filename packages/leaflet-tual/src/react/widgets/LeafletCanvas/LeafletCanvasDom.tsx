import React from 'react'
import type L from 'leaflet'
import type {
  CanvasIcons,
  CanvasItem,
  CanvasLabels,
  CustomToolbarItem,
  LeafletCanvasClassNames,
  LeafletCanvasController,
  LeafletCanvasStyles,
  NoteItem,
  RenderNoteProps,
  RenderTextProps,
  ShapeItem,
  TextItem,
  ToolbarOrientation,
  ToolbarPosition,
  ToolbarToolGroupId,
} from '../../types/index.js'
import { geoToScreen } from '../../shared/index.js'
import { InlineShapeLabelEditor, NoteOverlay, TextOverlay } from '../../entities/index.js'
import { CanvasToolbar } from '../CanvasToolbar/index.js'

export interface LeafletCanvasDomProps {
  map: L.Map
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  viewport: { width: number; height: number; tick: number }
  isReadOnly: boolean
  isDrawingTool: boolean
  activeTool: string
  hoverCursor: string | null
  zIndex: number
  className?: string
  style?: React.CSSProperties
  classNames?: LeafletCanvasClassNames
  styles?: LeafletCanvasStyles
  handleInteractionPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void
  handleInteractionPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void
  noteItems: NoteItem[]
  textItems: TextItem[]
  selectedId: string | null
  labels?: CanvasLabels
  icons?: CanvasIcons
  unstyled?: boolean
  clampOverlaysToViewport?: boolean
  autoMinimizeNotesZoom?: number
  autoMinimizeTextZoom?: number
  renderNote?: (props: RenderNoteProps) => React.ReactNode
  renderText?: (props: RenderTextProps) => React.ReactNode
  setSelectedId: (id: string | null) => void
  updateItem: (id: string, patch: any) => void
  removeItem: (id: string) => void
  notifyChangeComplete: (targetItem?: CanvasItem | null) => void
  renderToolbar?: (controller: LeafletCanvasController) => React.ReactNode
  showToolbar: boolean
  controller: LeafletCanvasController
  toolbarPosition: ToolbarPosition
  toolbarOrientation?: ToolbarOrientation
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
  strokeColors?: readonly string[]
  strokeWidthOptions?: readonly number[]
  fontSizeOptions?: readonly number[]
}

export function LeafletCanvasDom(props: LeafletCanvasDomProps) {
  const {
    map,
    canvasRef,
    viewport,
    isReadOnly,
    isDrawingTool,
    activeTool,
    hoverCursor,
    zIndex,
    className,
    style,
    classNames,
    styles,
    handleInteractionPointerDown,
    handleInteractionPointerMove,
    noteItems,
    textItems,
    selectedId,
    labels,
    icons,
    unstyled,
    clampOverlaysToViewport,
    autoMinimizeNotesZoom,
    autoMinimizeTextZoom,
    renderNote,
    renderText,
    setSelectedId,
    updateItem,
    removeItem,
    notifyChangeComplete,
    renderToolbar,
    showToolbar,
    controller,
    toolbarPosition,
    toolbarOrientation,
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
    strokeColors,
    strokeWidthOptions,
    fontSizeOptions,
  } = props

  return (
    <div
      className={['rlc-overlay', isReadOnly ? 'rlc-readonly' : undefined, classNames?.overlay, className].filter(Boolean).join(' ')}
      data-rlc-overlay
      data-readonly={isReadOnly || undefined}
      style={{ position: 'absolute', inset: 0, zIndex, pointerEvents: 'none', overflow: 'hidden', ...styles?.overlay, ...style }}
    >
      <canvas
        ref={canvasRef}
        className={['rlc-canvas', classNames?.canvas].filter(Boolean).join(' ')}
        style={{ position: 'absolute', inset: 0, width: `${viewport.width}px`, height: `${viewport.height}px`, pointerEvents: 'none', ...styles?.canvas }}
      />

      {isDrawingTool && (
        <div
          data-rlc-drawing-surface
          className={['rlc-drawing-surface', classNames?.drawingSurface].filter(Boolean).join(' ')}
          onPointerDown={handleInteractionPointerDown}
          onPointerMove={handleInteractionPointerMove}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'auto', cursor: activeTool === 'text' ? 'text' : 'crosshair', ...styles?.drawingSurface }}
        />
      )}

      {hoverCursor && !isDrawingTool && <style>{`.leaflet-container { cursor: ${hoverCursor} !important; }`}</style>}

      <div
        className={['rlc-items-container', classNames?.itemsContainer].filter(Boolean).join(' ')}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', ...styles?.itemsContainer }}
      >
        {noteItems.map((note) => (
          <NoteOverlay key={note.id} item={note} screenPos={geoToScreen(map, note.position)} isSelected={!isReadOnly && note.id === selectedId} map={map} readOnly={isReadOnly} labels={labels} icons={icons} unstyled={unstyled} classNames={classNames} styles={styles} clampToViewport={clampOverlaysToViewport} autoMinimizeZoomThreshold={autoMinimizeNotesZoom} renderNote={renderNote} onSelect={setSelectedId} onUpdate={updateItem} onDelete={removeItem} onComplete={notifyChangeComplete} />
        ))}
        {textItems.map((txt) => (
          <TextOverlay key={txt.id} item={txt} screenPos={geoToScreen(map, txt.position)} isSelected={!isReadOnly && txt.id === selectedId} isEditingLabel={!isReadOnly && txt.id === selectedId && Boolean(controller.isEditingLabel)} map={map} readOnly={isReadOnly} labels={labels} icons={icons} unstyled={unstyled} classNames={classNames} styles={styles} clampToViewport={clampOverlaysToViewport} autoMinimizeZoomThreshold={autoMinimizeTextZoom} renderText={renderText} onSelect={setSelectedId} onUpdate={updateItem} onDelete={removeItem} onComplete={notifyChangeComplete} />
        ))}
        {!showToolbar && controller.isEditingLabel && selectedId && (() => {
          const selectedShape = controller.items.find((s) => s.id === selectedId && s.type === 'shape') as ShapeItem | undefined
          if (!selectedShape) return null
          const hasLabelMode =
            selectedShape.labelMode !== false && (selectedShape as any).hasLabelMode !== false
          if (!hasLabelMode) return null
          return (
            <InlineShapeLabelEditor
              shape={selectedShape}
              map={map}
              labels={labels}
              onUpdate={updateItem}
              onClose={() => {
                controller.setEditingLabel?.(false)
                notifyChangeComplete(selectedShape)
              }}
            />
          )
        })()}
      </div>

      {renderToolbar
        ? renderToolbar(controller)
        : showToolbar && (
            <CanvasToolbar
              controller={controller}
              position={toolbarPosition}
              orientation={toolbarOrientation}
              collapsible={collapsible}
              defaultCollapsed={defaultCollapsed}
              collapsed={collapsed}
              onCollapsedChange={onCollapsedChange}
              showCollapseButton={showCollapseButton}
              readOnly={isReadOnly}
              enabledTools={enabledTools}
              customTools={customTools}
              showHistoryControls={showHistoryControls}
              showDeleteButton={showDeleteButton}
              showClearButton={showClearButton}
              showToolLabels={showToolLabels}
              labels={labels}
              icons={icons}
              unstyled={unstyled}
              classNames={classNames}
              styles={styles}
              strokeColors={strokeColors}
              strokeWidthOptions={strokeWidthOptions}
              fontSizeOptions={fontSizeOptions}
            />
          )}
    </div>
  )
}

