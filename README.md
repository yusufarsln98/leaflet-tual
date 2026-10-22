# leaflet-tual

> Framework-agnostic interactive canvas and annotation toolkit for Leaflet maps, with optional React bindings.

Draw arrows, place geometric shapes, sketch freehand paths, measure geodesic distances, drop interactive sticky notes, and render text annotations that stay geographically locked to Leaflet map coordinates across zoom levels and pan movements.

---

## Package Layout & Subpath Exports

| Import                                   | Surface                                                                                                                         | React required?     |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `leaflet-tual` / `leaflet-tual/core` | Framework-agnostic core (`createLeafletTual`, `createLeafletTualController`, `paintLeafletTual`, geo math, 2D renderers) | No                  |
| `leaflet-tual/react`                   | React bindings (`<LeafletTual>`, `<CanvasToolbar>`, `useLeafletTual`, `useLeafletSync`)                                     | Yes (optional peer) |

---

## Features

- **Geographically Synchronized**: All items store latitude/longitude coordinates (`GeoPoint`). Projections adapt automatically during zoom, pan, and window resize.
- **Rich Vector Arrows**: Linear, curved (quadratic Bezier), bi-directional, elbow, and s-curve arrow styles with customizable arrowheads, dashed patterns, and text labels.
- **Real-World Distance Ruler**: Dedicated measurement line tool that calculates and displays real-world geodesic distances (`m`, `km`, `ft`, `mi`) live with perpendicular end-caps and draggable endpoints.
- **Geometric Shapes**: Star, square, circle, actor/person, triangle, diamond, hexagon, and map marker with stroke, fill, and aspect ratio locking.
- **Freehand Sketching**: Smooth free-drawing with customizable stroke widths and dashed lines.
- **Sticky Notes & Text Overlays**: Draggable HTML sticky notes with color palettes and minimizable views, plus floating text annotations.
- **Read-Only Mode**: Display annotations for review or inspection while keeping Leaflet map pan, zoom, and click interactions completely unobstructed.
- **Undo / Redo History**: Built-in undo/redo stack in uncontrolled mode, or fully controlled via `items` and `onItemsChange`.
- **Customizable Toolbar**: Floating on-map toolbar with multiple positions or completely decoupled external toolbar.

---

## Installation

```bash
npm install leaflet-tual leaflet react-leaflet
```

Ensure Leaflet CSS is imported in your application:

```ts
import 'leaflet/dist/leaflet.css'
```

---

## Quick Start

### Vanilla JS / Framework-Agnostic (`leaflet-tual`)

```ts
import L from 'leaflet'
import { createLeafletTual } from 'leaflet-tual'
import 'leaflet/dist/leaflet.css'

const map = L.map('map').setView([41.0082, 28.9784], 13)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

const canvas = createLeafletTual(map, {
  initialItems: [],
  onChange: (items) => console.log('Items updated:', items),
})

// Programmatic control
canvas.controller.setTool('arrow-curved')
canvas.controller.setActiveColor('#2563eb')
```

### React Basic Usage (`leaflet-tual/react`)

```tsx
import { MapContainer, TileLayer } from 'react-leaflet'
import { LeafletTual } from 'leaflet-tual/react'
import 'leaflet/dist/leaflet.css'

export function Map() {
  return (
    <MapContainer center={[41.0082, 28.9784]} zoom={13} style={{ height: '100vh', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LeafletTual toolbarPosition="top-center" />
    </MapContainer>
  )
}
```

### Controlled Controller

```tsx
import { MapContainer, TileLayer } from 'react-leaflet'
import { LeafletTual, useLeafletTual } from 'leaflet-tual/react'
import 'leaflet/dist/leaflet.css'

export function MapWithController() {
  const controller = useLeafletTual({
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
    <MapContainer center={[41.01, 28.97]} zoom={13} style={{ height: '100vh', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LeafletTual controller={controller} toolbarPosition="top-center" />
    </MapContainer>
  )
}
```

---

## Read-Only Mode

To present annotations in a view-only state without editing capabilities:

