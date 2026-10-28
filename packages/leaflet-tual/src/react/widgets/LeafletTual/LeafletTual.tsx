'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type L from 'leaflet'
import { useMap } from 'react-leaflet'
import type { Controller, InternalController } from '../../../core/index.js'
import { useLeafletTual } from '../../features/use-leaflet-tual.js'
import { useLeafletSync } from '../../features/use-leaflet-sync.js'
import { TranslationProvider } from '../../features/i18n/index.js'
import { Toolbar } from '../Toolbar/Toolbar.js'
import { SecondaryTooltip } from '../SecondaryTooltip/SecondaryTooltip.js'
import { Sidebar, SidebarTriggerBar } from '../Sidebar/index.js'
import type { LeafletTualProps } from '../../types/index.js'
import { InlineShapeLabelEditor, NoteOverlayView, TextOverlayView } from './overlays/index.js'
import { drawCanvasScene, type CanvasGesture, useCanvasGestures } from './gestures/index.js'
import { useKeyboardShortcuts, useThemeResolver, useMapInteractions } from './hooks/index.js'

function LeafletTualInner({ map, props }: { map: L.Map; props: LeafletTualProps }) {
  const internalController = useLeafletTual({
    defaultValue: props.defaultValue,
    value: props.value,
    onChange: props.onChange,
    onSelect: props.onSelect,
    onToolChange: props.onToolChange,
    readOnly: props.readOnly,
    theme: props.theme,
    translations: props.translations,
  })

  const controller: Controller = props.controller ?? internalController
  const resolvedScheme = useThemeResolver(props.theme ?? controller.theme)

  useEffect(() => {
    const internal = controller as InternalController
    internal._setScheme?.(resolvedScheme)
    internal._setMap?.(map)
  }, [controller, resolvedScheme, map])

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [currentZoom, setCurrentZoom] = useState(() => map.getZoom())
  const [activeGesture, setActiveGesture] = useState<CanvasGesture | null>(null)
  const isShiftPressedRef = useRef(false)

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    drawCanvasScene(
      canvas,
      map,
      controller,
      resolvedScheme,
      activeGesture,
      isShiftPressedRef.current,
    )
  }, [activeGesture, controller, map, resolvedScheme])

  useLeafletSync(map, () => {
    setCurrentZoom(map.getZoom())
    redraw()
  })

  const [, setTick] = useState(0)

  useEffect(() => {
    return controller.on('state', () => {
      setTick((t) => t + 1)
      redraw()
    })
  }, [controller, redraw])

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
  })

  useEffect(() => {
    window.addEventListener('mousemove', gestures.handleMouseMove)
    window.addEventListener('mouseup', gestures.handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', gestures.handleMouseMove)
      window.removeEventListener('mouseup', gestures.handleMouseUp)
    }
  }, [gestures.handleMouseMove, gestures.handleMouseUp])

  useKeyboardShortcuts(controller, gestures.cancelGesture, gestures.finishPen)

  const [internalSidebarOpen, setInternalSidebarOpen] = useState(
    props.defaultSidebarOpen ?? false,
  )
  const isSidebarOpen =
    props.sidebarOpen !== undefined ? props.sidebarOpen : internalSidebarOpen

  const handleSidebarChange = (next: boolean) => {
    setInternalSidebarOpen(next)
    props.onSidebarOpenChange?.(next)
  }

  const showToolbar = props.toolbar !== false && (!props.readOnly || props.toolbar !== undefined)
  const showSidebarControl =
    props.sidebar !== false && showToolbar && (typeof props.toolbar !== 'object' || props.toolbar.zoom !== false)

  return (
    <TranslationProvider translations={props.translations}>
      <div
        className="tual tual-container"
        data-theme={resolvedScheme}
        style={{ zIndex: props.zIndex ?? 650 }}
      >
        <canvas
          ref={canvasRef}
          className="tual-canvas"
          style={{ cursor: controller.tool !== 'select' ? 'crosshair' : 'default' }}
          onMouseDown={gestures.handlePointerDown}
        />

        {/* Inline Shape & Arrow Label Editors */}
        {controller.items.map((item) =>
          (item.type === 'shape' || item.type === 'arrow') && controller.editingId === item.id ? (
            <InlineShapeLabelEditor key={item.id} map={map} item={item} controller={controller} />
          ) : null,
        )}

        {/* Floating Contextual Secondary Tooltip above selected shape / item (hidden when sidebar is active) */}
        {!isSidebarOpen && controller.selected.length > 0 && !controller.readOnly && (
          <SecondaryTooltip
            map={map}
            controller={controller}
            sidebarOpen={isSidebarOpen}
            onOpenSidebar={() => handleSidebarChange(true)}
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
              collapseThreshold={props.collapseBelowZoom?.text}
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
        {showSidebarControl && (
          <SidebarTriggerBar
            controller={controller}
            map={map}
            currentZoom={currentZoom}
            sidebarOpen={isSidebarOpen}
            onToggleSidebar={() => handleSidebarChange(!isSidebarOpen)}
          />
        )}

      </div>

      {/* Right Properties & Layers Sidebar — own overlay layer so it sits above Leaflet controls (e.g. attribution) */}
      {isSidebarOpen && !controller.readOnly && (
        <div className="tual tual-sidebar-layer" data-theme={resolvedScheme}>
          <Sidebar
            controller={controller}
            map={map}
            onClose={() => handleSidebarChange(false)}
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
