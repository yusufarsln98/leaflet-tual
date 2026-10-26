---
name: leaflet-tual
description: Rules, data model, theming, component usage and controller API for leaflet-tual v2, an opinionated whiteboard-style annotation toolset (pen, arrows, shapes, notes, text, rulers, artboards, pages) for Leaflet maps. Use when adding, theming or debugging map annotations.
---

# leaflet-tual

Draw on a map the way you draw on a design canvas. Everything you place is stored as geographic coordinates, so it stays attached to the ground while the map pans and zooms.

The design is decided for you:

- **Strict styles.** Colors, sizes and dashes come from fixed sets (`'blue'`, `'m'`, `'dashed'`). There are no free-form hex values or pixel numbers. Drawings stay consistent and adapt to dark mode automatically.
- **An adjustable toolbar.** One `toolbar` prop controls which tools appear, their order, position and extras.
- **A framework-agnostic core.** The React bindings are a separate, opt-in import.

---

## 1. Install and imports

```bash
npm i leaflet-tual leaflet
```

| Import                    | What you get                                                                          | React needed |
| ------------------------- | ------------------------------------------------------------------------------------- | ------------ |
| `leaflet-tual`            | `createLeafletTual`, `emptyDoc`, `parseDoc`, `createId`, geometry utilities, types     | No           |
| `leaflet-tual/react`      | `<LeafletTual>`, `<Toolbar>`, `useLeafletTual`, plus everything above                 | Yes          |
| `leaflet-tual/styles.css` | The design system (CSS variables and component styles)                                | No           |

---

## 2. Quick start

```tsx
import { MapContainer, TileLayer } from 'react-leaflet'
import { LeafletTual } from 'leaflet-tual/react'
import 'leaflet/dist/leaflet.css'
import 'leaflet-tual/styles.css'

export function MapView() {
  return (
    <MapContainer center={[41.01, 28.97]} zoom={13} style={{ height: '100vh' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LeafletTual theme="system" onChange={(doc, { committed }) => committed && save(doc)} />
    </MapContainer>
  )
}
```

That gives you the finished product: toolbar, style popovers, pages, undo/redo, artboards and PNG export, in light or dark. Add props only when you need to change something.

---

## 3. Rules (read before writing code)

1. **Store geography, never pixels.** Every persisted coordinate is a `GeoPoint` (`{ lat, lng }`). Never put screen `{ x, y }` in an item.
2. **Do geometry in world space.** Aspect locks, 45° snapping, circle radii, curve offsets, hit tests and resizing run in a zoom-independent plane (`toWorld` / `fromWorld`), never in current-zoom pixels. Squares stay square and curves keep their shape at every zoom level and latitude.
3. **Use the built-in style values.** Colors are palette names, widths are `'s' | 'm' | 'l'`, text sizes are `'s' | 'm' | 'l' | 'xl'`. Do not store hex colors or pixel sizes in items.
4. **Change the look through `theme` and `tokens`** (section 5), not by overriding library internals with CSS selectors.
5. **Change the toolbar through the `toolbar` prop** (section 6).
6. **One document, one change callback.** State is a plain JSON `Doc`. Save from `onChange` only when `info.committed` is `true`.
7. **Controlled or uncontrolled, never both.** Pass `value` or `defaultValue`. Undo and redo work in both modes and report through `onChange`.
8. **Mutate through the controller** (`add`, `update`, `remove`). Never edit `doc` or `items` in place.
9. **Modifiers are built in.** `Shift` locks aspect (1:1) and snaps angles to 45°. `Alt` resizes from the center.
10. **Validate untrusted JSON** with `parseDoc(input)` before `load`.
11. **Map context.** Inside `<MapContainer>`, `<LeafletTual>` finds the map itself. Outside it, pass `map={mapInstance}`.

---

## 4. Data model

