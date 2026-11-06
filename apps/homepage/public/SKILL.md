---
name: leaflet-tual
description: Rules, data model, theming, component usage and controller API for leaflet-tual v3, an opinionated whiteboard-style annotation toolset (pen, arrows, shapes, notes, text, rulers, area, laser pointer, pages) for Leaflet maps. Use when adding, theming or debugging map annotations.
---

# leaflet-tual

Draw on a map the way you draw on a design canvas. Everything you place is stored as geographic coordinates, so it stays attached to the ground while the map pans and zooms.

The design is decided for you:

- **Strict styles.** Colors, sizes and dashes come from fixed sets (`'blue'`, `'m'`, `'dashed'`). There are no free-form hex values or pixel numbers. Drawings stay consistent across maps and applications.
- **An adjustable toolbar.** One `toolbar` prop controls which tools appear, their order, position and extras.
- **An optional inspector.** Set `sidebar` to edit the selected item's style and browse pages, layers and items in a right-side panel.
- **A framework-agnostic core.** The React bindings are a separate, opt-in import.

---

## 1. Install and imports

```bash
npm i leaflet-tual leaflet
```

| Import                    | What you get                                                                          | React needed |
| ------------------------- | ------------------------------------------------------------------------------------- | ------------ |
| `leaflet-tual`            | `createLeafletTual`, `emptyDoc`, `parseDoc`, `createId`, geometry utilities, types     | No           |
| `leaflet-tual/react`      | `<LeafletTual>`, `<Toolbar>`, `<LaserPointer>`, `useLeafletTual`, plus everything above | Yes          |
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
      <LeafletTual onChange={(doc, { committed }) => committed && save(doc)} />
    </MapContainer>
  )
}
```

That gives you the finished product: toolbar, style popovers, pages, and undo/redo, in light or dark. Add props only when you need to change something.

---

## 3. Rules (read before writing code)

1. **Store geography, never pixels.** Every persisted coordinate is a `GeoPoint` (`{ lat, lng }`). Never put screen `{ x, y }` in an item.
2. **Do geometry in world space.** Aspect locks, 45° snapping, circle radii, curve offsets, hit tests and resizing run in a zoom-independent plane (`toWorld` / `fromWorld`), never in current-zoom pixels. Squares stay square and curves keep their shape at every zoom level and latitude.
3. **Use hex colors and explicit sizes.** Colors are hex strings like `#2F6FEB`; transparency is a separate `opacity` value. Widths are `'s' | 'm' | 'l'`, text sizes are `'s' | 'm' | 'l' | 'xl'`.
4. **Change the look through `tokens`** (section 5), not by overriding library internals with CSS selectors.
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
  activePageId: string  // id of the active page
  pages: Page[]
}

export interface Page {
  id: string
  name: string
  view?: { center: GeoPoint; zoom: number }   // restored when the page is activated
  items: Record<string, Item>                 // key is item id ($O(1)$ fast lookup)
  order?: string[]                            // array order is z-order (last on top)
}

