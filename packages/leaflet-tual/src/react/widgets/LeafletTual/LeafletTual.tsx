'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type L from 'leaflet'
import { useMap } from 'react-leaflet'
import type { Controller, InternalController } from '../../../core/index.js'
import { useLeafletTual } from '../../features/use-leaflet-tual.js'
import { TranslationProvider } from '../../features/i18n/index.js'
import type { LeafletTualProps } from '../../types/index.js'
import { type CanvasGesture, useCanvasGestures } from './gestures/index.js'
import {
  useCanvasScene,
  useContextMenuCoordinator,
  useKeyboardShortcuts,
  useMapInteractions,
  useMiddleClickPan,
  useThemeResolver,
} from './hooks/index.js'
import { LeafletTualOverlays, LeafletTualWidgets } from './components/index.js'

function LeafletTualInner({ map, props }: { map: L.Map; props: LeafletTualProps }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const internalController = useLeafletTual({
    defaultValue: props.defaultValue,
    value: props.value,
    onChange: props.onChange,
    onGesture: props.onGesture,
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

  const [activeGesture, setActiveGesture] = useState<CanvasGesture | null>(null)
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const isShiftPressedRef = useRef(false)

  const { canvasRef, currentZoom } = useCanvasScene({
    map,
    controller,
    activeGesture,
    hoveredItemId,
    isShiftPressedRef,
  })

  useMapInteractions(map, controller)
  useMiddleClickPan(map, containerRef)

  const {
    contextMenuPos,
    setContextMenuPos,
    openContextMenu,
    closeContextMenu,
    handleContextMenu,
    handleOverlayContextMenu,
    handleSidebarItemContextMenu,
  } = useContextMenuCoordinator({
    map,
    controller,
    canvasRef,
  })

  const gestures = useCanvasGestures({
    canvasRef,
    map,
    controller,
    activeGesture,
    setActiveGesture,
    isShiftPressedRef,
    setHoveredItemId,
    onOpenContextMenu: openContextMenu,
    onCloseContextMenu: closeContextMenu,
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
    gestures.finishArea,
  )

  useEffect(() => {
    if (!isSidebarOpen && (controller.tool === 'select' || controller.tool === 'laser')) {
      map.dragging?.enable()
    }
  }, [isSidebarOpen, controller.tool, map])

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((open) => {
      const next = !open
      if (!next && (controller.tool === 'select' || controller.tool === 'laser')) {
        map.dragging?.enable()
      }
      return next
    })
  }, [controller.tool, map])

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false)
    if (controller.tool === 'select' || controller.tool === 'laser') {
      map.dragging?.enable()
    }
  }, [controller.tool, map])

  return (
    <TranslationProvider translations={controller.translations}>
      <div
        ref={containerRef}
        className="tual tual-container"
        data-theme={resolvedScheme}
        style={{ zIndex: 650 }}
        onContextMenu={handleContextMenu}
      >
        <canvas
          ref={canvasRef}
          className="tual-canvas"
          style={{
            cursor: controller.tool !== 'select' ? 'crosshair' : 'default',
          }}
          onMouseDown={(e) => {
            if (e.button === 0) setContextMenuPos(null)
            gestures.handlePointerDown(e)
          }}
          onMouseLeave={() => {
            gestures.clearHover()
          }}
        />

        <LeafletTualOverlays
          map={map}
          controller={controller}
          currentZoom={currentZoom}
          isSidebarOpen={isSidebarOpen}
          contextMenuPos={contextMenuPos}
          activeGesture={activeGesture}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOverlayContextMenu={handleOverlayContextMenu}
        />

        <LeafletTualWidgets
          map={map}
          controller={controller}
          currentZoom={currentZoom}
          isSidebarOpen={isSidebarOpen}
          contextMenuPos={contextMenuPos}
          resolvedScheme={resolvedScheme}
          toolbarProps={props.toolbar}
          readOnly={props.readOnly}
          onToggleSidebar={toggleSidebar}
          onCloseSidebar={closeSidebar}
          onCloseContextMenu={closeContextMenu}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onSidebarItemContextMenu={handleSidebarItemContextMenu}
        />
      </div>
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
