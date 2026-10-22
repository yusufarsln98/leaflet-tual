import {
  DocParagraph,
  DocCode,
  DocCodeBlock,
  DocHeading,
  DocCallout,
} from '../../components/docs-elements'
import { DocSection } from '../docs-data'

export const SKILL_MD_CONTENT = `---
name: leaflet-tual
description: Rules, data models, component composition, controller hooks, and coordinate synchronization guidelines for integrating and using the leaflet-tual toolkit.
---

# Skill: Using leaflet-tual

\`leaflet-tual\` is an interactive canvas and annotation toolkit for Leaflet maps in React. It renders vector arrows (linear, curved, bi-directional, elbow, s-curve), geometric shapes (square, circle, star, actor, triangle, diamond, hexagon, marker), freehand sketches, interactive draggable sticky notes, and text overlays that stay geographically synchronized with Leaflet maps across panning and zooming.

---

## 1. Core AI Rules & Constraints

- **GeoPoint Storage Rule**: All persistent item coordinates MUST be stored as geographic latitude/longitude pairs (\`GeoPoint\`: \`{ lat: number, lng: number }\`). NEVER store screen \`{ x, y }\` coordinates directly in item objects. Screen projections (\`geoToScreen\` / \`screenToGeo\`) occur dynamically during render passes and drag interactions.
- **Map Context Rule**: \`<LeafletCanvas>\` automatically accesses the Leaflet map instance via \`useMap()\` when placed as a child of \`<MapContainer>\`. If rendered outside \`<MapContainer>\`, you MUST provide the Leaflet map instance explicitly via the \`map\` prop (\`<LeafletCanvas map={mapInstance} />\`).
- **Controller Decoupling**: Always manage state through \`useLeafletCanvas\`. You can run it in **uncontrolled mode** (with built-in undo/redo history) or **controlled mode** by providing \`items\` and \`onItemsChange\` (or \`onChange\`).
- **Toolbar Placement & Decoupling**: By default, \`<LeafletCanvas>\` embeds a floating toolbar configured by \`toolbarPosition\` (\`'top-center'\`, \`'bottom-center'\`, \`'left-center'\`, \`'right-center'\`, \`'top'\`, \`'bottom'\`, \`'left'\`, \`'right'\`). To render a decoupled external toolbar outside the map, set \`showToolbar={false}\` on \`<LeafletCanvas>\` and render \`<CanvasToolbar controller={controller} />\` separately.
- **Proportion Locking & Angle Snapping**: Holding \`Shift\` during drawing automatically snaps arrow angles to 45° increments and shape bounding boxes to a 1:1 aspect ratio.

---

## 2. Layout Data Model (JSON Schemas)

All annotations on the canvas conform to the discriminated union \`CanvasItem\`:

\`\`\`ts
export type GeoPoint = {
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

export interface ArrowItem {
  id: string
  type: 'arrow'
  arrowStyle: ArrowStyle
  start: GeoPoint
  end: GeoPoint
  controlPoint?: GeoPoint
  color: string
  strokeWidth: number
  dashed?: boolean
  headStyle?: ArrowHeadStyle
  label?: string
  createdAt: number
}

export interface FreeDrawItem {
  id: string
  type: 'freedraw'
  points: GeoPoint[]
  color: string
  strokeWidth: number
  dashed?: boolean
  createdAt: number
}

export interface ShapeItem {
  id: string
  type: 'shape'
  shape: ShapeKind
  start: GeoPoint
  end: GeoPoint
  color: string
  fillColor?: string
  filled?: boolean
  strokeWidth: number
  dashed?: boolean
  label?: string
  createdAt: number
}

export type NoteCollapseState = 'expanded' | 'collapsed' | 'compact'

export interface NoteItem {
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
  collapseState?: NoteCollapseState
  createdAt: number
}

export interface TextItem {
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
}

export type CanvasItem = ArrowItem | FreeDrawItem | ShapeItem | NoteItem | TextItem
\`\`\`

---

## 3. Component Composition Rules

### Standard MapContainer Integration

\`\`\`tsx
import { MapContainer, TileLayer } from 'react-leaflet'
import { LeafletCanvas, useLeafletCanvas } from 'leaflet-tual/react'
import 'leaflet/dist/leaflet.css'

function MapView() {
  const controller = useLeafletCanvas({
    initialItems: [
      {
        id: 'arrow-1',
        type: 'arrow',
        arrowStyle: 'curved',
        start: { lat: 41.0082, lng: 28.9784 },
        end: { lat: 41.0256, lng: 28.9742 },
        color: '#2563eb',
        strokeWidth: 3,
        label: 'Navigation Route',
        createdAt: Date.now(),
      },
    ],
  })

  return (
    <MapContainer center={[41.01, 28.97]} zoom={13} style={{ height: '100vh', width: '100vw' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LeafletCanvas controller={controller} toolbarPosition="top-center" />
    </MapContainer>
  )
}
\`\`\`

### Decoupled External Toolbar

\`\`\`tsx
import { MapContainer, TileLayer } from 'react-leaflet'
import { CanvasToolbar, LeafletCanvas, useLeafletCanvas } from 'leaflet-tual/react'

function CustomApp() {
  const controller = useLeafletCanvas()

  return (
    <div className="app-container">
      <header className="custom-header">
        <CanvasToolbar controller={controller} orientation="horizontal" />
      </header>

      <MapContainer center={[41.01, 28.97]} zoom={13} style={{ height: '600px' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LeafletCanvas controller={controller} showToolbar={false} />
      </MapContainer>
    </div>
  )
}
\`\`\`

---

## 4. API Reference and Configurations

### \`<LeafletCanvas>\` Component Props

- \`controller?: LeafletCanvasController\`: The canvas state machine instance returned by \`useLeafletCanvas()\`. If omitted, an internal controller is created.
- \`map?: L.Map | null\`: Optional explicit Leaflet map instance (required only if rendered outside \`<MapContainer>\`).
- \`readOnly?: boolean\`: Enables read-only mode (disables drawing, editing, selection; hides toolbar by default).
- \`showToolbar?: boolean\`: Whether to show the floating toolbar (defaults to \`!readOnly\`).
- \`toolbarPosition?: ToolbarPosition\`: Floating position (\`'top'\`, \`'bottom'\`, \`'left'\`, \`'right'\`, \`'top-center'\`, \`'bottom-center'\`, \`'left-center'\`, \`'right-center'\`).
- \`toolbarOrientation?: ToolbarOrientation\`: Toolbar layout orientation (\`'horizontal' | 'vertical'\`).
- \`collapsible?: boolean\`: Whether the toolbar can be collapsed to a compact trigger button.
- \`defaultCollapsed?: boolean\`: Initial collapsed state of toolbar.
- \`collapsed?: boolean\`: Controlled collapsed state of toolbar.
- \`onCollapsedChange?: (collapsed: boolean) => void\`: Callback when toolbar collapsed state changes.
- \`showCollapseButton?: boolean\`: Whether to render the collapse button.
- \`enabledTools?: readonly ToolbarToolGroupId[]\`: Tool groups enabled in toolbar (\`'select'\`, \`'freedraw'\`, \`'arrow'\`, \`'shape'\`, \`'note'\`, \`'text'\`).
- \`customTools?: readonly CustomToolbarItem[]\`: Custom buttons or elements injected into the canvas toolbar.
- \`showHistoryControls?: boolean\`: Whether to show Undo/Redo buttons in the toolbar.
- \`showDeleteButton?: boolean\`: Whether to show the Delete button in the toolbar.
- \`showClearButton?: boolean\`: Whether to show the Clear All button in the toolbar.
- \`showToolLabels?: boolean\`: Whether to show text labels below/next to toolbar icons.
- \`labels?: CanvasLabels\`: Deeply customizable string labels, tooltips, and placeholders for all buttons and modals.
- \`icons?: CanvasIcons\`: Customizable React nodes/icons for toolbar tools and action buttons.
- \`unstyled?: boolean\`: Disables default styling for full custom CSS integration.
- \`classNames?: LeafletCanvasClassNames\`: Custom class names for root container, canvas element, toolbar, notes, and text overlays.
- \`styles?: LeafletCanvasStyles\`: Inline style overrides for canvas elements and overlays.
- \`annotationTheme?: CanvasAnnotationTheme\`: Custom rendering theme for 2D canvas handles, halos, and selection glows.
- \`arrowTheme?: ArrowRenderTheme\`: Alias for \`annotationTheme\`.
- \`strokeColors?: readonly string[]\`: Custom color swatches in the toolbar palette.
- \`strokeWidthOptions?: readonly number[]\`: Stroke width preset options.
- \`fontSizeOptions?: readonly number[]\`: Text overlay font size preset options.
- \`renderToolbar?: (controller: LeafletCanvasController) => React.ReactNode\`: Custom toolbar renderer.
- \`renderNote?: (props: RenderNoteProps) => React.ReactNode\`: Custom sticky note renderer.
- \`renderText?: (props: RenderTextProps) => React.ReactNode\`: Custom text overlay renderer.
- \`clampOverlaysToViewport?: boolean\`: Constrain note and text overlays inside map viewport (default: \`true\`).
- \`autoMinimizeNotesZoom?: number\`: Zoom threshold below which sticky notes auto-minimize.
- \`autoMinimizeTextZoom?: number\`: Zoom threshold below which text overlays auto-minimize.
- \`zIndex?: number\`: Z-index for overlay elements (default: \`650\`).
- \`className?: string\`: Class name for the container element.
- \`style?: React.CSSProperties\`: CSS styles for the container element.
- \`onChange?: (items: CanvasItem[]) => void\` / \`onItemsChange?: (items: CanvasItem[]) => void\`: Immediate change callback fired on every mutation.
- \`onChangeComplete?: (items: CanvasItem[], targetItem?: CanvasItem | null) => void\` / \`onItemsChangeComplete?: (items: CanvasItem[], targetItem?: CanvasItem | null) => void\`: Completion callback fired when editing finishes (click outside activating Select mode, deselect, blur, Escape). Aliased by \`onEditEnd\` and \`onEditComplete\`.
- \`onItemSelect?: (item: CanvasItem | null) => void\`: Callback when item is selected/deselected.
- \`onItemCreate?: (item: CanvasItem) => void\`: Callback when item is created.
- \`onItemChange?: (item: CanvasItem) => void\`: Callback when item is modified.
- \`onItemChangeComplete?: (item: CanvasItem) => void\`: Callback when item finishes editing.
- \`onItemDelete?: (id: string) => void\`: Callback when item is deleted.

### \`<CanvasToolbar>\` Component Props

- \`controller: LeafletCanvasController\`: Canvas controller instance.
- \`position?: ToolbarPosition\`: Position preset styling.
- \`orientation?: ToolbarOrientation\`: Toolbar orientation (\`'horizontal' | 'vertical'\`).
- \`collapsible?: boolean\`: Allow collapsing the toolbar.
- \`defaultCollapsed?: boolean\`: Initial collapsed state.
- \`collapsed?: boolean\`: Controlled collapsed state.
- \`onCollapsedChange?: (collapsed: boolean) => void\`: Collapsed state change handler.
- \`showCollapseButton?: boolean\`: Display the collapse toggle button.
- \`readOnly?: boolean\`: Render toolbar in read-only mode.
- \`enabledTools?: readonly ToolbarToolGroupId[]\`: Restrict available tool groups.
- \`customTools?: readonly CustomToolbarItem[]\`: Additional custom action items.
- \`showHistoryControls?: boolean\`: Show undo/redo buttons.
- \`showDeleteButton?: boolean\`: Show delete selected item button.
- \`showClearButton?: boolean\`: Show clear all annotations button.
- \`showToolLabels?: boolean\`: Display text labels for tools.
- \`labels?: CanvasLabels\`: Label localization overrides.
- \`icons?: CanvasIcons\`: Icon overrides.
- \`unstyled?: boolean\`: Strip default styles.
- \`classNames?: LeafletCanvasClassNames\`: CSS class name overrides.
- \`styles?: LeafletCanvasStyles\`: Inline style overrides.
- \`strokeColors?: readonly string[]\`: Color palette swatches.
- \`strokeWidthOptions?: readonly number[]\`: Stroke width options.
- \`fontSizeOptions?: readonly number[]\`: Font size preset options.
- \`className?: string\`: Container class name.
- \`style?: React.CSSProperties\`: Container style.

### \`useLeafletCanvas(options)\` Hook

Options (\`UseLeafletCanvasOptions\`):
- \`initialItems?: CanvasItem[]\`: Uncontrolled initial annotations.
- \`items?: CanvasItem[]\`: Controlled annotations array.
- \`maxHistory?: number\`: Undo/redo history capacity (default: 50).
- \`readOnly?: boolean\`: Initial read-only mode state.
- \`defaultColor?: string\`: Default stroke color (hex).
- \`defaultStrokeWidth?: number\`: Default stroke thickness.
- \`defaultNoteColor?: string\`: Default sticky note background color.
- \`defaultFontSize?: number\`: Default text overlay font size.
- \`defaultShape?: ShapeKind\`: Default shape type (default: \`'square'\`).
- \`initialTool?: CanvasTool\`: Initial active tool (default: \`'select'\`).
- \`onChange?: (items: CanvasItem[]) => void\` / \`onItemsChange?: (items: CanvasItem[]) => void\`: Immediate mutation callback.
- \`onChangeComplete?: (items: CanvasItem[], targetItem?: CanvasItem | null) => void\` / \`onItemsChangeComplete?: (items: CanvasItem[], targetItem?: CanvasItem | null) => void\`: Edit completion callback. Aliased by \`onEditEnd\` and \`onEditComplete\`.
- \`onItemSelect?: (item: CanvasItem | null) => void\`: Selection change callback.
- \`onItemCreate?: (item: CanvasItem) => void\`: Item creation callback.
- \`onItemChange?: (item: CanvasItem) => void\`: Item mutation callback.
- \`onItemChangeComplete?: (item: CanvasItem) => void\`: Item edit complete callback.
- \`onItemDelete?: (id: string) => void\`: Item removal callback.
- \`onToolChange?: (tool: CanvasTool) => void\`: Tool mode change callback.

Return Object (\`LeafletCanvasController\`):
- \`items\`: Active list of \`CanvasItem\` elements.
- \`activeTool\`: Current active canvas tool (\`'select'\`, \`'freedraw'\`, \`'arrow-linear'\`, \`'arrow-curved'\`, \`'arrow-bi'\`, \`'arrow-elbow'\`, \`'arrow-s-curve'\`, \`'shape'\`, \`'note'\`, \`'text'\`).
- \`setActiveTool(tool)\` / \`setTool(tool)\`: Switch active tool.
- \`readOnly\`: Boolean indicating whether read-only mode is active.
- \`setReadOnly(readOnly)\`: Toggles read-only mode dynamically.
- \`activeShape\`: Current shape kind (\`'square'\`, \`'circle'\`, \`'star'\`, \`'actor'\`, \`'triangle'\`, \`'diamond'\`, \`'hexagon'\`, \`'marker'\`).
- \`setActiveShape(shape)\`: Sets current shape kind.
- \`shapeFilled\`: Active shape fill toggle.
- \`setShapeFilled(filled)\`: Toggles shape fill.
- \`selectedId\`: Currently selected item ID (or \`null\`).
- \`setSelectedId(id)\` / \`selectItem(id)\`: Select an item or clear selection (\`null\`).
- \`selectedItem\`: Currently selected \`CanvasItem\` (or \`null\`).
- \`activeColor\`: Active stroke color.
- \`setActiveColor(color)\`: Sets active stroke color.
- \`strokeWidth\`: Active stroke thickness.
- \`setStrokeWidth(width)\`: Sets stroke thickness.
- \`dashed\`: Active dashed stroke toggle.
- \`setDashed(dashed)\`: Sets dashed stroke mode.
- \`noteColor\`: Active sticky note background color.
- \`setNoteColor(color)\`: Sets sticky note background color.
- \`fontSize\`: Active text font size.
- \`setFontSize(size)\`: Sets text font size.
- \`fontWeight\`: Active font weight (\`'normal' | 'bold'\`).
- \`setFontWeight(weight)\`: Sets text font weight.
- \`addItem(item)\`: Add an annotation to the canvas.
- \`updateItem(id, patch)\`: Update properties of an item.
- \`removeItem(id)\` / \`deleteItem(id)\`: Remove an item from the canvas.
- \`deleteSelected()\`: Deletes currently selected item.
- \`clearAll()\` / \`clear()\`: Remove all annotations.
- \`undo()\`: Undo last action (uncontrolled mode).
- \`redo()\`: Redo next action (uncontrolled mode).
- \`canUndo\`: Boolean indicating if undo is available.
- \`canRedo\`: Boolean indicating if redo is available.
- \`notifyChangeComplete(targetItem?)\`: Programmatically triggers \`onChangeComplete\` / \`onItemsChangeComplete\`.
- \`exportJSON()\`: Serializes all items to JSON string.
- \`importJSON(json)\`: Deserializes JSON string to canvas items.

---

## 5. Pure Geometry Utilities (\`leaflet-tual\`)

Exported pure functions for coordinate math, hit-testing, and constraints:

- \`geoToScreen(map, geo)\`: Converts \`{ lat, lng }\` to \`{ x, y }\` screen pixel coordinates.
- \`screenToGeo(map, point)\`: Converts \`{ x, y }\` screen coordinates to \`{ lat, lng }\`.
- \`constrainToAspectRatio(anchor, target, aspectRatio = 1)\`: Constrains drag bounding box to aspect ratio (e.g. 1:1 for square, circle, star when Shift is held).
- \`constrainAngleTo45Degrees(anchor, target)\`: Snaps vector angle to nearest 45-degree increment (0°, 45°, 90°, etc. when Shift is held).
- \`computeDefaultControlGeoPoint(start, end, curvature = 0.25)\`: Computes quadratic Bezier curve control point offset perpendicularly from midpoint.
- \`getQuadraticBezierPoint(p0, p1, p2, t)\`: Evaluates quadratic Bezier curve point at parameter \`t\` (0 to 1).
- \`getQuadraticEndAngle(p0, p1, p2)\`: Calculates tangent angle at arrow endpoint for arrowhead orientation.
- \`distanceToSegment(p, v, w)\`: Calculates shortest perpendicular distance from point \`p\` to line segment \`vw\`.
- \`distanceToQuadraticBezier(p, p0, p1, p2, steps = 24)\`: Calculates approximate distance from point \`p\` to quadratic Bezier curve.
- \`getMapDimensions(map)\`: Safely retrieves \`{ width, height }\` dimensions of Leaflet map container.
- \`truncateCanvasText(ctx, text, maxWidth)\`: Truncates canvas string with ellipsis (\`…\`) if it exceeds maximum pixel width.
- \`calculateZoomFontSize(initialFontSize, currentZoom, baseZoom = 14, options?)\`: Dynamically scales font size based on Leaflet map zoom level.
- \`createId(prefix = 'rlc')\`: Generates collision-free element IDs.
`

export const skillMdSection: DocSection = {
  id: 'skill-md',
  title: 'Agent Skill Specification',
  category: 'advanced',
  content: (
    <div className="space-y-8">
      <div>
        <DocParagraph lead>
          <strong className="text-text-primary font-semibold">leaflet-tual</strong> comes
          bundled with a specialized AI agent skill definition (<DocCode highlight>SKILL.md</DocCode>)
          optimized for autonomous coding assistants, Claude Code, Cursor, and DeepMind Antigravity.
        </DocParagraph>
      </div>

      <DocCallout variant="tip" title="Copyable Skill Document">
        Equip your local AI coding agent by copying the skill definition below into your repository’s{' '}
        <DocCode highlight>.agents/skills/leaflet-tual/SKILL.md</DocCode> file.
      </DocCallout>

      <DocHeading level={3} id="skill-manifest">
        SKILL.md Definition
      </DocHeading>

      <DocCodeBlock
        language="markdown"
        filename="SKILL.md"
        code={SKILL_MD_CONTENT}
      />
    </div>
  ),
}
