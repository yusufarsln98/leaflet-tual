'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type L from 'leaflet'
import { useMap } from 'react-leaflet'
import type { Controller, InternalController } from '../../../core/index.js'
import { themeTokensToCssVariables } from '../../../shared/theme/index.js'
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
    translations: props.translations,
  })

  const controller: Controller = props.controller ?? internalController

  useEffect(() => {
    const internal = controller as InternalController
    internal._setMap?.(map)
  }, [controller, map])

  useEffect(() => {
    if (props.controller && props.translations) {
      props.controller.setTranslations(props.translations)
    }
  }, [props.controller, props.translations])

  const [activeGesture, setActiveGesture] = useState<CanvasGesture | null>(null)
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null)
  const [sidebarVisible, setSidebarVisible] = useState(Boolean(props.sidebar))
  const isShiftPressedRef = useRef(false)
  const sidebarOpen = sidebarVisible && !controller.readOnly
  const onSidebarChange = props.onSidebarChange

  useEffect(() => {
    setSidebarVisible(Boolean(props.sidebar))
  }, [props.sidebar])

  const toggleSidebar = useCallback(() => {
    if (controller.readOnly) return
    const next = !sidebarVisible
    setSidebarVisible(next)
    onSidebarChange?.(next)
  }, [controller.readOnly, onSidebarChange, sidebarVisible])

  const openSidebar = useCallback(() => {
    if (controller.readOnly) return
    setSidebarVisible(true)
    onSidebarChange?.(true)
  }, [controller.readOnly, onSidebarChange])

  const { canvasRef, currentZoom } = useCanvasScene({
    map,
    controller,
    activeGesture,
    hoveredItemId,
    isShiftPressedRef,
  })

  useEffect(() => {
    if (
      props.controller &&
      props.readOnly !== undefined &&
      props.controller.readOnly !== props.readOnly
    ) {
      props.controller.setReadOnly(props.readOnly)
    }
  }, [props.controller, props.readOnly])

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

  const { cancelGesture } = gestures

  useEffect(() => {
    if (!controller.readOnly) return
    cancelGesture()
    setContextMenuPos(null)
    if (canvasRef.current) canvasRef.current.style.cursor = 'default'
  }, [canvasRef, cancelGesture, controller.readOnly, setContextMenuPos])

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
    props.shortcuts !== false,
  )

  const tokenStyles = props.themeTokens ? themeTokensToCssVariables(props.themeTokens) : undefined

  return (
    <TranslationProvider translations={controller.translations}>
      <div
        ref={containerRef}
        className="tual tual-container"
        data-readonly={controller.readOnly}
        style={{ zIndex: 650, ...tokenStyles }}
        onContextMenu={handleContextMenu}
      >
        <canvas
          ref={canvasRef}
          className="tual-canvas"
          style={{
            cursor: !controller.readOnly && controller.tool !== 'select' ? 'crosshair' : 'default',
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
          sidebarOpen={sidebarOpen}
          contextMenuPos={contextMenuPos}
          activeGesture={activeGesture}
          onOpenSidebar={openSidebar}
          onOverlayContextMenu={handleOverlayContextMenu}
        />

        <LeafletTualWidgets
          map={map}
          controller={controller}
          sidebarOpen={sidebarOpen}
          contextMenuPos={contextMenuPos}
          toolbarProps={props.toolbar}
          shortcuts={props.shortcuts}
          readOnly={props.readOnly ?? controller.readOnly}
          onCloseContextMenu={closeContextMenu}
          onSidebarItemContextMenu={handleSidebarItemContextMenu}
          onToggleSidebar={toggleSidebar}
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