```ts
export type GeoPoint = { lat: number; lng: number }

export interface Doc {
  version: 2
  page: string          // id of the active page
  pages: Page[]
}

export interface Page {
  id: string
  name: string
  view?: { center: GeoPoint; zoom: number }   // restored when the page is activated
  items: Item[]                               // array order is z-order (last on top)
}

export type ColorName =
  | 'ink' | 'gray' | 'taupe' | 'red' | 'orange'
  | 'yellow' | 'green' | 'blue' | 'purple' | 'pink'

export interface Style {
  color?: ColorName
  width?: 's' | 'm' | 'l'
  dash?: 'solid' | 'dashed' | 'dotted'
  fill?: 'none' | 'tint' | 'solid'            // fill uses the same color
  size?: 's' | 'm' | 'l' | 'xl'               // text and note font size
  weight?: 'regular' | 'bold'
  align?: 'left' | 'center' | 'right'
  radius?: number                             // corner radius in px (default 8)
}

interface Base {
  id: string
  style?: Style
  locked?: boolean
  meta?: Record<string, unknown>              // your own data, preserved untouched
  readonly createdAt: number
}

export type ArrowKind = 'linear' | 'curved' | 'elbow' | 's-curve'
export type Head = 'triangle' | 'open' | 'none'
export type ShapeKind =
  | 'square' | 'circle' | 'star' | 'actor'
  | 'triangle' | 'diamond' | 'hexagon' | 'marker'
export type LabelPosition = 'top' | 'center' | 'bottom'

export interface ArrowItem extends Base {
  type: 'arrow'
  kind: ArrowKind
  from: GeoPoint
  to: GeoPoint
  via?: GeoPoint                              // control point for curved routes
  heads?: { start?: Head; end?: Head }        // default { start: 'none', end: 'triangle' }
  label?: string
}

export interface ShapeItem extends Base {
  type: 'shape'
  kind: ShapeKind
  from: GeoPoint                              // opposite corners of the bounding box
  to: GeoPoint
  label?: string
  labelPosition?: LabelPosition               // default 'center'
}

export interface FreedrawItem extends Base {
  type: 'freedraw'
  points: GeoPoint[]                          // pointer samples for a freehand stroke
}

export interface PenPoint {
  at: GeoPoint                                // bezier anchor
  in?: GeoPoint                               // incoming control point (absolute)
  out?: GeoPoint                              // outgoing control point (absolute)
}

export interface PenItem extends Base {
  type: 'pen'
  points: PenPoint[]
  closed?: boolean                            // path loops back to the first anchor
}

export interface RulerItem extends Base {
  type: 'ruler'
  from: GeoPoint
  to: GeoPoint
  unit?: 'metric' | 'imperial'                // label is computed unless `label` is set
  label?: string
}

export interface NoteItem extends Base {
  type: 'note'
  at: GeoPoint
  title?: string
  text: string
  collapsed?: boolean
}

export interface TextItem extends Base {
  type: 'text'
  at: GeoPoint
  text: string
}

export interface ArtboardItem extends Base {
  type: 'artboard'
  from: GeoPoint
  to: GeoPoint
  title: string
}

export type Item =
  | ArrowItem | ShapeItem | FreedrawItem | PenItem | RulerItem
  | NoteItem | TextItem | ArtboardItem

/** Input for `add`: `id` and `createdAt` are generated when omitted. */
export type NewItem = DistributiveOmit<Item, 'id' | 'createdAt'> & { id?: string }
```

Unset style fields fall back to the defaults for that item's tool. Default look: free draw, pen, arrow, ruler and shapes use `ink` at width `'m'`, with shapes using `fill: 'solid'`. Notes are `yellow` at size `'l'`. Arrowheads are a filled triangle. Legacy documents that stored freehand strokes as `type: 'pen'` with flat `points` are migrated to `type: 'freedraw'` by `parseDoc`.

Items inside an artboard move with it.

