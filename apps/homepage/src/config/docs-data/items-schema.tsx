import {
  DocParagraph,
  DocCode,
  DocCodeBlock,
  DocHeading,
  DocCallout,
} from '../../components/docs-elements'
import { DocSection } from '../docs-data'

export const itemsSchemaSection: DocSection = {
  id: 'items-schema',
  title: 'Item Schemas & Data Model',
  category: 'core',
  content: (
    <div className="space-y-8">
      <div>
        <DocParagraph lead>
          Every annotation on the canvas conforms to the <DocCode highlight>CanvasItem</DocCode> discriminated
          union. All spatial coordinates are stored exclusively as <DocCode highlight>GeoPoint</DocCode> latitude
          and longitude objects, ensuring clean serialization, persistence, and zero map drift.
        </DocParagraph>
      </div>

      <DocHeading level={3} id="core-primitives">
        1. Core Coordinate &amp; Enum Primitives
      </DocHeading>

      <DocCodeBlock
        language="typescript"
        filename="types/items.ts"
        code={`export type GeoPoint = {
  lat: number
  lng: number
}

export type ScreenPoint = {
  x: number
  y: number
}

export type ArrowStyle = 'linear' | 'curved' | 'bi' | 'elbow' | 's-curve'

export type ShapeKind =
  | 'square'
  | 'circle'
  | 'star'
  | 'actor'
  | 'triangle'
  | 'diamond'
  | 'hexagon'
  | 'marker'

export type CanvasTool =
  | 'select'
  | 'freedraw'
  | 'arrow-linear'
  | 'arrow-curved'
  | 'arrow-bi'
  | 'arrow-elbow'
  | 'arrow-s-curve'
  | 'shape'
  | 'note'
  | 'text'

export type ToolbarToolGroupId = 'select' | 'freedraw' | 'arrow' | 'shape' | 'note' | 'text'

export type ArrowHeadStyle = 'triangle' | 'open' | 'both' | 'none'

export type NoteCollapseState = 'expanded' | 'collapsed' | 'compact'`}
      />

      <DocHeading level={3} id="arrow-item-schema">
        2. ArrowItem Schema
      </DocHeading>

      <DocParagraph>
        Represents vector arrows with start/end geographic coordinates, optional curvature control points,
        and directional arrowheads:
      </DocParagraph>

      <DocCodeBlock
        language="typescript"
        filename="ArrowItem.ts"
        code={`export interface ArrowItem {
  id: string
  type: 'arrow'
  arrowStyle: ArrowStyle
  start: GeoPoint
  end: GeoPoint
  controlPoint?: GeoPoint // Required for 'curved' style
  color: string
  strokeWidth: number
  dashed?: boolean
  headStyle?: ArrowHeadStyle // 'triangle' | 'open' | 'both' | 'none'
  label?: string
  createdAt: number
}`}
      />

      <DocHeading level={3} id="shape-item-schema">
        3. ShapeItem Schema
      </DocHeading>

      <DocParagraph>
        Represents geometric shapes, symbols, polygons, and markers:
      </DocParagraph>

      <DocCodeBlock
        language="typescript"
        filename="ShapeItem.ts"
        code={`export interface ShapeItem {
  id: string
  type: 'shape'
  shape: ShapeKind // 'square' | 'circle' | 'star' | 'actor' | 'triangle' | 'diamond' | 'hexagon' | 'marker'
  start: GeoPoint
  end: GeoPoint
  color: string
  fillColor?: string
  filled?: boolean
  strokeWidth: number
  dashed?: boolean
  label?: string
  createdAt: number
}`}
      />

      <DocHeading level={3} id="freedraw-item-schema">
        4. FreeDrawItem Schema
      </DocHeading>

      <DocParagraph>
        Represents freehand sketches containing a series of geographic stroke points:
      </DocParagraph>

      <DocCodeBlock
        language="typescript"
        filename="FreeDrawItem.ts"
        code={`export interface FreeDrawItem {
  id: string
  type: 'freedraw'
  points: GeoPoint[]
  color: string
  strokeWidth: number
  dashed?: boolean
  createdAt: number
}`}
      />

      <DocHeading level={3} id="note-item-schema">
        5. NoteItem Schema
      </DocHeading>

      <DocParagraph>
        Represents draggable HTML sticky notes with customizable themes and a 3-state collapse lifecycle:
      </DocParagraph>

      <DocCodeBlock
        language="typescript"
        filename="NoteItem.ts"
        code={`export interface NoteItem {
  id: string
  type: 'note'
  position: GeoPoint
  title?: string
  text: string
  backgroundColor: string
  textColor: string
  width?: number
  height?: number
  minimized?: boolean | 'compact'
  collapseState?: NoteCollapseState // 'expanded' | 'collapsed' | 'compact'
  createdAt: number
}`}
      />

      <DocHeading level={3} id="text-item-schema">
        6. TextItem Schema
      </DocHeading>

      <DocParagraph>
        Represents floating canvas text annotations with inline double-click editing, bold styling, and
        zoom-based font scaling:
      </DocParagraph>

      <DocCodeBlock
        language="typescript"
        filename="TextItem.ts"
        code={`export interface TextItem {
  id: string
  type: 'text'
  position: GeoPoint
  text: string
  color: string
  initialFontSize?: number
  baseZoom?: number
  fontWeight?: 'normal' | 'bold'
  backgroundColor?: string
  createdAt: number
}`}
      />

      <DocHeading level={3} id="canvas-item-union">
        7. Discriminated Union
      </DocHeading>

      <DocCodeBlock
        language="typescript"
        filename="CanvasItem.ts"
        code={`export type CanvasItem =
  | ArrowItem
  | FreeDrawItem
  | ShapeItem
  | NoteItem
  | TextItem`}
      />

      <DocCallout variant="tip" title="JSON Serialization Safety">
        Because every item schema uses pure JSON-compatible primitive types (strings, numbers, booleans,
        and plain GeoPoint objects), canvas item arrays can be directly serialized via <DocCode highlight>JSON.stringify(controller.items)</DocCode>{' '}
        or persisted into any PostgreSQL/PostGIS, MongoDB, or REST backend without transformation.
      </DocCallout>
    </div>
  ),
  subsections: [
    { id: 'core-primitives', title: '1. Core Coordinate & Enum Primitives', content: null },
    { id: 'arrow-item-schema', title: '2. ArrowItem Schema', content: null },
    { id: 'shape-item-schema', title: '3. ShapeItem Schema', content: null },
    { id: 'freedraw-item-schema', title: '4. FreeDrawItem Schema', content: null },
    { id: 'note-item-schema', title: '5. NoteItem Schema', content: null },
    { id: 'text-item-schema', title: '6. TextItem Schema', content: null },
    { id: 'canvas-item-union', title: '7. Discriminated Union', content: null },
  ],
}
