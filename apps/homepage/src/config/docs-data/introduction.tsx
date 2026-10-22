import {
  DocParagraph,
  DocCode,
  Checklist,
  InfoCard,
  DocHeading,
  DocCallout,
  DocTable,
} from '../../components/docs-elements'
import { DocSection } from '../docs-data'

const KEY_LEAFLET_CANVAS_FEATURES = [
  {
    title: 'Zero-Drift Geographic Projection',
    desc: 'Coordinates are stored exclusively as latitude/longitude pairs (GeoPoint). Real-time screen conversions dynamically recalculate on every Leaflet zoom, pan, and CRS transformation with zero pixel drift.',
  },
  {
    title: '5 Vector Arrow Styles',
    desc: 'Render linear arrows, curved quadratic Bézier curves with interactive control points, bi-directional vectors, orthogonal elbow routes, and s-curves with optional dashed strokes and aligned labels.',
  },
  {
    title: '8 Geometric Primitives',
    desc: 'Place stars, squares, circles, actor silhouettes, triangles, diamonds, hexagons, and map markers with customizable stroke widths, fills, and labels.',
  },
  {
    title: 'Proportion & Angle Constraints',
    desc: 'Hold the Shift key during drawing to lock 1:1 aspect ratios on shapes and snap vector arrows to precise 45-degree angle increments.',
  },
  {
    title: 'Geographically Pinned Sticky Notes',
    desc: 'Drop draggable HTML sticky notes that stay permanently locked to geographic coordinates, featuring 3-state collapse (expanded, collapsed, compact) and color palettes.',
  },
  {
    title: 'Floating Text Annotations',
    desc: 'Render customizable text overlays with inline editing, bold styling, custom colors, and zoom-aware font size scaling.',
  },
  {
    title: 'Decoupled State Controller & History',
    desc: 'Manage canvas state with useLeafletTual featuring an undo/redo stack, presentation read-only mode, and flexible toolbar placement inside or outside the map container.',
  },
  {
    title: 'Presentation Read-Only Mode',
    desc: 'Switch to read-only mode to showcase annotations cleanly without selection handles or mutation triggers, while leaving map panning and zooming fully unobstructed.',
  },
]

export const introductionSection: DocSection = {
  id: 'introduction',
  title: 'Introduction & Architecture',
  category: 'overview',
  content: (
    <div className="space-y-8">
      <div>
        <DocParagraph lead>
          <strong className="text-text-primary font-semibold">leaflet-tual</strong> is a
          framework-agnostic interactive vector canvas toolkit designed for Leaflet with optional
          React bindings. It solves the classic challenge in web mapping: drawing interactive
          arrows, shapes, freehand sketches, and notes directly on top of maps without annotations
          drifting off-target when users pan, pinch, or zoom.
        </DocParagraph>
      </div>

      <DocCallout variant="tip" title="Built for Modern Geospatial Applications">
        Whether you are building maritime navigation displays, fleet logistics dashboards, field
        operations maps, or environmental monitoring consoles, leaflet-tual provides the
        coordinate synchronization and vector rendering engine out of the box.
      </DocCallout>

      <DocHeading level={3} id="core-architectural-pillars">
        Core Architectural Pillars
      </DocHeading>

      <DocParagraph>
        Traditional canvas overlay implementations often paint directly to pixel coordinates and
        fail during continuous map panning, causing annotations to visually lag behind tile layers.
        leaflet-tual solves this by hooking into Leaflet’s internal Coordinate Reference
        System (CRS) projection cycle:
      </DocParagraph>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {KEY_LEAFLET_CANVAS_FEATURES.map((feat) => (
          <InfoCard key={feat.title} title={feat.title}>
            {feat.desc}
          </InfoCard>
        ))}
      </div>

      <DocHeading level={3} id="annotation-primitives">
        Supported Annotation Primitives
      </DocHeading>

      <DocTable
        headers={['Item Type', 'Count / Variants', 'Coordinate Anchor', 'Rendering Layer']}
        rows={[
          [
            'Vector Arrows',
            '5 styles: linear, curved, bi, elbow, s-curve',
            'start & end GeoPoints (optional controlPoint)',
            'Hardware-accelerated HTML5 2D Canvas',
          ],
          [
            'Geometric Shapes',
            '8 kinds: square, circle, star, actor, triangle, diamond, hexagon, marker',
            'start & end bounding GeoPoints',
            'Hardware-accelerated HTML5 2D Canvas',
          ],
          [
            'Freehand Drawing',
            'Continuous freedraw path with smoothed Bézier splines',
            'Array of GeoPoint[] coordinates',
            'Hardware-accelerated HTML5 2D Canvas',
          ],
          [
            'Sticky Notes',
            'Draggable cards with 3-state collapse (expanded, collapsed, compact)',
            'position GeoPoint',
            'Interactive HTML DOM overlay with CSS transform',
          ],
          [
            'Text Annotations',
            'Inline editable text with zoom font scaling',
            'position GeoPoint',
            'Interactive HTML DOM overlay with CSS transform',
          ],
        ]}
      />

      <DocHeading level={3} id="ai-first-ready">
        AI-First Architecture &amp; Agent Skills
      </DocHeading>

      <DocParagraph>
        leaflet-tual is built with clean declarative JSON schemas. Automated coding agents,
        LLM workflows, and developer tools can programmatically inspect, modify, and generate map
        annotation layers using the built-in <DocCode highlight>SKILL.md</DocCode> contract specification.
      </DocParagraph>

      <Checklist
        items={[
          {
            title: 'GeoPoint Data Model',
            desc: 'Stores pure latitude/longitude coordinates — never brittle screen coordinates.',
          },
          {
            title: 'Zero External Bloat',
            desc: 'Framework-agnostic core with zero React dependencies; optional React bindings via leaflet-tual/react.',
          },
          {
            title: 'Universal Compatibility',
            desc: 'Works in Vanilla JS, TypeScript, Vue, Svelte, and React Concurrent Mode.',
          },
          {
            title: 'Presentation ReadOnly Mode',
            desc: 'Built-in readOnly mode for dashboards, reports, and viewer screens.',
          },
        ]}
      />
    </div>
  ),
  subsections: [
    { id: 'core-architectural-pillars', title: 'Core Architectural Pillars', content: null },
    { id: 'annotation-primitives', title: 'Supported Annotation Primitives', content: null },
    { id: 'ai-first-ready', title: 'AI-First Architecture & Agent Skills', content: null },
  ],
}