| Helper            | Purpose                                                         |
| ----------------- | --------------------------------------------------------------- |
| `emptyDoc()`      | A valid `Doc` with one empty page named "Page 1"                |
| `parseDoc(input)` | Validates unknown JSON and returns a `Doc` (throws `DocError`)  |
| `createId()`      | Collision-free id                                               |

---

## 5. Theming

### Color scheme

```tsx
<LeafletTual theme="dark" />    // 'light' | 'dark' | 'system'  (default 'system')
```

`'system'` follows `prefers-color-scheme` and updates live. The scheme applies to everything: toolbar, popovers, artboards, notes, text, handles, and the colors of drawn items.

### Tokens

Tune the design with one `tokens` object. Everything is optional and deep-merged over the defaults.

```tsx
<LeafletTual
  tokens={{
    accent: '#2563eb',
    radius: 12,
    font: 'Inter, system-ui, sans-serif',
    dark: { surface: '#16181d' },
    palette: { blue: { light: '#1D4ED8', dark: '#60A5FA' } },
    defaults: { pen: { color: 'blue', width: 'l' } },
  }}
/>
```

```ts
interface Tokens {
  accent: string          // active tool, selection, handles
  radius: number          // chrome corner radius in px (default 12)
  font: string
  light: Partial<Scheme>
  dark: Partial<Scheme>
  palette: Partial<Record<ColorName, { light: string; dark: string }>>   // retune the built-in colors
  defaults: Partial<Record<'freedraw' | 'pen' | 'arrow' | 'shape' | 'ruler' | 'note' | 'text', Style>>
}

interface Scheme {
  surface: string         // toolbar and popovers
  surfaceHover: string
  border: string
  text: string
  muted: string
  activeBg: string        // active tool background
  activeFg: string
  shadow: string
  artboardFill: string
  artboardBorder: string
  handle: string          // selection handles
}
```

The palette is a fixed set of names. `tokens.palette` changes what each name looks like. It does not add new names.

Default scheme values (seeded from the design reference; refine as needed):

| Token            | Light      | Dark       |
| ---------------- | ---------- | ---------- |
| `surface`        | `#FFFFFF`  | `#1E1E1E`  |
| `surfaceHover`   | `#F1F0EE`  | `#2A2A2A`  |
| `border`         | `#E3E1DD`  | `#333333`  |
| `text`           | `#1D1D1B`  | `#ECEAE6`  |
| `muted`          | `#6B6760`  | `#9A958C`  |
| `activeBg`       | `#DCEBFF`  | `#1F3A5F`  |
| `activeFg`       | `#1D6BF3`  | `#6AA5FF`  |
| `artboardFill`   | `#FFFFFF`  | `#2A2A2A`  |
| `artboardBorder` | `#D8D6D2`  | `#3A3A3A`  |

### CSS variables

Every token is also a CSS variable on the `.tual` root, so you can theme without props, or scope a theme to part of your app:

```css
.tual {
  --tual-accent: #2563eb;
  --tual-radius: 12px;
  --tual-font: Inter, system-ui, sans-serif;
  --tual-surface: #fff;
  --tual-border: #e3e1dd;
}
.tual[data-theme='dark'] { --tual-surface: #16181d; }
```

For structural tweaks, `classNames` takes a class per part (`toolbar`, `popover`, `note`, `text`, `artboard`, `handle`).

### Palette

| Name     | Light     | Dark      | Used for                          |
| -------- | --------- | --------- | --------------------------------- |
| `ink`    | `#1D1D1B` | `#F2F0EC` | High-contrast text, strokes and the default drawing color |
| `gray`   | `#8A857E` | `#A8A39B` |                                   |
| `taupe`  | `#B5ADA3` | `#8F877D` |                                   |
| `red`    | `#E5484D` | `#FF6369` |                                   |
| `orange` | `#F76B15` | `#FF8B3E` |                                   |
| `yellow` | `#F5C518` | `#FFD43B` | Default note                      |
| `green`  | `#30A46C` | `#3DD68C` |                                   |
| `blue`   | `#2F6FEB` | `#6AA5FF` |                                   |
| `purple` | `#8E4EC6` | `#BF7AF0` |                                   |
| `pink`   | `#D6409F` | `#F76BC6` |                                   |

