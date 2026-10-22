export interface CodeSample {
  id: string
  title: string
  filename: string
  description: string
  code: string
}

export const CODE_SAMPLES: CodeSample[] = [
  {
    id: 'standard',
    title: 'React Integration',
    filename: 'MapCanvasView.tsx',
    description:
      'Embed LeafletTual directly as a child of MapContainer via leaflet-tual/react with an automatic floating toolbar.',
    code: `import { MapContainer, TileLayer } from 'react-leaflet'
import { LeafletTual, useLeafletTual } from 'leaflet-tual/react'
import 'leaflet/dist/leaflet.css'

export function MapCanvasView() {
  const controller = useLeafletTual({
    initialItems: [
      {
        id: 'route-alpha',
        type: 'arrow',
        arrowStyle: 'curved',
        start: { lat: 41.0082, lng: 28.9784 },
        end: { lat: 41.0256, lng: 28.9742 },
        color: '#2563eb',
        strokeWidth: 3,
        label: 'Navigation Route Alpha',
        createdAt: Date.now(),
      },
    ],
  })

  return (
    <MapContainer
      center={[41.018, 28.988]}
      zoom={13}
      style={{ height: '600px', width: '100%' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LeafletTual controller={controller} toolbarPosition="top-center" />
    </MapContainer>
  )
}`,
  },
  {
    id: 'vanilla-core',
    title: 'Vanilla TS Core Engine',
    filename: 'map-canvas.ts',
    description:
      'Mount an interactive canvas directly onto a standard Leaflet L.Map instance with zero React peer dependencies.',
    code: `import L from 'leaflet'
import { createLeafletTual } from 'leaflet-tual'
import 'leaflet/dist/leaflet.css'

const map = L.map('map-viewport').setView([41.018, 28.988], 13)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

// Mount framework-agnostic canvas overlay
const canvas = createLeafletTual(map, {
  initialItems: [],
  onChange: (items) => {
    console.log('Active annotations:', items.length)
  },
})

// Programmatic tool & style control
canvas.controller.setTool('arrow-curved')
canvas.controller.setActiveColor('#2563eb')
canvas.controller.setStrokeWidth(3)`,
  },
  {
    id: 'decoupled-toolbar',
    title: 'Decoupled External Toolbar',
    filename: 'CustomAppHeader.tsx',
    description:
      'Place the toolbar in your app header, sidebar, or docked layout while the canvas renders in the map.',
    code: `import { MapContainer, TileLayer } from 'react-leaflet'
import { CanvasToolbar, LeafletTual, useLeafletTual } from 'leaflet-tual/react'

export function DecoupledApp() {
  const controller = useLeafletTual()

  return (
    <div className="flex flex-col h-screen">
      {/* External Toolbar rendered outside the Map */}
      <header className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex justify-between">
        <h1 className="text-white font-bold">Map Annotations</h1>
        <CanvasToolbar controller={controller} />
      </header>

      {/* Map with embedded toolbar disabled */}
      <div className="flex-1">
        <MapContainer center={[37.795, -122.395]} zoom={13} style={{ height: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LeafletTual controller={controller} showToolbar={false} />
        </MapContainer>
      </div>
    </div>
  )
}`,
  },
  {
    id: 'controlled',
    title: 'Controlled State & Backend Sync',
    filename: 'SyncProvider.tsx',
    description:
      'Synchronize annotations with a remote database, REST API, or WebSocket feed via controlled props.',
    code: `import { useState, useCallback } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import { LeafletTual, useLeafletTual, type CanvasItem } from 'leaflet-tual/react'

export function ControlledCanvas() {
  const [annotations, setAnnotations] = useState<CanvasItem[]>([])

  const handleItemsChange = useCallback((newItems: CanvasItem[]) => {
    setAnnotations(newItems)
    // Synchronize to backend or collaborative room
    fetch('/api/map/annotations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: newItems }),
    })
  }, [])

  const controller = useLeafletTual({
    items: annotations,
    onItemsChange: handleItemsChange,
  })

  return (
    <MapContainer center={[45.923, 6.869]} zoom={12} style={{ height: '100vh' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LeafletTual controller={controller} />
    </MapContainer>
  )
}`,
  },
  {
    id: 'readonly',
    title: 'Read-Only Display Mode',
    filename: 'DashboardMapView.tsx',
    description:
      'Display interactive annotations without editing handles or toolbars for viewer-only dashboards.',
    code: `import { MapContainer, TileLayer } from 'react-leaflet'
import { LeafletTual, useLeafletTual } from 'leaflet-tual/react'

export function DashboardMapView({ initialRoutes }) {
  const controller = useLeafletTual({
    readOnly: true,
    initialItems: initialRoutes,
  })

  return (
    <div className="dashboard-card rounded-xl overflow-hidden border border-slate-800">
      <MapContainer center={[41.018, 28.988]} zoom={13} style={{ height: '480px' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {/* Read-only mode hides edit handles and toolbar automatically */}
        <LeafletTual controller={controller} readOnly={true} />
      </MapContainer>
    </div>
  )
}`,
  },
]
