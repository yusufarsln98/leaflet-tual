'use client'

import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet'
import {
  type ArrowRenderTheme,
  LeafletCanvas,
  type LeafletCanvasController,
  type LeafletCanvasStyles,
  type ToolbarPosition,
} from 'leaflet-tual/react'
import type { FreeTileLayer } from '../../../data/tiles'
import type { ShowcasePreset } from '../../../data/presets'
import { MapViewSynchronizer } from './map-view-synchronizer'

interface WorkbenchMapViewProps {
  activePreset: ShowcasePreset
  activeTile: FreeTileLayer
  controller: LeafletCanvasController
  canvasTheme: 'default' | 'homepage'
  arrowTheme: ArrowRenderTheme
  canvasStyles: LeafletCanvasStyles
  strokeColors: string[]
  readOnly: boolean
  collapsible: boolean
  toolbarPosition: ToolbarPosition
  showToolLabels: boolean
}

export function WorkbenchMapView({
  activePreset,
  activeTile,
  controller,
  canvasTheme,
  arrowTheme,
  canvasStyles,
  strokeColors,
  readOnly,
  collapsible,
  toolbarPosition,
  showToolLabels,
}: WorkbenchMapViewProps) {
  return (
    <div className="w-full h-full relative bg-bg-app" data-canvas-theme={canvasTheme}>
      <MapContainer
        center={activePreset.center}
        zoom={activePreset.zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <ZoomControl position="bottomleft" />
        <MapViewSynchronizer center={activePreset.center} zoom={activePreset.zoom} />
        <TileLayer
          key={activeTile.id}
          url={activeTile.url}
          subdomains={activeTile.subdomains || 'abc'}
          attribution={activeTile.attribution}
          maxZoom={activeTile.maxZoom}
        />
        <LeafletCanvas
          controller={controller}
          annotationTheme={canvasTheme === 'default' ? undefined : arrowTheme}
          styles={canvasTheme === 'default' ? undefined : canvasStyles}
          strokeColors={canvasTheme === 'default' ? undefined : strokeColors}
          readOnly={readOnly}
          collapsible={collapsible}
          toolbarPosition={toolbarPosition}
          showToolLabels={showToolLabels}
          autoMinimizeNotesZoom={12}
        />
      </MapContainer>
    </div>
  )
}