Notes and text-on-fill use a soft surface derived from the color, with automatically contrasting text. The default `yellow` note is `#FFF1A1` with `#4A4020` text in light mode, with a matching dark variant in dark mode.

### Size scales

| Prop                 | Values                       | Pixels            |
| -------------------- | ---------------------------- | ----------------- |
| `width`              | `'s'` · `'m'` · `'l'`        | 1 · 2 · 4         |
| `size` (text, notes) | `'s'` · `'m'` · `'l'` · `'xl'` | 14 · 20 · 32 · 56 |

---

## 6. Toolbar

Default layout, one floating row:

`[Page ▾] │ Select · Text · Note · Draw ▾ · Arrow ▾ · Shapes ▾ · Ruler │ Undo · Redo`

The **Draw ▾** popover contains **Free draw** (smooth freehand) and **Pen** (bezier anchors, drag from an anchor to shape its curve). Both tools live in one toolbar group; its icon shows the last-used drawing tool. **Pen** supports clicking to add anchors, dragging to pull mirrored control handles, clicking the first anchor to close, `Enter` or a double-click to finish an open path, and `Escape` to cancel.

Buttons with a chevron open an options popover. A plain click activates the tool with its last-used variant, and the icon updates to match.

Everything about the toolbar is controlled by the `toolbar` prop:

```tsx
<LeafletTual
  toolbar={{
    position: 'bottom',
    tools: ['select', 'freedraw', 'pen', 'arrow', 'shape', 'note'],
    pages: false,
    actions: [{ id: 'snapshot', label: 'Snapshot', icon: <CameraIcon />, onClick: snapshot }],
  }}
/>
```

```ts
type DrawKind = 'freedraw' | 'pen'
type ToolId = 'select' | 'text' | 'note' | DrawKind | 'arrow' | 'shape' | 'ruler'

interface ToolbarOptions {
  position?: 'top-left' | 'top' | 'top-right' | 'left' | 'right'
           | 'bottom-left' | 'bottom' | 'bottom-right'        // default 'top-left'
  orientation?: 'horizontal' | 'vertical'                      // default 'horizontal'
  tools?: ToolId[]            // which tools to show and in what order; default: all
  variants?: {                // limit the options inside the Draw, Arrow and Shapes popovers
    draw?: DrawKind[]
    arrow?: ArrowKind[]
    shape?: ShapeKind[]
  }
  pages?: boolean             // page switcher, default true
  history?: boolean           // undo and redo, default true
  collapsible?: boolean       // default false
  collapsed?: boolean         // controlled
  onCollapsedChange?: (collapsed: boolean) => void
  actions?: ToolbarAction[]   // your own buttons, appended after the tools
}

interface ToolbarAction {
  id: string
  label: string               // tooltip and accessible name
  icon: ReactNode
  onClick: () => void
  active?: boolean
  disabled?: boolean
}
```

Pass `toolbar={false}` to hide the built-in toolbar.

**External toolbar.** To place the toolbar outside the map, hide the built-in one and render `<Toolbar>` with the same controller. It accepts the same options as `ToolbarOptions`:

```tsx
const tual = useLeafletTual()

<Toolbar controller={tual} orientation="vertical" tools={['select', 'freedraw', 'pen', 'arrow']} />
<MapContainer>
  <LeafletTual controller={tual} toolbar={false} />
</MapContainer>
```

**No UI at all.** `useLeafletTual()` (or the core `createLeafletTual`) works without any toolbar. Drive tools and styles from your own controls with `setTool` and `setStyle`.

---

## 7. `<LeafletTual>` props

All props are optional.

