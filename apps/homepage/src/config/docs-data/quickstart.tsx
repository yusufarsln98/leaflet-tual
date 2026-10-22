import {
  DocParagraph,
  DocCode,
  DocCodeBlock,
  DocHeading,
  DocCallout,
  DocStepper,
  PackageManagerTabs,
} from '../../components/docs-elements'
import { DocSection } from '../docs-data'

export const quickstartSection: DocSection = {
  id: 'quickstart',
  title: 'Installation & Quickstart',
  category: 'overview',
  content: (
    <div className="space-y-8">
      <div>
        <DocParagraph lead>
          Getting started with <strong className="text-text-primary font-semibold">leaflet-tual</strong>{' '}
          takes less than two minutes. The library integrates directly into standard{' '}
          <DocCode highlight>react-leaflet</DocCode> applications.
        </DocParagraph>
      </div>

      <DocHeading level={3} id="install-package">
        1. Package Installation
      </DocHeading>

      <DocParagraph>
        Install the core package along with its peer dependencies (React, Leaflet, and React-Leaflet):
      </DocParagraph>

      <PackageManagerTabs packageNames="leaflet-tual leaflet react-leaflet" />

      <DocCallout variant="warning" title="Import Leaflet CSS">
        Make sure to import Leaflet’s stylesheet (<DocCode highlight>import 'leaflet/dist/leaflet.css'</DocCode>)
        at the root of your application or map component.
      </DocCallout>

      <DocHeading level={3} id="basic-usage">
        2. Quick Start Example
      </DocHeading>

      <DocParagraph>
        Place <DocCode highlight>&lt;LeafletCanvas /&gt;</DocCode> inside any standard{' '}
        <DocCode highlight>&lt;MapContainer&gt;</DocCode>. The floating canvas toolbar renders automatically:
      </DocParagraph>

      <DocCodeBlock
        language="tsx"
        filename="MapWithCanvas.tsx"
        code={`import { MapContainer, TileLayer } from 'react-leaflet'
import { LeafletCanvas } from 'leaflet-tual/react'
import 'leaflet/dist/leaflet.css'

export function MapWithCanvas() {
  return (
    <MapContainer
      center={[41.0082, 28.9784]}
      zoom={13}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LeafletCanvas toolbarPosition="top-center" />
    </MapContainer>
  )
}`}
      />

      <DocHeading level={3} id="controlled-setup">
        3. Adding Initial Annotations &amp; Controller
      </DocHeading>

      <DocParagraph>
        Use the <DocCode highlight>useLeafletCanvas</DocCode> hook to programmatically seed initial
        items, inspect user modifications, and trigger undo/redo actions:
      </DocParagraph>

      <DocCodeBlock
        language="tsx"
        filename="FleetCommandMap.tsx"
        code={`import { MapContainer, TileLayer } from 'react-leaflet'
import { LeafletCanvas, useLeafletCanvas } from 'leaflet-tual/react'
import 'leaflet/dist/leaflet.css'

export function FleetCommandMap() {
  const controller = useLeafletCanvas({
    initialItems: [
      {
        id: 'dispatch-arrow-1',
        type: 'arrow',
        arrowStyle: 'curved',
        start: { lat: 41.0082, lng: 28.9784 },
        end: { lat: 41.0256, lng: 28.9742 },
        color: '#2563eb',
        strokeWidth: 3,
        label: 'Patrol Corridor Alpha',
        createdAt: Date.now(),
      },
    ],
    onChangeComplete: (items) => {
      console.log('Finished updating items:', items)
    },
  })

  return (
    <div className="relative h-screen w-full">
      <MapContainer
        center={[41.015, 28.975]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LeafletCanvas controller={controller} toolbarPosition="top-center" />
      </MapContainer>
    </div>
  )
}`}
      />

      <DocHeading level={3} id="presentation-mode">
        4. Read-Only Presentation Mode
      </DocHeading>

      <DocParagraph>
        To present annotations in dashboards or reports where viewers should not edit drawings, pass
        the <DocCode highlight>readOnly</DocCode> prop. The drawing surface is removed, selection
        handles are hidden, and map panning/zooming remains 100% unobstructed:
      </DocParagraph>

      <DocCodeBlock
        language="tsx"
        filename="ReadOnlyExample.tsx"
        code={`// Read-only canvas overlay inside MapContainer:
<LeafletCanvas readOnly />

// Or toggle dynamically via controller:
const controller = useLeafletCanvas({ readOnly: true })
controller.setReadOnly(false)`}
      />

      <DocStepper
        steps={[
          {
            title: 'Store Latitude and Longitude',
            children: 'Every item points to geographic coordinates (GeoPoint: { lat, lng }). Screen translation is handled dynamically.',
          },
          {
            title: 'Hardware-Accelerated Render Layer',
            children: 'Vector shapes, arrows, and freehand sketches render on an HTML5 2D canvas synced to requestAnimationFrame.',
          },
          {
            title: 'Draggable Sticky Notes & Text in HTML DOM',
            children: 'Sticky notes and text overlays render as real HTML DOM elements positioned via CSS transforms for crisp typography and accessibility.',
          },
        ]}
      />
    </div>
  ),
  subsections: [
    { id: 'install-package', title: '1. Package Installation', content: null },
    { id: 'basic-usage', title: '2. Quick Start Example', content: null },
    { id: 'controlled-setup', title: '3. Adding Initial Annotations & Controller', content: null },
    { id: 'presentation-mode', title: '4. Read-Only Presentation Mode', content: null },
  ],
}