```tsx
<LeafletTual readOnly />
```

Or toggle it dynamically via the controller:

```tsx
const controller = useLeafletTual({ readOnly: true })

// Later toggle programmatically:
controller.setReadOnly(false)
```

### Read-Only Behavior

When `readOnly` is enabled:
- **Map Interaction**: The drawing surface layer is removed from the DOM and drawing pointer listeners are disabled, ensuring Leaflet map panning, zooming, and clicking are 100% unobstructed.
- **Toolbar**: Hidden by default (`showToolbar` defaults to `false` when `readOnly` is active, unless explicitly overridden with `showToolbar={true}`). If forced visible, creation tools and mutation actions are disabled.
- **Selection & Handles**: Bounding box selection handles, control points, and rotation/resize grips are hidden.
- **Sticky Notes**: Title and body text inputs are set to `readOnly`, dragging is disabled, and delete buttons are removed. Note minimize/expand toggles remain usable for viewing convenience.
- **Text Overlays**: Double-click editing is disabled, dragging is disabled, and text formatting controls are hidden.
- **Mutations Guarded**: Controller mutation methods (`addItem`, `updateItem`, `removeItem`, `deleteSelected`, `clearAll`, `undo`, `redo`, `importJSON`, `setActiveTool`) are safeguarded against state changes.
- **CSS Styling**: The root overlay container receives the `rlc-readonly` class and `data-readonly="true"` attribute for custom styling.

---

## Sticky Note 3-State Lifecycle

Sticky notes support three presentation states across panning and zooming:
1. **Expanded (`'expanded'` / `minimized: false`)**: Full card showing header, title input, and editable textarea body.
2. **Collapsed (`'collapsed'` / `minimized: true`)**: Header pill bar (110px–220px) showing title input and action buttons without the body.
3. **Compact (`'compact'` / `minimized: 'compact'`)**: Ultra-compact pill shape (34px–140px, `borderRadius: 9999px`) featuring a note icon, truncated title, and expand trigger. Ideal for high-density maps and low-zoom overviews.

Use the header's **Compact** and **Expand/Collapse** buttons to cycle states, or set `collapseState: 'compact'` on any `NoteItem`. When `autoMinimizeNotesZoom` is enabled, notes automatically adapt between all three states based on map zoom levels.

---

## API Reference