| Prop                | Type                                    | Notes                                                                                 |
| ------------------- | --------------------------------------- | ------------------------------------------------------------------------------------- |
| `controller`        | `Controller`                            | From `useLeafletTual()`. Omit and one is created internally.                          |
| `value`             | `Doc`                                   | Controlled document.                                                                  |
| `defaultValue`      | `Doc`                                   | Uncontrolled initial document.                                                        |
| `onChange`          | `(doc, info) => void`                   | The single change callback. See below.                                               |
| `onSelect`          | `(items: Item[]) => void`               | Selection changed.                                                                    |
| `onToolChange`      | `(tool, variant) => void`               | Active tool changed.                                                                  |
| `theme`             | `'light' \| 'dark' \| 'system'`          | Color scheme. Default `'system'`.                                                     |
| `tokens`            | `Partial<Tokens>`                       | Design tuning (section 5).                                                            |
| `toolbar`           | `false \| ToolbarOptions`               | Toolbar configuration (section 6).                                                    |
| `readOnly`          | `boolean`                               | No drawing, editing or selection. Hides the toolbar unless `toolbar` is set.          |
| `labels`            | `Partial<Labels>`                       | Localize every tooltip, placeholder and menu string.                                  |
| `collapseBelowZoom` | `{ notes?: number; text?: number }`     | Auto-collapse overlays when zoomed out below these levels.                            |
| `map`               | `L.Map`                                 | Only needed outside `<MapContainer>`.                                                 |
| `zIndex`            | `number`                                | Default `650`.                                                                        |
| `className` / `style` | `string` / `CSSProperties`            | Root container.                                                                       |
| `classNames`        | `Partial<Record<Part, string>>`         | Parts: `toolbar`, `popover`, `note`, `text`, `artboard`, `handle`.                    |

```ts
type ChangeInfo = {
  reason: 'create' | 'update' | 'delete' | 'reorder' | 'page' | 'load' | 'undo' | 'redo'
  ids: string[]          // affected items
  committed: boolean     // true when the gesture or edit finished; save on this
}
```

---

## 8. Controller: `useLeafletTual(options?)`

```ts
const tual = useLeafletTual({
  defaultValue,            // Doc, uncontrolled start
  value,                   // Doc, controlled
  onChange,                // same signature as the component prop
  maxHistory: 100,
  readOnly: false,
  tool: 'select',          // initial tool
  style: { color: 'ink', width: 'm' },     // initial drawing defaults
})
```

State (values that re-render your component):

| Member                | Type                  | Description                                  |
| --------------------- | --------------------- | -------------------------------------------- |
| `doc`                 | `Doc`                 | The full document.                           |
| `items`               | `Item[]`              | Items on the active page.                    |
| `tool`                | `ToolId`              | Active tool.                                 |
| `variant`             | `string \| null`      | Active variant (arrow kind or shape kind).   |
| `style`               | `Style`               | Current drawing defaults.                    |
| `selection`           | `string[]`            | Selected item ids.                           |
| `selected`            | `Item[]`              | Selected items.                              |
| `scheme`              | `'light' \| 'dark'`   | Resolved color scheme.                       |
| `readOnly`            | `boolean`             |                                              |
| `canUndo` / `canRedo` | `boolean`             |                                              |

Actions:

