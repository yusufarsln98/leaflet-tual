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
  readOnly: boolean
  toolbarPosition: WorkbenchToolbarPosition
  theme: 'light' | 'dark'
}

export function WorkbenchMapView({
  activePreset,
  activeTile,
  controller,
  readOnly,
  toolbarPosition,
  theme,
}: WorkbenchMapViewProps) {
  return (
    <div className="w-full h-full relative bg-bg-app">
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
          theme={theme}
          toolbar={{ position: toolbarPosition }}
          collapseBelowZoom={{ notes: 12 }}
        />
      </MapContainer>
    </div>
  )
}
