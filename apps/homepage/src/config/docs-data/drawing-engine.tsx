import {
  DocParagraph,
  DocCode,
  DocHeading,
  DocTable,
  Checklist,
  DocCallout,
} from '../../components/docs-elements'
import { DocSection } from '../docs-data'

export const drawingEngineSection: DocSection = {
  id: 'drawing-engine',
  title: 'Drawing Engine: Vector Arrows & Shapes',
  category: 'core',
  content: (
    <div className="space-y-8">
      <div>
        <DocParagraph lead>
          <strong className="text-text-primary font-semibold">leaflet-canvas</strong> features
          a dedicated hardware-accelerated 2D canvas drawing engine with{' '}
          <strong className="text-accent font-semibold">5 specialized vector arrow styles</strong>,{' '}
          <strong className="text-accent font-semibold">8 geometric shape primitives</strong>, and{' '}
          <strong className="text-accent font-semibold">freehand path sketching</strong>, complete
          with interactive control handles, proportional locking, and angle snapping.
        </DocParagraph>
      </div>

      <DocHeading level={3} id="arrow-models">
        1. The 5 Vector Arrow Styles
      </DocHeading>

      <DocParagraph>
        All vector arrows are anchored by <DocCode highlight>start</DocCode> and <DocCode highlight>end</DocCode>{' '}
        geographic coordinates. They support configurable stroke widths, colors, dashed strokes,
        arrowhead styles (<DocCode highlight>'triangle' | 'open' | 'both' | 'none'</DocCode>), and inline aligned text labels:
      </DocParagraph>

      <DocTable
        headers={['Arrow Style ID', 'Mathematical Model', 'Interactive Control Handles', 'Typical Use Case']}
        rows={[
          [
            'linear',
            'Direct straight-line Euclidean segment',
            'Start & End point handles',
            'Direct line of sight, bearings, vector headings, point-to-point links',
          ],
          [
            'curved',
            'Quadratic Bézier curve with perpendicular control offset',
            'Start, Midpoint Control Handle, End',
            'Air traffic detour routes, maritime shipping bypass arcs, perimeter detours',
          ],
          [
            'bi',
            'Bi-directional vector segment with dual arrowheads',
            'Start & End point handles',
            'Two-way communication channels, bidirectional patrol zones, transit corridors',
          ],
          [
            'elbow',
            'Orthogonal 90-degree Manhattan route step',
            'Start, Corner Knee Handle, End',
            'Urban street grid navigation, pipeline routes, orthogonal connections',
          ],
          [
            's-curve',
            'Smooth cubic sigmoid S-curve inflection',
            'Start, Inflection Control Handle, End',
            'Smooth detour corridors, serpentine river paths, obstacle circumnavigation',
          ],
        ]}
      />

      <DocHeading level={3} id="shape-primitives">
        2. The 8 Geometric Shape Primitives
      </DocHeading>

      <DocParagraph>
        Geometric primitives are anchored by bounding geographic corners (<DocCode highlight>start</DocCode> and{' '}
        <DocCode highlight>end</DocCode> GeoPoints) and support customizable stroke colors, stroke widths,
        dashed outlines, optional fill colors, and center label text:
      </DocParagraph>

      <DocTable
        headers={['Shape Kind ID', 'Geometry & Render Characteristics', 'Primary Use Case']}
        rows={[
          [
            'square',
            'Axis-aligned rectangular or square zone with 8 perimeter resize handles',
            'Operational sectors, building footprints, search grids',
          ],
          [
            'circle',
            'Radial elliptical or circular boundary centered on start/end bounds',
            'Radius zones, sensor detection ranges, perimeter perimeters',
          ],
          [
            'star',
            '5-pointed star polygon with golden-ratio vertices',
            'Key landmarks, featured locations, and points of interest',
          ],
          [
            'actor',
            'Personnel / vessel silhouette figure',
            'Staff positioning, maritime vessels, field agents, or dispatch teams',
          ],
          [
            'triangle',
            'Equilateral directional polygon pointing toward target direction',
            'Directional indicators, hazard warnings, and alerts',
          ],
          [
            'diamond',
            'Rotated 45-degree diamond symbol',
            'Checkpoints, stops, and rendezvous waypoints',
          ],
          [
            'hexagon',
            '6-sided regular honeycomb polygon',
            'Coverage sectors, spatial tessellation zones, search grids',
          ],
          [
            'marker',
            'Standard map pin marker with bottom anchor point',
            'Locations of interest, incident coordinates, and drop-off points',
          ],
        ]}
      />

      <DocHeading level={3} id="freedraw-sketching">
        3. Freehand Sketching (freedraw)
      </DocHeading>

      <DocParagraph>
        Freehand drawing (<DocCode highlight>type: 'freedraw'</DocCode>) allows users to circle
        areas of interest, sketch terrain boundaries, or annotate maps directly. During the drawing
        gesture, pointer samples are converted to an array of <DocCode highlight>GeoPoint[]</DocCode>{' '}
        coordinates, smoothed with quadratic spline interpolation, and rendered with custom stroke widths
        and dashed options.
      </DocParagraph>

      <DocCallout variant="tip" title="Shift-Key Proportion Locking & Angle Snapping">
        While drawing or resizing any shape, holding the <DocCode highlight>Shift</DocCode> key
        instantly constrains the bounding box to a strict 1:1 aspect ratio (producing perfect squares
        and circles). When drawing arrows, holding Shift snaps the arrow heading to precise 45-degree
        angle increments.
      </DocCallout>

      <DocHeading level={3} id="selection-editing">
        4. Interactive Selection &amp; Handles
      </DocHeading>

      <DocParagraph>
        Selecting an item with the <DocCode highlight>select</DocCode> tool activates visual bounding
        handles:
      </DocParagraph>

      <Checklist
        items={[
          {
            title: 'Arrow Endpoint Handles',
            desc: 'Drag start or end circular handles to reposition vector terminals with real-time geographic updates.',
          },
          {
            title: 'Curved Control Handle',
            desc: 'Curved arrows expose a distinct control point handle to adjust quadratic Bézier curvature interactively.',
          },
          {
            title: '8-Point Bounding Box',
            desc: 'Shapes display 8 perimeter handles for resizing along cardinal and ordinal directions.',
          },
          {
            title: 'Hit-Testing Precision',
            desc: 'Segment and Bézier distance calculations provide pixel-perfect click detection even on thin 1px lines.',
          },
        ]}
      />
    </div>
  ),
  subsections: [
    { id: 'arrow-models', title: '1. The 5 Vector Arrow Styles', content: null },
    { id: 'shape-primitives', title: '2. The 8 Geometric Shape Primitives', content: null },
    { id: 'freedraw-sketching', title: '3. Freehand Sketching (freedraw)', content: null },
    { id: 'selection-editing', title: '4. Interactive Selection & Handles', content: null },
  ],
}

export const arrowsShapesSection = drawingEngineSection