| Method                         | Description                                                                                         |
| ------------------------------ | --------------------------------------------------------------------------------------------------- |
| `setTool(tool, variant?)`      | Activate a tool. `setTool('shape', 'star')`, `setTool('arrow', 'curved')`.                          |
| `setStyle(patch)`              | **Selection-aware.** Changes the selected items, or the drawing defaults when nothing is selected.  |
| `add(item)`                    | Add a `NewItem` to the active page. Returns the created `Item`.                                      |
| `update(id, patch)`            | Shallow-merge into an item. `style` is merged one level deep.                                        |
| `remove(ids?)`                 | Remove one id or an array. With no argument, removes the selection.                                  |
| `clear()`                      | Remove every item on the active page.                                                                |
| `select(ids \| null)`          | Replace the selection.                                                                               |
| `edit(id)`                     | Start inline editing (label, text, title) for an item.                                               |
| `undo()` / `redo()`            | One global history across pages.                                                                     |
| `fit(target)`                  | Animate the map to `'all'`, `'selection'` or an artboard id.                                         |
| `exportPNG(artboardId, opts?)` | `Promise<Blob>`. Options: `{ scale = 2, scheme = 'light', basemap = false }`.                         |
| `load(doc)`                    | Replace the document (use `parseDoc` first for untrusted input).                                     |
| `setReadOnly(v)`               |                                                                                                      |

Pages:

```ts
tual.pages.list                       // { id, name }[]
tual.pages.active                     // active page id
tual.pages.add(name?)                 // returns the new page id and activates it
tual.pages.rename(id, name)
tual.pages.duplicate(id)
tual.pages.remove(id)                 // no-op when only one page remains
tual.pages.move(id, toIndex)
tual.pages.select(id)                 // saves the current view, restores the target's view
```

Events (core and React): `tual.on('change' | 'select' | 'tool' | 'page', handler)` returns an unsubscribe function.

---

## 9. Recipes

### Controlled and persisted

```tsx
const [doc, setDoc] = useState<Doc>(() => loadFromServer() ?? emptyDoc())

<LeafletTual
  value={doc}
  onChange={(next, { committed }) => {
    setDoc(next)
    if (committed) debouncedSave(next)
  }}
/>
```

### Add items from code

```tsx
tual.add({
  type: 'arrow',
  kind: 'curved',
  from: { lat: 41.0082, lng: 28.9784 },
  to: { lat: 41.0256, lng: 28.9742 },
  label: 'Route',
  style: { color: 'blue', width: 'l' },
})

tual.add({ type: 'note', at: { lat: 41.015, lng: 28.97 }, text: 'Meet here', style: { color: 'yellow' } })
```

### Dark mode that follows your app

```tsx
const { resolvedTheme } = useTheme()   // your app's theme hook
<LeafletTual theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />
```

### Minimal toolbar for end users

```tsx
<LeafletTual toolbar={{ tools: ['select', 'freedraw', 'pen', 'note'], pages: false, history: true }} />
```

### Pages

```tsx
const id = tual.pages.add('Phase 2')
tual.pages.rename(id, 'Phase 2 · Routes')
tual.pages.select(tual.pages.list[0].id)
```

### Export an artboard

```tsx
const png = await tual.exportPNG(artboardId, { scale: 2, scheme: 'light' })
download(png, 'artboard.png')
```

`basemap: true` also paints the map tiles. This fails on tiles served without CORS headers, so the promise rejects with `ExportError`. Handle it.

### Read-only viewer

```tsx
<LeafletTual readOnly theme="light" defaultValue={doc} />
```

### Vanilla JS (no React)

```ts
import L from 'leaflet'
import { createLeafletTual, emptyDoc } from 'leaflet-tual'
import 'leaflet-tual/styles.css'

const map = L.map('map').setView([41.01, 28.97], 13)
const tual = createLeafletTual(map, {
  defaultValue: emptyDoc(),
  theme: 'system',
  toolbar: { position: 'top-left' },
  onChange: (doc, info) => info.committed && save(doc),
})

tual.setTool('freedraw') // or tual.setTool('pen') for the bezier pen
tual.on('select', (items) => console.log(items))
// later
tual.destroy()
```

`createLeafletTual` returns the same controller API as section 8, plus `destroy()`.

---

## 10. Tools, variants and shortcuts