### `<LeafletTual>` Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `readOnly` | `boolean` | `false` | Enables read-only mode (disables drawing, editing, and selection). |
| `controller` | `LeafletTualController` | `undefined` | Optional external controller from `useLeafletTual()`. |
| `map` | `L.Map` | `undefined` | Leaflet map instance (auto-inferred via `useMap()` when inside `<MapContainer>`). |
| `initialItems` | `CanvasItem[]` | `[]` | Initial annotations (when not providing an external controller). |
| `showToolbar` | `boolean` | `!readOnly` | Whether to display the toolbar. Defaults to `false` when `readOnly` is true. |
| `toolbarPosition` | `ToolbarPosition \| 'none'` | `'top-center'` | Toolbar position (`'top'`, `'bottom'`, `'left'`, `'right'`, `'top-center'`, `'bottom-center'`, `'left-center'`, `'right-center'`, `'none'`). |
| `toolbarOrientation` | `'horizontal' \| 'vertical'` | Inferred from position | Toolbar orientation. Inferred as `'vertical'` for left/right positions and `'horizontal'` for top/bottom positions. |
| `collapsible` | `boolean` | `true` | Whether the toolbar can be collapsed to a compact trigger button. |
| `defaultCollapsed` | `boolean` | `false` | Initial collapsed state when uncontrolled. |
| `collapsed` | `boolean` | `undefined` | Controlled collapsed state. |
| `onCollapsedChange` | `(collapsed: boolean) => void` | `undefined` | Callback fired when the toolbar collapses or expands. |
| `showCollapseButton` | `boolean` | `true` | Whether to display the collapse toggle button. |
| `labels` | `CanvasLabels` | `{}` | Custom labels and tooltips (supports `collapseToolbar`, `expandToolbar`, etc.). |
| `icons` | `CanvasIcons` | `{}` | Custom icons for toolbar buttons (supports `collapseToolbar`, `expandToolbar`, etc.). |
| `classNames` | `LeafletTualClassNames` | `{}` | Custom CSS classes for container, canvas, toolbar, notes, and text. State-aware slots include `toolButtonActive` (active tool), `swatchButtonActive` (selected color), and `actionButtonDisabled` (disabled undo/redo history buttons). |
| `styles` | `LeafletTualStyles` | `{}` | Inline CSS styles for container, canvas, toolbar, notes, and text. State-aware slots mirror `classNames` (e.g. `actionButtonDisabled` overrides only disabled undo/redo buttons). Disabled action buttons are automatically dimmed with `opacity: 0.45` and a `not-allowed` cursor. |
| `arrowTheme` / `annotationTheme` | `CanvasAnnotationTheme` | `{}` | Custom theme for 2D canvas shapes, arrows, and label pills (supports `labelMinShapeSize`, `labelMaxTextWidth`, `fitLabelsToShape`). |
| `clampOverlaysToViewport` | `boolean` | `true` | Keeps sticky note and text overlays inside map viewport boundaries so they never bleed off container edges on zoom or pan. |
| `autoMinimizeNotesZoom` | `number` | `undefined` | Optional map zoom level threshold below which sticky notes automatically collapse into compact pill badges at low zoom. |
| `strokeColors` | `string[]` | Built-in palette | Color swatches shown in the contextual settings bar. |
| `strokeWidthOptions` | `number[]` | `[1, 2, 3, 4, 5, 6, 8, 10, 12]` | Pixel widths listed in the **Width** select box for arrows, shapes, and free draw. Style it via the `toolbarSelect` slot in `classNames` / `styles`. |
| `fontSizeOptions` | `readonly number[]` | `[10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48]` | Font sizes (in pixels) listed in the **Size** select box for text overlays. Style it via the `toolbarSelect` slot in `classNames` / `styles`. |
| `customToolbarItems` | `CustomToolbarItem[]` | `[]` | Custom buttons or items injected into the toolbar. |
| `onChange` / `onItemsChange` | `(items: CanvasItem[]) => void` | `undefined` | Callback fired immediately on every mutation, stroke point, or attribute update. |
| `onChangeComplete` / `onItemsChangeComplete` | `(items: CanvasItem[], targetItem?: CanvasItem \| null) => void` | `undefined` | Callback fired when editing finishes (e.g. user draws and clicks outside activating Select (V) mode, deselects, presses Escape, or blurs note/text editing). |
| `onEditEnd` / `onEditComplete` | `(items: CanvasItem[], targetItem?: CanvasItem \| null) => void` | `undefined` | Aliases for `onChangeComplete`. |
| `onItemSelect` | `(item: CanvasItem \| null) => void` | `undefined` | Callback fired when an item is selected or deselected. |
| `onItemCreate` | `(item: CanvasItem) => void` | `undefined` | Callback fired when a new item is created. |
| `onItemChange` | `(item: CanvasItem) => void` | `undefined` | Callback fired when an existing item is updated. |
| `onItemChangeComplete` | `(item: CanvasItem) => void` | `undefined` | Callback fired when an item completes editing. |
| `onItemDelete` | `(id: string) => void` | `undefined` | Callback fired when an item is deleted. |

