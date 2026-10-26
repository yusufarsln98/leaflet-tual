# leaflet-tual

> Opinionated whiteboard-style annotation toolset (pen, arrows, shapes, notes, text, rulers, artboards, pages) for Leaflet maps.

Draw on a map the way you draw on a design canvas. Everything you place is stored as geographic coordinates (`GeoPoint`: `{ lat, lng }`), keeping annotations attached to the ground while the map pans and zooms.

The design is decided for you:

- **Strict styles.** Colors, sizes and dashes come from fixed sets (`'blue'`, `'m'`, `'dashed'`). There are no free-form hex values or pixel numbers. Drawings stay consistent and adapt to dark mode automatically.
- **An adjustable toolbar.** One `toolbar` prop controls which tools appear, their order, position and extras.
- **A framework-agnostic core.** The React bindings are a separate, opt-in import.

---

## 1. Install and Imports

```bash
npm i leaflet-tual leaflet
```

| Import                    | What you get                                                                          | React needed |
| ------------------------- | ------------------------------------------------------------------------------------- | ------------ |
| `leaflet-tual`            | `createLeafletTual`, `emptyDoc`, `parseDoc`, `createId`, geometry utilities, types     | No           |
| `leaflet-tual/react`      | `<LeafletTual>`, `<Toolbar>`, `useLeafletTual`, plus everything above                 | Yes          |
| `leaflet-tual/styles.css` | The design system (CSS variables and component styles)                                | No           |

---

## 2. Quick Start

```tsx
import { MapContainer, TileLayer } from 'react-leaflet'
import { LeafletTual } from 'leaflet-tual/react'
import 'leaflet/dist/leaflet.css'
import 'leaflet-tual/styles.css'

export function MapView() {
  return (
    <MapContainer center={[41.01, 28.97]} zoom={13} style={{ height: '100vh' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LeafletTual
        theme="system"
        onChange={(doc, { committed }) => committed && saveToServer(doc)}
      />
    </MapContainer>
  )
}
```

---

## 3. Core Rules

1. **Store geography, never pixels.** Every persisted coordinate is a `GeoPoint` (`{ lat, lng }`). Never put screen `{ x, y }` in an item.
2. **Do geometry in world space.** Aspect locks, 45° snapping, circle radii, curve offsets, hit tests and resizing run in a zoom-independent plane (`toWorld` / `fromWorld`), never in current-zoom pixels. Squares stay square and curves keep their shape at every zoom level and latitude.
3. **Use the built-in style values.** Colors are palette names, widths are `'s' | 'm' | 'l'`, text sizes are `'s' | 'm' | 'l' | 'xl'`. Do not store hex colors or pixel sizes in items.
4. **Change the look through `theme` and `tokens`**, not by overriding library internals with CSS selectors.
5. **Change the toolbar through the `toolbar` prop.**
6. **One document, one change callback.** State is a plain JSON `Doc`. Save from `onChange` only when `info.committed` is `true`.
7. **Controlled or uncontrolled, never both.** Pass `value` or `defaultValue`. Undo and redo work in both modes and report through `onChange`.
8. **Mutate through the controller** (`add`, `update`, `remove`). Never edit `doc` or `items` in place.
9. **Modifiers are built in.** `Shift` locks aspect (1:1) and snaps angles to 45°. `Alt` resizes from the center.
10. **Validate untrusted JSON** with `parseDoc(input)` before `load`.
11. **Map context.** Inside `<MapContainer>`, `<LeafletTual>` finds the map itself. Outside it, pass `map={mapInstance}`.
12. **Items inside an artboard move with it.**

---

## 4. Data Model

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
  view?: { center: GeoPoint; zoom: number }
  items: Item[]
}

export type ColorName =
  | 'ink' | 'gray' | 'taupe' | 'red' | 'orange'
  | 'yellow' | 'green' | 'blue' | 'purple' | 'pink'

export interface Style {
  color?: ColorName
  width?: 's' | 'm' | 'l'
  dash?: 'solid' | 'dashed' | 'dotted'
  fill?: 'none' | 'tint' | 'solid'
  size?: 's' | 'm' | 'l' | 'xl'
  weight?: 'regular' | 'bold'
  fontStyle?: 'normal' | 'italic'
  textDecoration?: 'none' | 'underline'
  underline?: boolean
  list?: 'none' | 'bullet'
  bullets?: boolean
  align?: 'left' | 'center' | 'right'
}

