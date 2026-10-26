'use client'

import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet'
import {
  LeafletTual,
  type Controller,
} from 'leaflet-tual/react'
import type { FreeTileLayer } from '../../../data/tiles'
import type { ShowcasePreset } from '../../../data/presets'
import { MapViewSynchronizer } from './map-view-synchronizer'
import type { WorkbenchToolbarPosition } from './workbench-configuration-selects'

interface WorkbenchMapViewProps {
  activePreset: ShowcasePreset
  activeTile: FreeTileLayer
  controller: Controller
  canvasTheme: 'default' | 'homepage'
  readOnly: boolean
  collapsible: boolean
  toolbarPosition: WorkbenchToolbarPosition
}

export function WorkbenchMapView({
  activePreset,
  activeTile,
  controller,
  canvasTheme,
  readOnly,
  collapsible,
  toolbarPosition,
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
        <LeafletTual
          controller={controller}
          readOnly={readOnly}
          toolbar={{
            position: toolbarPosition,
            collapsible,
          }}
          collapseBelowZoom={{ notes: 12 }}
        />
      </MapContainer>
    </div>
  )
}
