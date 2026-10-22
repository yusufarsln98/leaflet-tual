import {
  DocParagraph,
  DocCode,
  DocCodeBlock,
  DocHeading,
  DocCallout,
  DocTable,
  Checklist,
} from '../../components/docs-elements'
import { DocSection } from '../docs-data'

export const geoProjectionSection: DocSection = {
  id: 'geo-projection',
  title: 'Geographic Projection Math',
  category: 'core',
  content: (
    <div className="space-y-8">
      <div>
        <DocParagraph lead>
          The core innovation of <strong className="text-text-primary font-semibold">leaflet-tual</strong>{' '}
          is its continuous geographic projection synchronization engine, guaranteeing{' '}
          <strong className="text-accent font-semibold">zero pixel-drift</strong> across fractional
          zoom levels, rapid pointer dragging, and viewport resizing.
        </DocParagraph>
      </div>

      <DocHeading level={3} id="geopoint-vs-screenpoint">
        GeoPoint vs. ScreenPoint
      </DocHeading>

      <DocParagraph>
        All persistent items in leaflet-tual are stored strictly using geographic coordinates
        (<DocCode highlight>GeoPoint</DocCode>). Screen coordinates (<DocCode highlight>ScreenPoint</DocCode>)
        are transient, computed on-the-fly during rendering and pointer interaction cycles.
      </DocParagraph>

      <DocCodeBlock
        language="typescript"
        filename="types.ts"
        code={`// Persistent geographic coordinate stored in JSON schemas:
export type GeoPoint = {
  lat: number
  lng: number
}

// Transient viewport pixel coordinate used for canvas painting & hit-testing:
export type ScreenPoint = {
  x: number
  y: number
}`}
      />

      <DocCallout variant="tip" title="Why Screen Coordinates Are Never Persisted">
        If you store <DocCode highlight>{'{ x: 340, y: 180 }'}</DocCode>, the annotation immediately
        detaches from the earth when the user pans or zooms. leaflet-tual enforces that all item
        schemas exclusively persist <DocCode highlight>GeoPoint</DocCode> objects. During pointer interactions,
        transient screen positions are projected back into geographic coordinates in real time.
      </DocCallout>

      <DocHeading level={3} id="the-projection-cycle">
        Projection Conversion Pipeline
      </DocHeading>

      <DocParagraph>
        Coordinate conversions rely on Leaflet container pixel projection APIs:
      </DocParagraph>

      <DocCodeBlock
        language="typescript"
        filename="geo.ts"
        code={`// 1. Geographic to Screen Conversion:
export function geoToScreen(map: L.Map, point: GeoPoint): ScreenPoint {
  const containerPt = map.latLngToContainerPoint([point.lat, point.lng])
  return { x: containerPt.x, y: containerPt.y }
}

// 2. Screen to Geographic Conversion:
export function screenToGeo(map: L.Map, point: ScreenPoint): GeoPoint {
  const latLng = map.containerPointToLatLng([point.x, point.y])
  return { lat: latLng.lat, lng: latLng.lng }
}`}
      />

      <DocHeading level={3} id="geometric-constraints">
        Mathematical Geometric Constraints
      </DocHeading>

      <DocParagraph>
        The shared math module (<DocCode highlight>src/shared/geo.ts</DocCode>) provides pure
        mathematical functions for interactive drawing constraints:
      </DocParagraph>

      <DocTable
        headers={['Function', 'Parameters', 'Purpose']}
        rows={[
          [
            'constrainToAspectRatio(anchor, target, aspectRatio)',
            'anchor: ScreenPoint, target: ScreenPoint, aspectRatio = 1',
            'Locks bounding box to 1:1 square/circle proportions when holding the Shift key during shape creation/resizing.',
          ],
          [
            'constrainAngleTo45Degrees(anchor, target)',
            'anchor: ScreenPoint, target: ScreenPoint',
            'Snaps the arrow angle to exact π/4 (45-degree) increments when holding Shift while drawing arrows.',
          ],
          [
            'computeDefaultControlGeoPoint(start, end, curvature)',
            'start: GeoPoint, end: GeoPoint, curvature = 0.25',
            'Computes the initial perpendicular control point offset for curved quadratic Bézier arrows.',
          ],
          [
            'distanceToQuadraticBezier(p, p0, p1, p2, steps)',
            'p: ScreenPoint, p0, p1, p2: ScreenPoint, steps = 24',
            'Accurately calculates shortest screen distance from mouse click to curved Bézier path for precision hit-testing.',
          ],
          [
            'calculateZoomFontSize(initialSize, zoom, baseZoom, options)',
            'initialSize: number, zoom: number, baseZoom = 14',
            'Dynamically scales text overlay font sizes with map zoom levels so annotations stay readable.',
          ],
        ]}
      />

      <DocHeading level={3} id="listener-synchronization">
        Map Event Synchronization
      </DocHeading>

      <DocParagraph>
        The canvas layer subscribes to Leaflet viewport lifecycle events to synchronize both the HTML5 2D canvas
        and the HTML DOM overlays (sticky notes and text):
      </DocParagraph>

      <DocTable
        headers={['Leaflet Event', 'Canvas Reaction', 'DOM Overlay Reaction']}
        rows={[
          ['zoomstart', 'Suspends unnecessary intermediate calculations', 'Maintains current visual state'],
          ['zoom', 'Re-projects anchor points dynamically at 60 FPS', 'Updates CSS transforms on note and text elements'],
          ['zoomend', 'Recalculates control handles and redraws vectors crisply', 'Re-evaluates auto-minimize zoom thresholds'],
          ['move', 'Redraws canvas buffer matching new viewport offset', 'Updates container translate position'],
          ['moveend', 'Finalizes bounding boxes and hit-test caches', 'Ensures pixel-perfect alignment to final lat/lng'],
          ['resize', 'Resizes canvas backing store to devicePixelRatio', 'Adjusts viewport bounding box clamps'],
        ]}
      />

      <Checklist
        items={[
          {
            title: 'Sub-Pixel Rendering Precision',
            desc: 'Canvas context transforms use sub-pixel anti-aliasing for smooth lines and arrowheads.',
          },
          {
            title: 'Retina / High-DPI Support',
            desc: 'Automatically scales canvas resolution by window.devicePixelRatio for crisp visuals on 4K/Retina displays.',
          },
          {
            title: 'Viewport Boundary Clamping',
            desc: 'Optional clampOverlaysToViewport prevents sticky notes and text from drifting outside the map element.',
          },
        ]}
      />
    </div>
  ),
  subsections: [
    { id: 'geopoint-vs-screenpoint', title: 'GeoPoint vs. ScreenPoint', content: null },
    { id: 'the-projection-cycle', title: 'Projection Conversion Pipeline', content: null },
    { id: 'geometric-constraints', title: 'Mathematical Geometric Constraints', content: null },
    { id: 'listener-synchronization', title: 'Map Event Synchronization', content: null },
  ],
}
