'use client'

import type React from 'react'
import type L from 'leaflet'
import type { Controller } from '../../../../core/index.js'
import { isItemInViewport } from '../../../../core/index.js'
import { LaserPointer } from '../../LaserPointer/index.js'
import { SecondaryTooltip } from '../../SecondaryTooltip/SecondaryTooltip.js'
import type { ContextMenuPosition } from '../../ContextMenu/index.js'
import {
  InlineShapeLabelEditor,
  NoteOverlayView,
  TextOverlayView,
} from '../overlays/index.js'
import type { CanvasGesture } from '../gestures/index.js'

export interface LeafletTualOverlaysProps {
  map: L.Map
  controller: Controller
  currentZoom: number
  contextMenuPos: ContextMenuPosition | null
  activeGesture: CanvasGesture | null
  onOverlayContextMenu: (e: React.MouseEvent) => void
}

export function LeafletTualOverlays({
  map,
  controller,
  currentZoom,
  contextMenuPos,
  activeGesture,
  onOverlayContextMenu,
}: LeafletTualOverlaysProps) {
  const showSecondaryTooltip =
    !contextMenuPos &&
    activeGesture?.type !== 'marquee' &&
    controller.selected.length === 1 &&
    !controller.readOnly

  return (
    <>
      {/* Laser Presentation Overlay */}
      <LaserPointer controller={controller} map={map} />

      {/* Inline Shape & Arrow Label Editors */}
      {controller.items.map((item) =>
        (item.type === 'shape' || item.type === 'arrow') && controller.editingId === item.id ? (
          <InlineShapeLabelEditor key={item.id} map={map} item={item} controller={controller} />
        ) : null,
      )}

      {/* Floating Contextual Secondary Tooltip */}
      {showSecondaryTooltip && (
        <SecondaryTooltip map={map} controller={controller} />
      )}

      {/* Note overlays */}
      {controller.items.map((item) =>
        item.type === 'note' && isItemInViewport(map, item, 100) ? (
          <NoteOverlayView
            key={item.id}
            map={map}
            note={item}
            controller={controller}
            currentZoom={currentZoom}
            onContextMenu={onOverlayContextMenu}
          />
        ) : null,
      )}

      {/* Text overlays */}
      {controller.items.map((item) =>
        item.type === 'text' && isItemInViewport(map, item, 100) ? (
          <TextOverlayView
            key={item.id}
            map={map}
            textItem={item}
            controller={controller}
            currentZoom={currentZoom}
            onContextMenu={onOverlayContextMenu}
          />
        ) : null,
      )}
    </>
  )
}