| Tool       | Variants                                                                               | Key | Behavior                                                         |
| ---------- | -------------------------------------------------------------------------------------- | --- | ---------------------------------------------------------------- |
| `select`   |                                                                                        | V   | Click, Shift-click, marquee, move, resize, delete.               |
| `hand`     |                                                                                        | H   | Pan only. `Space` + drag and middle mouse pan from any tool.     |
| `text`     |                                                                                        | T   | Click to place and type.                                         |
| `artboard` |                                                                                        | A   | Drag to create. Title above the corner, with fit and export buttons. |
| `note`     |                                                                                        | N   | Click to place a sticky note and edit it.                        |
| `freedraw` |                                                                                        | F   | Smoothed freehand stroke.                                        |
| `pen`      |                                                                                        | P   | Bezier path: click anchors, drag handles, click first anchor to close, `Enter` to finish. |
| `arrow`    | `linear` · `curved` · `elbow` · `s-curve`                                              | L   | Drag from start to end. Heads are set in `heads`.                |
| `shape`    | `square` · `circle` · `star` · `actor` · `triangle` · `diamond` · `hexagon` · `marker` | S   | Drag a box, or click to place a default-sized shape. Fill via `style.fill`. |
| `ruler`    |                                                                                        | R   | Drag to measure a geodesic distance.                             |

Global: `Esc` cancels or deselects, `Cmd/Ctrl+Z` undo, `Cmd/Ctrl+Shift+Z` redo, `Cmd/Ctrl+D` duplicate, `Delete` remove, arrow keys nudge.

An active drawing tool disables map dragging and double-click zoom, and restores both when you switch away. On touch, one finger draws and two fingers pan and zoom.

---

## 11. Geometry and zoom

- **Attached to the ground.** Items keep their geographic position through pan, zoom and animated zoom, with no lag and no private transform.
- **Shapes keep their form.** Geometry is computed in world space, so a square stays square, a circle stays round and a curve keeps its curvature at every zoom level.
- **Screen-constant UI.** Selection handles, artboard titles and icons, the marquee and hit targets stay the same size on screen.
- **Strokes** are constant-width on screen, like map overlays. Text scales with zoom.
- **Fit and focus.** `tual.fit('all' | 'selection' | artboardId)` and the artboard's expand button use the map's own animated `fitBounds`.

---

## 12. Geometry utilities

Pure functions. Those that take no map work anywhere.

| Function                                  | Description                                                           |
| ----------------------------------------- | --------------------------------------------------------------------- |
| `geoToScreen(map, geo)`                   | `GeoPoint` to `{ x, y }` pixels for the current view.                 |
| `screenToGeo(map, point)`                 | `{ x, y }` pixels to `GeoPoint`.                                      |
| `toWorld(geo)` / `fromWorld(point)`       | Zoom-independent projected plane. Do geometry here.                   |
| `lockAspect(anchor, target, ratio = 1)`   | Constrain a drag box to an aspect ratio (world space).                |
| `snapAngle(anchor, target, step = 45)`    | Snap a vector to angle increments (world space).                      |
| `defaultVia(from, to, curvature = 0.25)`  | Default control point for `curved` arrows.                            |
| `hitTest(item, point, tolerance)`         | Whether a screen point hits an item.                                  |
| `bounds(item)`                            | Geographic bounds of any item.                                        |
| `distance(a, b)`                          | Geodesic distance in meters.                                          |
| `pathDistance(points)`                    | Cumulative geodesic distance in meters.                               |
| `formatDistance(meters, unit = 'metric')` | `"1.2 km"` or `"0.7 mi"`.                                             |
| `resolveColor(name, scheme)`              | Palette name to hex for a scheme.                                     |

---

## 13. Migrating from v1

v2 is a breaking release. There are no aliases and no compatibility layer.