export interface Style {
  color?: string
  fillColor?: string
  strokeColor?: string
  textColor?: string
  opacity?: number
  width?: 's' | 'm' | 'l' | number
  dash?: 'solid' | 'dashed' | 'dotted' | 'none'
  size?: 's' | 'm' | 'l' | 'xl'               // text and note font size
  weight?: 'regular' | 'bold'
  fontStyle?: 'normal' | 'italic'
  textDecoration?: 'none' | 'underline'
  underline?: boolean
  list?: 'none' | 'bullet'
  bullets?: boolean
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

export type ArrowKind = 'linear' | 'curved' | 'elbow'
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
  at: GeoPoint                                // center anchor
  width: number                               // width in unscaled pixels
  height: number                              // height in unscaled pixels
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

export interface AreaItem extends Base {
  type: 'area'
  points: GeoPoint[]
  unit?: 'metric' | 'imperial'                // label is computed unless `label` is set
  label?: string
}

export interface NoteItem extends Base {
  type: 'note'
  at: GeoPoint
  width?: number
  height?: number
  title?: string
  text: string
}

export interface TextItem extends Base {
  type: 'text'
  at: GeoPoint
  text: string
}

export type Item =
  | ArrowItem | ShapeItem | FreedrawItem | PenItem | RulerItem | AreaItem
  | NoteItem | TextItem

/** Input for `add`: `id` and `createdAt` are generated when omitted. */
export type NewItem = DistributiveOmit<Item, 'id' | 'createdAt'> & { id?: string }
```

Unset style fields fall back to the defaults for that item's tool. Shapes are blue at 50% opacity, areas use ink with a dashed border, and notes are yellow. Set `fillColor: 'transparent'` to remove a fill. Arrowheads are a filled triangle.

| Helper            | Purpose                                                         |
| ----------------- | --------------------------------------------------------------- |
| `emptyDoc()`      | A valid `Doc` with one empty page named "Page 1"                |
| `parseDoc(input)` | Validates unknown JSON and returns a `Doc` (throws `DocError`)  |
| `createId()`      | Collision-free id                                               |

---

## 5. Theming & Internationalization

### Theme tokens

The toolbar, popovers, menus and contextual tooltip are themed with `themeTokens`; annotation items keep their own fixed palette. Pass plain values or CSS variable references so the chrome follows your app theme:

```tsx
<LeafletTual
  themeTokens={{
    surface: 'var(--app-panel)',
    surfaceActive: 'var(--app-accent)',
    text: 'var(--app-text)',
    textActive: 'var(--app-accent-contrast)',
    accent: 'var(--app-accent)',
    border: 'var(--app-border)',
    divider: 'var(--app-border-muted)',
    radius: '6px',
    controlSize: '30px',
  }}
/>
```

| Token | Purpose |
| --- | --- |
| `surface` | Floating panel background |
| `surfaceActive` | Active/pressed control background |
| `surfaceMuted` | Recessed surfaces and read-only fields |
| `text` | Primary icons and text |
| `textMuted` | Secondary labels, placeholders and shortcuts |
| `textActive` | Icons/text on an active surface |
| `accent` | Focus rings, check marks and selection handles |
| `border` / `divider` / `focus` | Outer borders, internal dividers, focus rings |
| `radius` / `radiusSm` / `radiusLg` | Island, compact-control and popover radii |
| `shadow` / `shadowPopup` | Floating-bar and popover shadows |
| `controlSize` / `groupGap` / `iconSize` | Square control size, gap between islands, icon size |
| `fontFamily` / `fontSize` / `lineHeight` | Chrome typography |
| `variables` | Escape hatch for extra CSS custom properties |

`themeTokens` is also accepted by `createLeafletTual(map, { themeTokens })` and external `<Toolbar themeTokens={...} />`.

### Internationalization (i18n)

Every label, tooltip, placeholder, and unit is managed through clean translation tokens with English defaults.

```tsx
<LeafletTual
  translations={{
    select: 'Seç',
    freedraw: 'Serbest Çizim',
    pen: 'Kalem',
    arrow: 'Ok',
    shape: 'Şekil',
    note: 'Not',
    text: 'Metin',
    undo: 'Geri Al',
    redo: 'Yinele',
    pageDefault: 'Sayfa {n}',
  }}
/>
```

Configure globally via `setDefaultTranslations(tokens)` (see `DEFAULT_TRANSLATION_TOKENS` and `TRANSLATION_KEYS`) or dynamically via `tual.setTranslations(patch)`.

### Default palette constants

Use the hex values directly in `Style`. The named `DEFAULT_PALETTE` constants are convenience values, not style inputs.

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

## 6. Toolbar & Sidebar

Default layout, a stack of Leaflet-style control islands:

`[Page name]  [Select · Text · Note · Draw · Arrow · Shapes · Measure · Laser]  [More]`

The page island shows the active page name; open it to switch, rename, add or delete pages. Page renaming lives in the page settings menu rather than inline in the toolbar. In vertical toolbars the page control collapses to its icon so the island stays square. Undo, redo, fit-in-view and the sidebar toggle live in the **More** menu at the end of the toolbar.

The toolbar position controls its orientation: **top/bottom** toolbars lay out **horizontally**, while **left/right** toolbars lay out **vertically**. Every edge supports start, center and end alignment, so the toolbar can sit in any corner or edge center. When the sidebar is open, the built-in toolbar is pinned to the **top center** regardless of the configured position.

Item properties are edited from the contextual toolbar, the sidebar inspector or the right-click menu.

- The **Draw** popover contains **Free draw** (smooth freehand) and **Pen** (bezier anchors, drag from an anchor to shape its curve). Both tools live in one toolbar group; its icon shows the last-used drawing tool. **Pen** supports clicking to add anchors, dragging to pull mirrored control handles, clicking the first anchor to close, `Enter` or a double-click to finish an open path, and `Escape` to cancel. After drawing, use the Select tool to drag anchors or control handles and reshape the path; dragging one control handle mirrors the opposite one.
- The **Measure** popover groups **Ruler** (geodesic distance measurement) and **Area** (geodesic polygon area measurement with draggable vertices). Clicking or dragging creates a measurement; `Enter` or double-click finishes an area polygon.
- The **Laser** tool (`<LaserPointer>`) provides an ephemeral presentation pointer with a fading glowing trail that does not modify the document.

Tools with variants show a small corner triangle. A plain click activates the tool with its last-used variant; the corner triangle opens the variant popover and the icon updates to match.

Everything about the toolbar is controlled by the `toolbar` prop:

```tsx
<LeafletTual
  toolbar={{
    position: 'top-left', // default; horizontal along the top edge
    tools: ['select', 'freedraw', 'pen', 'arrow', 'shape', 'ruler', 'area', 'laser', 'note'],
    pages: true,
    history: true,
  }}
/>
```

```ts
type DrawKind = 'freedraw' | 'pen'
type MeasureKind = 'ruler' | 'area'
type ToolId = 'select' | 'text' | 'note' | DrawKind | 'arrow' | 'shape' | MeasureKind | 'laser'

type ToolbarPosition =
  | 'inline'
  | 'top-left' | 'top' | 'top-right'
  | 'left-top' | 'left' | 'left-bottom'
  | 'right-top' | 'right' | 'right-bottom'
  | 'bottom-left' | 'bottom' | 'bottom-right'
  | 'center'
  // 'top-center', 'left-center', 'right-center' and 'bottom-center' are aliases for the edge centers

interface ToolbarOptions {
  position?: ToolbarPosition                              // default 'top-left'; use 'inline' outside the map
  orientation?: 'horizontal' | 'vertical'                 // only used by 'inline' toolbars
  tools?: ToolId[]            // which tools to show and in what order; default: all
  pages?: boolean             // page switcher island, default true
  history?: boolean           // undo/redo/fit actions in the More menu, default true
}
```

Pass `toolbar={false}` to hide the built-in toolbar.

### Sidebar inspector

Set the `sidebar` prop to open the right-side properties and layers inspector initially. The sidebar toggle in the toolbar's More menu and the inspector's header close button open and close it; `onSidebarChange` keeps external state in sync:

```tsx
const [sidebarOpen, setSidebarOpen] = useState(true)

<LeafletTual sidebar={sidebarOpen} onSidebarChange={setSidebarOpen} />
```

The inspector contains the page/layer tree and style controls for the current selection (fill, stroke, opacity, typography and label position). Selecting an item in the tree focuses it on the map, and right-clicking a tree item opens the shared context menu. The **More** button at the end of the selected item's contextual toolbar also opens the inspector. While the sidebar is visible, the contextual toolbar shown above selected items is hidden so properties are edited in one place, and the built-in toolbar stays pinned to the top center. The sidebar is also available as a standalone `<Sidebar controller={tual} map={map} onClose={...} />` component; pass `onClose` only when the host can hide it. In read-only mode the built-in sidebar stays hidden.

**External toolbar.** To place the toolbar outside the map, hide the built-in one and render `<Toolbar>` with the same controller. It accepts the same options plus `themeTokens`, `sidebarOpen` and `onToggleSidebar`:

```tsx
const tual = useLeafletTual()

<Toolbar controller={tual} position="inline" history={false} tools={['select', 'freedraw', 'pen', 'arrow']} themeTokens={{ radius: '6px' }} />
<MapContainer>
  <LeafletTual controller={tual} toolbar={false} />
</MapContainer>
```

**No UI at all.** `useLeafletTual()` (or the core `createLeafletTual`) works without any toolbar. Drive tools and styles from your own controls with `setTool` and `setStyle`.

**Reusable chrome controls.** The controls used by the built-in toolbar, sidebar, popovers and contextual tooltip are exported from `leaflet-tual/react` for custom panels: `Button`, `IconButton`, `PillButton`, `SegmentedControl`, `Popover`, `DropdownMenu`, `DropdownItem`, `ConfirmPopover`, `Select`, `NumberField`, `TextField`, `PropertyRow`, `Collapsible`, `ColorSwatch`, `ColorSwatchList`, `ColorSwatchControls`, `CustomColorPicker`, `ColorDropdown`, `TypographyDropdown`, `TextFormattingControls`, `LabelPositionDropdown`, `BorderPopover`, `useOutsideDismiss`, `useWheelGuard`, `useLeafletDomGuard`, `useLeafletDisableClick`, `disableMapInteractions`, `createLeafletControl`, and `createControlContainer`. Wrap a custom panel with `useLeafletDomGuard()` or give it the `tual-panel` class to isolate it from map gestures.

---

## 7. `<LeafletTual>` props

All props are optional.

| Prop                | Type                                    | Notes                                                                                 |
| ------------------- | --------------------------------------- | ------------------------------------------------------------------------------------- |
| `controller`        | `Controller`                            | From `useLeafletTual()`. Omit and one is created internally.                          |
| `value`             | `Doc`                                   | Controlled document.                                                                  |
| `defaultValue`      | `Doc`                                   | Uncontrolled initial document.                                                        |
| `onChange`          | `(doc, info) => void`                   | The single change callback. See below.                                               |
| `themeTokens`       | `Partial<ThemeTokens>`                  | Chrome theme for the toolbar, sidebar, popovers, menus and contextual tooltip.       |
| `toolbar`           | `false \| ToolbarOptions`               | Toolbar configuration (section 6).                                                    |
| `sidebar`           | `boolean`                               | Initial right-side inspector visibility. Hidden while `readOnly`.                     |
| `onSidebarChange`   | `(open: boolean) => void`               | Keeps external sidebar state in sync with the toolbar toggle.                        |
| `readOnly`          | `boolean`                               | No drawing, editing or selection. Hides the toolbar unless `toolbar` is set.          |
| `translations`      | `Partial<TranslationTokens>`            | Localize every tooltip, placeholder and menu string.                                  |
| `map`               | `L.Map`                                 | Only needed outside `<MapContainer>`.                                                 |

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
  readOnly: false,
  translations: {},        // Partial<TranslationTokens>
  tool: 'select',          // initial tool
  style: { color: '#1D1D1B', width: 'm' },
})
```

State (values that re-render your component):

| Member                | Type                            | Description                                     |
| --------------------- | ------------------------------- | ----------------------------------------------- |
| `doc`                 | `Doc`                           | The full document.                              |
| `items`               | `Item[]`                        | Items on the active page.                       |
| `tool`                | `ToolId`                        | Active tool.                                    |
| `variant`             | `ToolVariant \| null`           | Active variant (`ArrowKind \| ShapeKind \| null`). |
| `style`               | `Style`                         | Current drawing defaults.                       |
| `selection`           | `string[]`                      | Selected item ids.                              |
| `selected`            | `Item[]`                        | Selected items.                                 |
| `readOnly`            | `boolean`                       |                                                 |
| `canUndo` / `canRedo` | `boolean`                       |                                                 |
| `translations`        | `TranslationTokens`             | Current resolved translation tokens.            |

Actions:

| Method                         | Description                                                                                         |
| ------------------------------ | --------------------------------------------------------------------------------------------------- |
| `setTranslations(patch)`       | Update translation tokens dynamically.                                                              |
| `setTool(tool, variant?)`      | Activate a tool. `setTool('shape', 'star')`, `setTool('arrow', 'curved')`.                          |
| `setStyle(patch)`              | **Selection-aware.** Changes the selected items, or the drawing defaults when nothing is selected.  |
| `add(item)`                    | Add a `NewItem` to the active page. Returns the created `Item`.                                      |
| `update(id, patch, committed?)`| Shallow-merge into an item. `style` is merged one level deep.                                        |
| `updateMany(patches, committed?)` | Batch-update multiple items in a single undo step.                                                |
| `duplicate(ids?)`              | Clone one id, an array of ids, or the current selection.                                             |
| `reorder(ids, action)`         | Z-order (`'front' \| 'back' \| 'forward' \| 'backward'`).                                            |
| `bringToFront(ids?)`           | Move item(s) or current selection to the top of the z-order.                                         |
| `sendToBack(ids?)`             | Move item(s) or current selection to the bottom of the z-order.                                      |
| `bringForward(ids?)`           | Step item(s) or current selection one layer forward.                                                 |
| `sendBackward(ids?)`           | Step item(s) or current selection one layer backward.                                                |
| `remove(ids?)`                 | Remove one id or an array. With no argument, removes the selection.                                  |
| `clear()`                      | Remove every item on the active page.                                                                |
| `select(ids \| null)`          | Replace the selection.                                                                               |
| `selectAll()`                  | Select every item on the active page.                                                                |
| `edit(id)`                     | Start inline editing (label, text, title) for an item.                                               |
| `undo()` / `redo()`            | One global history across pages.                                                                     |
| `fit(target)`                  | Animate the map to `'all'`, `'selection'` or an item id.                                             |
| `load(doc)`                    | Replace the document (use `parseDoc` first for untrusted input).                                     |
| `setReadOnly(v)`               |                                                                                                      |

Pages:

```ts
tual.pages.list                       // { id, name }[]
tual.pages.active                     // active page id
tual.pages.add(name?)                 // returns the new page id and activates it
tual.pages.rename(id, name)
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
  style: { color: '#2F6FEB', width: 'l' },
})

tual.add({ type: 'note', at: { lat: 41.015, lng: 28.97 }, text: 'Meet here', style: { color: '#F5C518' } })
```

### Custom translation tokens

```tsx
<LeafletTual translations={{ select: 'Seç', note: 'Not', text: 'Metin' }} />
```

### Minimal toolbar for end users

```tsx
<LeafletTual toolbar={{ tools: ['select', 'freedraw', 'pen', 'note'], pages: false }} />
```

### Pages

```tsx
const id = tual.pages.add('Phase 2')
tual.pages.rename(id, 'Phase 2 · Routes')
tual.pages.select(tual.pages.list[0].id)
```

### Read-only viewer

```tsx
<LeafletTual readOnly defaultValue={doc} />
```

### Vanilla JS (no React)

```ts
import L from 'leaflet'
import { createLeafletTual, emptyDoc } from 'leaflet-tual'
import 'leaflet-tual/styles.css'

const map = L.map('map').setView([41.01, 28.97], 13)
const tual = createLeafletTual(map, {
  defaultValue: emptyDoc(),
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
| `select`   |                                                                                        | V   | Click, Shift-click, Shift-drag marquee box selection, right-click context menu, move, resize, reorder, delete. |
| `text`     |                                                                                        | T   | Click to place and type.                                         |
| `note`     |                                                                                        | N   | Click to place a sticky note and edit it.                        |
| `freedraw` |                                                                                        | F   | Smoothed freehand stroke.                                        |
| `pen`      |                                                                                        | P   | Bezier path: click anchors, drag handles, click first anchor to close, `Enter` to finish. |
| `arrow`    | `linear` · `curved` · `elbow`                                                          | L   | Drag from start to end. Heads are set in `heads`.                |
| `shape`    | `square` · `circle` · `star` · `actor` · `triangle` · `diamond` · `hexagon` · `marker` | S   | Drag a box, or click to place a default-sized shape. Fill via `style.fillColor` and `style.opacity`. |
| `ruler`    |                                                                                        | R   | Drag to measure a geodesic distance.                             |
| `area`     |                                                                                        | A   | Drag to measure a rectangle area, or click vertices to draft a polygon area (`Enter` or double-click to finish). |
| `laser`    |                                                                                        | K   | Ephemeral laser pointer with decaying glowing trail for live presentations. |

Global: `Esc` cancels or deselects, `Cmd/Ctrl+Z` undo, `Cmd/Ctrl+Shift+Z` redo, `Delete` remove, arrow keys nudge, middle-click drag pans the map even when items are selected.

These are defaults and can be changed with the `shortcuts` prop:

```tsx
<LeafletTual
  shortcuts={{
    pen: 'D',
    freedraw: false,
    undo: 'Mod+Z',
    delete: ['Delete', 'Backspace'],
    escape: false,
  }}
/>
```

Set `shortcuts={false}` to disable every shortcut. Bindings use `KeyboardEvent.key` names with optional `Mod` (Cmd on macOS / Ctrl elsewhere), `Ctrl`, `Meta`/`Cmd`, `Shift` and `Alt` prefixes; arrays register alternatives and `false` disables one action. The same prop on a standalone `<Toolbar>` keeps its shortcut labels in sync. Vanilla callers pass the same config as the third argument to `setupKeyboardShortcuts(controller, handlers, shortcuts)`. Shortcuts are ignored while focus is inside an input, select, contenteditable element, button/link, menu/listbox, modal dialog or Tual chrome.

An active drawing tool disables map dragging and double-click zoom, and restores both when you switch away.

---

## 11. Geometry and zoom

- **Attached to the ground.** Items keep their geographic position through pan, zoom and animated zoom, with no lag and no private transform.
- **Shapes keep their form.** Geometry is computed in world space, so a square stays square, a circle stays round and a curve keeps its curvature at every zoom level.
- **Screen-constant UI.** Selection handles and hit targets stay the same size on screen.
- **Strokes** are constant-width on screen, like map overlays. Text scales with zoom.
- **Fit and focus.** `tual.fit('all' | 'selection' | itemId)` uses the map's own animated `fitBounds`.

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
| `polygonArea(points)`                     | Geodesic area in square meters (Chamberlain-Duquette spherical excess).|
| `polygonCentroid(points)`                 | Geometric centroid of polygon vertices (`GeoPoint`).                  |
| `formatArea(sqMeters, unit = 'metric')`   | `"1.5 km²"`, `"250 m²"` or `"12.5 ac"`, `"3.2 sq mi"`.               |
| `resolveColor(hex)`                       | Validates a hex color and returns the fallback ink color when invalid. |

