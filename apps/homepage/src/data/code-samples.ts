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
    title: 'React Quick Start',
    filename: 'MapCanvasView.tsx',
    description:
      'Embed LeafletTual directly inside MapContainer with the v2 whiteboard toolkit and automatic dark/light theme.',
    code: `import { MapContainer, TileLayer } from 'react-leaflet'
import { LeafletTual } from 'leaflet-tual/react'
import 'leaflet/dist/leaflet.css'
import 'leaflet-tual/styles.css'

export function MapCanvasView() {
  return (
    <MapContainer center={[41.01, 28.97]} zoom={13} style={{ height: '100vh' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LeafletTual
        onChange={(doc, { committed }) => {
          if (committed) saveToServer(doc)
        }}
      />
    </MapContainer>
  )
}`,
  },
  {
    id: 'vanilla-core',
    title: 'Vanilla JS Core Engine',
    filename: 'map-canvas.ts',
    description:
      'Mount the framework-agnostic v2 core directly onto a standard Leaflet L.Map instance with zero React peer dependencies.',
    code: `import L from 'leaflet'
import { createLeafletTual, emptyDoc } from 'leaflet-tual'
import 'leaflet/dist/leaflet.css'
import 'leaflet-tual/styles.css'

const map = L.map('map-viewport').setView([41.018, 28.988], 13)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

// Mount framework-agnostic whiteboard
const tual = createLeafletTual(map, {
  defaultValue: emptyDoc(),
  toolbar: { position: 'top-left' },
  onChange: (doc, info) => {
    if (info.committed) console.log('Saved doc:', doc)
  },
})

// Programmatic tool & style control
tual.setTool('arrow', 'curved')
tual.setStyle({ color: 'blue', width: 'm' })`,
  },
  {
    id: 'decoupled-toolbar',
    title: 'Decoupled External Toolbar',
    filename: 'CustomAppHeader.tsx',
    description:
      'Place the Toolbar outside the map in your application header while the canvas renders inside the map.',
    code: `import { MapContainer, TileLayer } from 'react-leaflet'
import { Toolbar, LeafletTual, useLeafletTual } from 'leaflet-tual/react'
import 'leaflet/dist/leaflet.css'
import 'leaflet-tual/styles.css'

export function DecoupledApp() {
  const tual = useLeafletTual()

  return (
    <div className="flex flex-col h-screen">
      {/* External Toolbar rendered outside the Map */}
      <header className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex justify-between">
        <h1 className="text-white font-bold">Whiteboard Annotations</h1>
        <Toolbar controller={tual} tools={['select', 'freedraw', 'pen', 'arrow', 'shape', 'note']} />
      </header>

      {/* Map with embedded toolbar disabled */}
      <div className="flex-1">
        <MapContainer center={[37.795, -122.395]} zoom={13} style={{ height: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LeafletTual controller={tual} toolbar={false} />
        </MapContainer>
      </div>
    </div>
  )
}`,
  },
  {
    id: 'controlled',
    title: 'Controlled State & Backend Persistence',
    filename: 'SyncProvider.tsx',
    description:
      'Synchronize whiteboard document with a remote database or REST API via single onChange callback and committed info.',
    code: `import { useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import { LeafletTual, type Doc, emptyDoc } from 'leaflet-tual/react'

export function ControlledCanvas() {
  const [doc, setDoc] = useState<Doc>(() => emptyDoc())

  return (
    <MapContainer center={[45.923, 6.869]} zoom={12} style={{ height: '100vh' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LeafletTual
        value={doc}
        onChange={(nextDoc, { committed }) => {
          setDoc(nextDoc)
          if (committed) {
            fetch('/api/map/doc', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(nextDoc),
            })
          }
        }}
      />
    </MapContainer>
  )
}`,
  },
  {
    id: 'readonly',
    title: 'Read-Only Viewer Mode',
    filename: 'DashboardMapView.tsx',
    description:
      'Display annotations without editing handles or drawing tools for viewer-only dashboards.',
    code: `import { MapContainer, TileLayer } from 'react-leaflet'
import { LeafletTual, type Doc } from 'leaflet-tual/react'

export function DashboardMapView({ initialDoc }: { initialDoc: Doc }) {
  return (
    <div className="dashboard-card rounded-xl overflow-hidden border border-slate-800">
      <MapContainer center={[41.018, 28.988]} zoom={13} style={{ height: '480px' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LeafletTual readOnly defaultValue={initialDoc} />
      </MapContainer>
    </div>
  )
}`,
  },
]