| v1                                                                   | v2                                                                  |
| -------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `items` / `initialItems` (array)                                     | `value` / `defaultValue` (`Doc` with pages)                         |
| `onChange`, `onItemsChange`, `onChangeComplete`, `onEditEnd`, `onEditComplete` | one `onChange(doc, { committed })`                        |
| `onItemCreate/Change/ChangeComplete/Delete`                          | `info.reason` and `info.ids` on `onChange`                          |
| `onItemSelect`                                                       | `onSelect(items)`                                                   |
| `showToolbar`, `toolbarPosition`, `toolbarOrientation`, `collapsible`, `defaultCollapsed`, `collapsed`, `onCollapsedChange`, `showCollapseButton`, `enabledTools`, `showHistoryControls`, `showDeleteButton`, `showClearButton`, `showToolLabels` | one `toolbar` object (or `false`) |
| `customTools`, `renderToolbar`                                       | `toolbar.actions`, or `toolbar={false}` with your own UI            |
| `<CanvasToolbar>`                                                    | `<Toolbar>`                                                         |
| `strokeColors`, `strokeWidthOptions`, `fontSizeOptions`, `annotationTheme`, `arrowTheme` | `theme` and `tokens`; the palette and size scales are fixed |
| `styles`, `unstyled`, `icons`                                        | `tokens`, CSS variables, `classNames`                               |
| `renderNote`, `renderText`                                           | removed; notes and text use the built-in design                     |
| `autoMinimizeNotesZoom`, `autoMinimizeTextZoom`                      | `collapseBelowZoom={{ notes, text }}`                               |
| `setActiveTool`, `setTool`                                           | `setTool(tool, variant?)`                                           |
| `arrow-linear`, `arrow-curved`, `arrow-bi`, `arrow-elbow`, `arrow-s-curve` | `arrow` tool + variant; `'bi'` becomes `heads`                |
| `freedraw`                                                           | `freedraw` tool + `FreedrawItem`; the bezier `pen` tool is new       |
| `setActiveShape`, `setShapeFilled`                                   | `setTool('shape', kind)`, `setStyle({ fill })`                      |
| `setActiveColor`, `setStrokeWidth`, `setDashed`, `setNoteColor`, `setFontSize`, `setFontWeight` | `setStyle({ color, width, dash, fill, size, weight })` |
| `setSelectedId`, `selectItem`, `selectedId`, `selectedItem`          | `select(ids)`, `selection`, `selected`                              |
| `removeItem`, `deleteItem`, `deleteSelected`, `clearAll`, `clear`    | `remove(ids?)`, `clear()`                                           |
| `addItem`, `updateItem`                                              | `add`, `update`                                                     |
| `isEditingLabel`, `setEditingLabel`                                  | `edit(id)`                                                          |
| `notifyChangeComplete`                                               | not needed; `committed` is set automatically                        |
| `exportJSON()` / `importJSON(json)`                                  | `doc` / `load(parseDoc(json))`                                      |
| item `freedraw`, `start` / `end`, `controlPoint`, `position`         | `freedraw` / `pen`, `from` / `to`, `via`, `at`                      |
| item `arrowStyle`, `headStyle`, `shape` (on shapes)                  | `kind`, `heads`, `kind`                                             |
| item `color` (hex), `strokeWidth` (number), `dashed` (boolean)       | `style.color` (palette name), `style.width` (`'s'`/`'m'`/`'l'`), `style.dash` |
| item `fillColor`, `filled`, `backgroundColor`, `textColor`, `initialFontSize`, `fontWeight` | `style.color`, `style.fill`, `style.size`, `style.weight` |
| item `labelMode`, `hasLabelMode`, `minimized`, `collapseState`, `width`/`height`, `baseZoom` | removed; use `collapsed` and `edit(id)`    |
| `calculateGeodesicDistance`, `calculateLineDistance`, `formatRealWorldDistance` | `distance`, `pathDistance`, `formatDistance`            |
| `constrainToAspectRatio`, `constrainAngleTo45Degrees`, `computeDefaultControlGeoPoint` | `lockAspect`, `snapAngle`, `defaultVia`           |
| `createLeafletTualController` / `paintLeafletTual`                   | `createLeafletTual(map, options)`                                   |