### `useLeafletTual(options)` Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `readOnly` | `boolean` | `false` | Sets initial read-only state. |
| `initialItems` | `CanvasItem[]` | `[]` | Initial annotations array (uncontrolled mode). |
| `items` | `CanvasItem[]` | `undefined` | Controlled annotations array. |
| `maxHistory` | `number` | `50` | Maximum undo/redo stack depth in uncontrolled mode. |
| `onChange` / `onItemsChange` | `(items: CanvasItem[]) => void` | `undefined` | Immediate change callback fired on every modification. |
| `onChangeComplete` / `onItemsChangeComplete` | `(items: CanvasItem[], targetItem?: CanvasItem \| null) => void` | `undefined` | Completion callback fired when an edit finishes (click outside activating Select (V) mode, deselect, blur, Escape). |
| `onEditEnd` / `onEditComplete` | `(items: CanvasItem[], targetItem?: CanvasItem \| null) => void` | `undefined` | Aliases for `onChangeComplete`. |
| `onItemSelect` | `(item: CanvasItem \| null) => void` | `undefined` | Callback fired on selection change. |
| `onItemCreate` | `(item: CanvasItem) => void` | `undefined` | Callback fired when a new item is created. |
| `onItemChange` | `(item: CanvasItem) => void` | `undefined` | Callback fired when an existing item is updated. |
| `onItemChangeComplete` | `(item: CanvasItem) => void` | `undefined` | Callback fired when an item finishes editing. |
| `onItemDelete` | `(id: string) => void` | `undefined` | Callback fired when an item is deleted. |
| `initialTool` | `CanvasTool` | `'select'` | Active tool on mount. |
| `defaultColor` | `string` | `'#2563eb'` | Default stroke color. |
| `defaultStrokeWidth` | `number` | `3` | Default stroke width in pixels. |
| `defaultNoteColor` | `string` | `'#fef08a'` | Default sticky note background color. |
| `defaultFontSize` | `number` | `16` | Default text overlay font size. |
| `defaultShape` | `ShapeKind` | `'square'` | Default shape type. |

### `LeafletTualController` Methods & State

| Property / Method | Type | Description |
| :--- | :--- | :--- |
| `readOnly` | `boolean` | Current read-only mode state. |
| `setReadOnly(readOnly)` | `(readOnly: boolean) => void` | Toggles read-only mode dynamically. |
| `items` | `CanvasItem[]` | All current canvas items. |
| `selectedItem` | `CanvasItem \| null` | Currently selected canvas item. |
| `selectedId` | `string \| null` | ID of the currently selected canvas item. |
| `isEditingLabel` | `boolean` | Whether label edit mode is active for the selected shape/item. |
| `setEditingLabel(editing)` | `(editing: boolean) => void` | Toggles label edit mode for the focused shape/item. |
| `activeTool` | `CanvasTool` | Currently active tool. |
| `activeColor` | `string` | Currently active color. |
| `strokeWidth` | `number` | Currently active stroke width. |
| `dashed` | `boolean` | Whether dashed line is active. |
| `shapeFilled` | `boolean` | Whether shape fill is active. |
| `canUndo` | `boolean` | Whether undo is possible (`false` in read-only mode). |
| `canRedo` | `boolean` | Whether redo is possible (`false` in read-only mode). |
| `setTool(tool)` | `(tool: CanvasTool) => void` | Change active tool. |
| `selectItem(id)` | `(id: string \| null) => void` | Select an item by ID or clear selection with `null`. |
| `addItem(item)` | `(item: CanvasItem) => void` | Add a new annotation. |
| `updateItem(id, updater)` | `(id: string, updater: Partial<CanvasItem> \| fn) => void` | Update an existing item. |
| `removeItem(id)` | `(id: string) => void` | Remove an item by ID. |
| `deleteSelected()` | `() => void` | Delete the currently selected item. |
| `clearAll()` | `() => void` | Remove all canvas items. |
| `undo()` | `() => void` | Revert to previous history snapshot. Snapshots are recorded when an edit completes (`onChangeComplete`), so an interaction (draw, drag, style tweak) collapses into one step. |
| `redo()` | `() => void` | Re-apply reverted history snapshot. |
| `notifyChangeComplete(targetItem?)` | `(targetItem?: CanvasItem \| null) => void` | Programmatically triggers `onChangeComplete` / `onItemsChangeComplete` with the current finalized items. |
| `exportJSON()` | `() => string` | Export canvas items to JSON string. |
| `importJSON(json)` | `(json: string) => void` | Import canvas items from JSON string. |

---

## License

MIT © Yusuf Arslan
