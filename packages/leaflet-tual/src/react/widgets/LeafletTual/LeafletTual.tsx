'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type L from 'leaflet'
import { useMap } from 'react-leaflet'
import type { Controller, InternalController, Item } from '../../../core/index.js'
import { hitTest } from '../../../core/index.js'
import { useLeafletTual } from '../../features/use-leaflet-tual.js'
import { useLeafletSync } from '../../features/use-leaflet-sync.js'
import { useControllerState } from '../../features/use-controller-state.js'
import { TranslationProvider } from '../../features/i18n/index.js'

import { Toolbar } from '../Toolbar/Toolbar.js'
import { SecondaryTooltip } from '../SecondaryTooltip/SecondaryTooltip.js'
import { ContextMenu, type ContextMenuPosition } from '../ContextMenu/index.js'
import { Sidebar, SidebarTriggerBar } from '../Sidebar/index.js'
import type { LeafletTualProps } from '../../types/index.js'
import { InlineShapeLabelEditor, NoteOverlayView, TextOverlayView } from './overlays/index.js'
import { drawCanvasScene, type CanvasGesture, useCanvasGestures } from './gestures/index.js'
import { useKeyboardShortcuts, useMapInteractions, useThemeResolver } from './hooks/index.js'

function LeafletTualInner({ map, props }: { map: L.Map; props: LeafletTualProps }) {
  const internalController = useLeafletTual({
    defaultValue: props.defaultValue,
    value: props.value,
    onChange: props.onChange,
    readOnly: props.readOnly,
    theme: props.theme,
    translations: props.translations,
  })

  const controller: Controller = props.controller ?? internalController
  const resolvedScheme = useThemeResolver(props.theme ?? controller.theme)

  useEffect(() => {
    const internal = controller as InternalController
    internal._setMap?.(map)
  }, [controller, map])

  useEffect(() => {
    if (props.controller && props.theme !== undefined && props.controller.theme !== props.theme) {
      props.controller.setTheme(props.theme)
    }
  }, [props.controller, props.theme])

  useEffect(() => {
    if (props.controller && props.translations) {
      props.controller.setTranslations(props.translations)
    }
  }, [props.controller, props.translations])

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [currentZoom, setCurrentZoom] = useState(() => map.getZoom())
  const [activeGesture, setActiveGesture] = useState<CanvasGesture | null>(null)
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null)
  const isShiftPressedRef = useRef(false)

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawCanvasScene(
      canvas,
      map,
      controller,
      activeGesture,
      isShiftPressedRef.current,
      hoveredItemId,
    )
  }, [activeGesture, controller, hoveredItemId, map])

  useLeafletSync(map, () => {
    setCurrentZoom(map.getZoom())
    redraw()
  })

  useControllerState(controller, redraw)

  useEffect(() => {
    redraw()
  }, [redraw])

  useMapInteractions(map, controller)

  const gestures = useCanvasGestures({
    canvasRef,
    map,
    controller,
    activeGesture,
    setActiveGesture,
    isShiftPressedRef,
    setHoveredItemId,
  })

  useEffect(() => {
    window.addEventListener('mousemove', gestures.handleMouseMove)
    window.addEventListener('mouseup', gestures.handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', gestures.handleMouseMove)
      window.removeEventListener('mouseup', gestures.handleMouseUp)
    }
  }, [gestures.handleMouseMove, gestures.handleMouseUp])

  useKeyboardShortcuts(
    controller,
    () => {
      setContextMenuPos(null)
      gestures.cancelGesture()
    },
    gestures.finishPen,
  )

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [contextMenuPos, setContextMenuPos] = useState<ContextMenuPosition | null>(null)

  useEffect(() => {
    if (!isSidebarOpen && controller.tool === 'select') {
      map.dragging?.enable()
    }
  }, [isSidebarOpen, controller.tool, map])

  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (controller.readOnly) return
      const target = e.target as Element | null
      if (
        target?.closest?.(
          '.tual-toolbar, .tual-secondary-tooltip, .tual-popover, .tual-context-menu, .tual-sidebar',
        )
      ) {
        return
      }
      const canvas = canvasRef.current
      const rect = canvas?.getBoundingClientRect()
      const pt = rect
        ? { x: e.clientX - rect.left, y: e.clientY - rect.top }
        : { x: e.clientX, y: e.clientY }

      const isOverlayItem = target?.closest?.('.tual-note-card, .tual-text-item')
      if (!isOverlayItem) {
        const hitItem = [...controller.items]
          .reverse()
          .find((item) => hitTest(item, pt, 12, map))
        if (hitItem) {
          if (!controller.selection.includes(hitItem.id)) {
            controller.select(hitItem.id)
          }
        } else if (controller.selection.length === 0) {
          setContextMenuPos(null)
          return
        }
      }

      e.preventDefault()
      e.stopPropagation()
      controller.edit(null)
      setContextMenuPos(pt)
    },
    [controller, map],
  )

  const handleSidebarItemContextMenu = useCallback(
    (_item: Item, e: React.MouseEvent) => {
      if (!canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()
      const pt = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      controller.edit(null)
      setContextMenuPos(pt)
    },
    [controller],
  )

  const showToolbar = props.toolbar !== false && (!props.readOnly || Boolean(props.toolbar))

  return (
    <TranslationProvider translations={controller.translations}>
      <div
        className="tual tual-container"
        data-theme={resolvedScheme}
        style={{ zIndex: 650 }}
        onContextMenu={handleContextMenu}
      >
        <canvas
          ref={canvasRef}
          className="tual-canvas"
          style={{ cursor: controller.tool !== 'select' ? 'crosshair' : 'default' }}
          onMouseDown={(e) => {
            if (e.button === 0) setContextMenuPos(null)
            gestures.handlePointerDown(e)
          }}
          onMouseLeave={() => gestures.clearHover()}
        />

        {/* Inline Shape & Arrow Label Editors */}
        {controller.items.map((item) =>
          (item.type === 'shape' || item.type === 'arrow') && controller.editingId === item.id ? (
            <InlineShapeLabelEditor key={item.id} map={map} item={item} controller={controller} />
          ) : null,
        )}

        {/* Floating Contextual Secondary Tooltip above single selected shape / item (hidden on multi-select, marquee drag, context menu, or sidebar) */}
        {!isSidebarOpen &&
          !contextMenuPos &&
          activeGesture?.type !== 'marquee' &&
          controller.selected.length === 1 &&
          !controller.readOnly && (
            <SecondaryTooltip
              map={map}
              controller={controller}
              sidebarOpen={isSidebarOpen}
              onOpenSidebar={() => setIsSidebarOpen(true)}
            />
          )}

        {/* Note overlays */}
        {controller.items.map((item) =>
          item.type === 'note' ? (
            <NoteOverlayView
              key={item.id}
              map={map}
              note={item}
              controller={controller}
              currentZoom={currentZoom}
            />
          ) : null,
        )}

        {/* Text overlays */}
        {controller.items.map((item) =>
          item.type === 'text' ? (
            <TextOverlayView
              key={item.id}
              map={map}
              textItem={item}
              controller={controller}
              currentZoom={currentZoom}
            />
          ) : null,
        )}

        {/* Floating Toolbar */}
        {showToolbar && (
          <Toolbar
            controller={controller}
            map={map}
            currentZoom={currentZoom}
            {...(typeof props.toolbar === 'object' ? props.toolbar : {})}
          />
        )}

        {/* Floating Sidebar & Zoom Trigger Tooltip */}
        {showToolbar && (
          <SidebarTriggerBar
            controller={controller}
            map={map}
            currentZoom={currentZoom}
            sidebarOpen={isSidebarOpen}
            onToggleSidebar={() =>
              setIsSidebarOpen((open) => {
                const next = !open
                if (!next && controller.tool === 'select') {
                  map.dragging?.enable()
                }
                return next
              })
            }
          />
        )}
      </div>

      {/* Right Properties & Layers Sidebar — own overlay layer so it sits above Leaflet controls (e.g. attribution) */}
      {isSidebarOpen && !controller.readOnly && (
        <div className="tual tual-sidebar-layer" data-theme={resolvedScheme}>
          <Sidebar
            controller={controller}
            map={map}
            onClose={() => {
              setIsSidebarOpen(false)
              if (controller.tool === 'select') {
                map.dragging?.enable()
              }
            }}
            onItemContextMenu={handleSidebarItemContextMenu}
          />
        </div>
      )}

      {/* Right-click Context Menu for single item, multi-selection, or sidebar item */}
      {contextMenuPos && !controller.readOnly && (
        <div className="tual tual-context-menu-layer" data-theme={resolvedScheme}>
          <ContextMenu
            map={map}
            controller={controller}
            position={contextMenuPos}
            onClose={() => setContextMenuPos(null)}
            onOpenSidebar={() => setIsSidebarOpen(true)}
          />
        </div>
      )}
    </TranslationProvider>
  )
}

function MapFromContext({ props }: { props: LeafletTualProps }) {
  return <LeafletTualInner map={useMap()} props={props} />
}

export function LeafletTual(props: LeafletTualProps) {
  return props.map ? (
    <LeafletTualInner map={props.map} props={props} />
  ) : (
    <MapFromContext props={props} />
  )
}
