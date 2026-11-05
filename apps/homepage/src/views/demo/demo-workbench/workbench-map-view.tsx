'use client'

import { MapContainer, TileLayer } from 'react-leaflet'
import { LeafletTual, type Controller } from 'leaflet-tual/react'
import type { FreeTileLayer } from '../../../data/tiles'
import type { ShowcasePreset } from '../../../data/presets'
import { MapViewSynchronizer } from './map-view-synchronizer'
import type { WorkbenchToolbarPosition } from './workbench-configuration-selects'
import { WORKBENCH_THEME_TOKENS } from './workbench-theme'

interface WorkbenchMapViewProps {
  activePreset: ShowcasePreset
  activeTile: FreeTileLayer
  controller: Controller
  readOnly: boolean
  toolbarPosition: WorkbenchToolbarPosition
  applyTheme: boolean
}

export function WorkbenchMapView({
  activePreset,
  activeTile,
  controller,
  readOnly,
  toolbarPosition,
  applyTheme,
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
          themeTokens={applyTheme ? WORKBENCH_THEME_TOKENS : undefined}
          toolbar={{ position: toolbarPosition }}
        />
      </MapContainer>
    </div>
  )
}