export type ArrowKind = 'linear' | 'curved' | 'elbow' | 's-curve'
export type Head = 'triangle' | 'open' | 'none'
export type ShapeKind =
  | 'square' | 'circle' | 'star' | 'actor'
  | 'triangle' | 'diamond' | 'hexagon' | 'marker'
export type LabelPosition = 'top' | 'center' | 'bottom'

export interface ArrowItem {
  id: string
  type: 'arrow'
  kind: ArrowKind
  from: GeoPoint
  to: GeoPoint
  via?: GeoPoint
  heads?: { start?: Head; end?: Head }
  label?: string
  style?: Style
  createdAt: number
}

export interface ShapeItem {
  id: string
  type: 'shape'
  kind: ShapeKind
  from: GeoPoint
  to: GeoPoint
  label?: string
  labelPosition?: LabelPosition   // default 'center'
  style?: Style
  createdAt: number
}

export interface FreedrawItem {
  id: string
  type: 'freedraw'
  points: GeoPoint[]
  style?: Style
  createdAt: number
}

export interface PenPoint {
  at: GeoPoint
  in?: GeoPoint     // incoming bezier control point (absolute geography)
  out?: GeoPoint    // outgoing bezier control point (absolute geography)
}

export interface PenItem {
  id: string
  type: 'pen'
  points: PenPoint[]
  closed?: boolean
  style?: Style
  createdAt: number
}

export interface RulerItem {
  id: string
  type: 'ruler'
  from: GeoPoint
  to: GeoPoint
  unit?: 'metric' | 'imperial'
  label?: string
  style?: Style
  createdAt: number
}

export interface NoteItem {
  id: string
  type: 'note'
  at: GeoPoint
  title?: string
  text: string
  collapsed?: boolean
  style?: Style
  createdAt: number
}

export interface TextItem {
  id: string
  type: 'text'
  at: GeoPoint
  text: string
  style?: Style
  createdAt: number
}

export interface ArtboardItem {
  id: string
  type: 'artboard'
  from: GeoPoint
  to: GeoPoint
  title: string
  style?: Style
  createdAt: number
}

export type Item =
  | ArrowItem | ShapeItem | FreedrawItem | PenItem | RulerItem
  | NoteItem | TextItem | ArtboardItem
```

---

## 5. Toolbar

Default layout, one floating row:

`[Page ▾] │ Select · Text · Note · Draw ▾ · Arrow ▾ · Shapes ▾ · Ruler │ Undo · Redo`

The **Draw ▾** popover contains **Free draw** (smooth freehand) and **Pen** (bezier anchors with draggable curve handles).

```tsx
<LeafletTual
  toolbar={{
    position: 'top-left',
    tools: ['select', 'freedraw', 'pen', 'arrow', 'shape', 'note'],
    pages: true,
    history: true,
  }}
/>
```

---

## 6. Controller: `useLeafletTual(options?)`

```ts
const tual = useLeafletTual({
  defaultValue,
  value,
  onChange,
  readOnly: false,
  tool: 'select',
})
```

### State
- `doc`: Full document.
- `items`: Items on active page.
- `tool`: Active tool (`'select' | 'text' | 'note' | 'freedraw' | 'pen' | 'arrow' | 'shape' | 'ruler'`).
- `variant`: Active variant (`'linear' | 'curved' | 'star' | ...`).
- `style`: Current drawing defaults.
- `selection`: Selected item ids.
- `selected`: Selected items.
- `scheme`: Resolved color scheme (`'light' | 'dark'`).
- `readOnly`: Boolean.
- `canUndo` / `canRedo`: History status.

### Actions
- `setTool(tool, variant?)`
- `setStyle(patch)` (selection-aware)
- `add(item)`
- `update(id, patch)`
- `remove(ids?)`
- `clear()`
- `select(ids)`
- `edit(id)`
- `undo()` / `redo()`
- `fit(target)` ('all', 'selection', artboardId)
- `exportPNG(artboardId, opts?)`
- `load(doc)`
- `setReadOnly(boolean)`
- `pages`: `list`, `active`, `add(name?)`, `rename(id, name)`, `duplicate(id)`, `remove(id)`, `move(id, toIndex)`, `select(id)`

---

## 7. Vanilla JS (No React)

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

tual.setTool('freedraw')
tual.on('select', (items) => console.log(items))

// cleanup
tual.destroy()
```

---

## 8. License

MIT &copy; Yusuf Arslan
