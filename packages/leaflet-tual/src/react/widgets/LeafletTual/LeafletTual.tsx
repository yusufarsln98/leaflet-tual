'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type L from 'leaflet'
import { useMap } from 'react-leaflet'
import type { Controller } from '../../../core/index.js'
import { useLeafletTual } from '../../features/use-leaflet-tual.js'
import { useLeafletSync } from '../../features/use-leaflet-sync.js'
import { Toolbar } from '../Toolbar/Toolbar.js'
import { SecondaryTooltip } from '../SecondaryTooltip/SecondaryTooltip.js'
import type { LeafletTualProps } from '../../types/index.js'
import { InlineShapeLabelEditor } from './InlineShapeLabelEditor.js'
import { NoteOverlayView } from './NoteOverlayView.js'
import { TextOverlayView } from './TextOverlayView.js'
import { drawCanvasScene, type CanvasGesture } from './use-canvas-drawing.js'
import { useCanvasGestures } from './use-canvas-gestures.js'
import { useKeyboardShortcuts } from './use-keyboard-shortcuts.js'
import { useThemeResolver } from './use-theme-resolver.js'

function LeafletTualInner({
  map,
  props,
}: {
  map: L.Map
  props: LeafletTualProps
}) {
  const internalController = useLeafletTual({
    defaultValue: props.defaultValue,
    value: props.value,
    onChange: props.onChange,
    onSelect: props.onSelect,
    onToolChange: props.onToolChange,
    readOnly: props.readOnly,
    theme: props.theme,
    tokens: props.tokens,
  })

  const controller: Controller = props.controller ?? internalController
  const resolvedScheme = useThemeResolver(props.theme)

  useEffect(() => {
    ;(controller as any)._setScheme?.(resolvedScheme)
    ;(controller as any)._setMap?.(map)
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
      props.tokens,
    )
  }, [activeGesture, controller, map, props.tokens, resolvedScheme])

  useLeafletSync(map, () => {
    setCurrentZoom(map.getZoom())
    redraw()
  })

  const [, setTick] = useState(0)

  useEffect(() => {
    const unsub = controller.on('state', () => {
      setTick((t) => t + 1)
      redraw()
    })
    return unsub
  }, [controller, redraw])

  useEffect(() => {
    redraw()
  }, [redraw])

  const hasSelection = controller.selection.length > 0

  useEffect(() => {
    if (!hasSelection) return
    map.scrollWheelZoom?.disable()
    return () => {
      map.scrollWheelZoom?.enable()
    }
  }, [hasSelection, map])

  useEffect(() => {
    const isDrawingTool = controller.tool !== 'select' && !controller.readOnly
    if (isDrawingTool) {
      map.dragging?.disable()
      map.doubleClickZoom?.disable()
    } else {
      map.dragging?.enable()
      map.doubleClickZoom?.enable()
    }

    // Shift is used by the canvas for aspect locks, angle snapping and
    // resizing. Leaflet's box zoom also listens to Shift+drag, so it must stay
    // off while the annotation layer is interactive.
    if (controller.readOnly) {
      map.boxZoom?.enable()
    } else {
      map.boxZoom?.disable()
    }

    return () => {
      map.dragging?.enable()
      map.doubleClickZoom?.enable()
      map.boxZoom?.enable()
    }
  }, [controller.tool, controller.readOnly, map])

  const gestures = useCanvasGestures({ canvasRef, map, controller, activeGesture, setActiveGesture, isShiftPressedRef })

  useEffect(() => {
    window.addEventListener('mousemove', gestures.handleMouseMove)
    window.addEventListener('mouseup', gestures.handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', gestures.handleMouseMove)
      window.removeEventListener('mouseup', gestures.handleMouseUp)
    }
  }, [gestures.handleMouseMove, gestures.handleMouseUp])

  useKeyboardShortcuts(controller, gestures.cancelGesture, gestures.finishPen)

  const cssVariables = useMemo(() => {
    const vars: Record<string, string | number> = {}
    if (props.tokens?.accent) vars['--tual-accent'] = props.tokens.accent
    if (props.tokens?.radius !== undefined) vars['--tual-radius'] = `${props.tokens.radius}px`
    if (props.tokens?.font) vars['--tual-font'] = props.tokens.font
    return vars as React.CSSProperties
  }, [props.tokens])

  const showToolbar = props.toolbar !== false && (!props.readOnly || props.toolbar !== undefined)

  return (
    <div
      className={`tual tual-container ${props.className ?? ''}`}
      data-theme={resolvedScheme}
      style={{ zIndex: props.zIndex ?? 650, ...cssVariables, ...props.style }}
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

      {/* Floating Contextual Secondary Tooltip above selected shape / item */}
      {controller.selected.length > 0 && !controller.readOnly && (
        <SecondaryTooltip map={map} controller={controller} />
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
            className={props.classNames?.note}
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
            className={props.classNames?.text}
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
          classNames={props.classNames}
        />
      )}
    </div>
  )
}

function MapFromContext({ props }: { props: LeafletTualProps }) {
  return <LeafletTualInner map={useMap()} props={props} />
}

export function LeafletTual(props: LeafletTualProps) {
  return props.map ? <LeafletTualInner map={props.map} props={props} /> : <MapFromContext props={props} />
}
