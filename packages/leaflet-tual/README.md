# leaflet-tual

> Opinionated whiteboard-style annotation toolset (pen, arrows, shapes, notes, text, rulers, area, laser pointer, pages) for Leaflet maps.

Draw on a map the way you draw on a design canvas. Everything you place is stored as geographic coordinates (`GeoPoint`: `{ lat, lng }`), keeping annotations attached to the ground while the map pans and zooms.

The design is decided for you:

- **Strict styles.** Colors, sizes and dashes come from fixed sets (`'blue'`, `'m'`, `'dashed'`). There are no free-form hex values or pixel numbers. Drawings stay consistent across maps and applications.
- **An adjustable toolbar.** One `toolbar` prop controls which tools appear, their order, position and extras.
- **An optional inspector.** Set `sidebar` to edit the selected item's style and browse pages, layers and items in a right-side panel.
- **A framework-agnostic core.** The React bindings are a separate, opt-in import.

---

## 1. Install and Imports

```bash
npm i leaflet-tual leaflet
```

| Import                    | What you get                                                                          | React needed |
| ------------------------- | ------------------------------------------------------------------------------------- | ------------ |
| `leaflet-tual`            | `createLeafletTual`, `emptyDoc`, `parseDoc`, `createId`, geometry utilities, types     | No           |
| `leaflet-tual/react`      | `<LeafletTual>`, `<Toolbar>`, `<LaserPointer>`, `useLeafletTual`, plus everything above | Yes          |
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
3. **Use hex colors and explicit sizes.** Colors are hex strings like `#2F6FEB` with a separate `opacity`, widths are `'s' | 'm' | 'l'`, text sizes are `'s' | 'm' | 'l' | 'xl'`.
4. **Change the look through tokens**, not by overriding library internals with CSS selectors.
5. **Every UI word is a translation token.** Provide `translations` or configure default tokens via `setDefaultTranslations`.
6. **Change the toolbar through the `toolbar` prop.**
7. **One document, one change callback.** State is a plain JSON `Doc`. Save from `onChange` only when `info.committed` is `true`.
8. **Controlled or uncontrolled, never both.** Pass `value` or `defaultValue`. Undo and redo work in both modes and report through `onChange`.
9. **Mutate through the controller** (`add`, `update`, `remove`). Never edit `doc` or `items` in place.
10. **Modifiers are built in.** `Shift` locks aspect (1:1) and snaps angles to 45°. `Alt` resizes from the center.
11. **Validate untrusted JSON** with `parseDoc(input)` before `load`.
12. **Map context.** Inside `<MapContainer>`, `<LeafletTual>` finds the map itself. Outside it, pass `map={mapInstance}`.

---

## 4. Data Model

```ts
export type GeoPoint = { lat: number; lng: number }

export interface Doc {
  activePageId: string  // id of the active page
  pages: Page[]
}

export interface Page {
  id: string
  name: string
  view?: { center: GeoPoint; zoom: number }
  items: Record<string, Item>
  order?: string[]
}

export interface Style {
  color?: string
  fillColor?: string
  strokeColor?: string
  textColor?: string
  opacity?: number
  width?: 's' | 'm' | 'l' | number
  dash?: 'solid' | 'dashed' | 'dotted' | 'none'
  size?: 's' | 'm' | 'l' | 'xl'
  weight?: 'regular' | 'bold'
  fontStyle?: 'normal' | 'italic'
  textDecoration?: 'none' | 'underline'
  underline?: boolean
  list?: 'none' | 'bullet'
  bullets?: boolean
  align?: 'left' | 'center' | 'right'
}

export type ArrowKind = 'linear' | 'curved' | 'elbow'
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
  at: GeoPoint
  width: number
  height: number
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

export interface AreaItem {
  id: string
  type: 'area'
  points: GeoPoint[]
  unit?: 'metric' | 'imperial'
  label?: string
  style?: Style
  createdAt: number
}

export interface NoteItem {
  id: string
  type: 'note'
  at: GeoPoint
  width?: number
  height?: number
  title?: string
  text: string
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

export type Item =
  | ArrowItem | ShapeItem | FreedrawItem | PenItem | RulerItem | AreaItem
  | NoteItem | TextItem
```

---

## 5. Toolbar & theming

The toolbar is a stack of Leaflet-style control islands. Each island has a thin border, a small radius and one square control per action. The default order is **Page → Tools → More**.

`[Page name]  [Select · Text · Note · Draw · Arrow · Shapes · Measure · Laser]  [More]`

The page island shows the active page name; double-click it to rename the page inline, or open it to switch, rename, add or delete pages. In vertical toolbars the page control collapses to its icon so the island stays square. Undo, redo, fit-in-view and the sidebar toggle live in the **More** menu at the end of the toolbar.

The position also controls the layout: toolbars anchored to the **top or bottom** edges lay out **horizontally**, while toolbars anchored to the **left or right** edges lay out **vertically**. Every edge supports start, center and end alignment, so the toolbar can sit in any corner or edge center. When the sidebar is open, the built-in toolbar is pinned to the **top center** regardless of the configured position.

Tools with variants show a small corner triangle. Clicking the main icon activates the tool with its last-used variant; clicking the corner triangle opens the variant menu. Item properties are edited from the contextual toolbar, the sidebar inspector or the right-click menu.

```tsx
<LeafletTual
  toolbar={{
    position: 'top-left',       // default; horizontal along the top edge
    tools: ['select', 'freedraw', 'pen', 'arrow', 'shape', 'ruler', 'area', 'laser', 'note'],
    pages: true,
    history: true,
  }}
/>
```

```ts
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

Pass `toolbar={false}` to hide the built-in toolbar. `<Toolbar>` can also be rendered outside the map with the same `controller` and options; it accepts `sidebarOpen` and `onToggleSidebar` when you want the More menu to control an external sidebar.

### Sidebar inspector

Set the `sidebar` prop to open the right-side properties and layers inspector initially. The sidebar toggle in the toolbar's More menu opens and closes it; `onSidebarChange` keeps external state in sync:

```tsx
const [sidebarOpen, setSidebarOpen] = useState(true)

<LeafletTual sidebar={sidebarOpen} onSidebarChange={setSidebarOpen} />
```

The inspector contains the page/layer tree and style controls for the current selection (fill, stroke, opacity, typography and label position). Selecting an item in the tree focuses it on the map, and right-clicking a tree item opens the shared context menu. The **More** button at the end of the selected item's contextual toolbar also opens the inspector. While the sidebar is visible, the contextual toolbar shown above selected items is hidden so properties are edited in one place, and the built-in toolbar stays pinned to the top center. The sidebar is also available as a standalone `<Sidebar controller={tual} map={map} onClose={...} />` component; pass `onClose` only when the host can hide it. In read-only mode the built-in sidebar stays hidden.

### Theme tokens

The chrome (toolbar, sidebar, popovers, menus and contextual tooltip) is themed with `themeTokens`. Annotation items keep their fixed palette and appearance.

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

Token values may be hex colors, `rgb()`/`oklch()` values or CSS variable references, so an app can map leaflet-tual onto its own light/dark theme without duplicating colors.

| Token          | Purpose                                           |
| -------------- | ------------------------------------------------- |
| `surface`      | Floating panel background                         |
| `surfaceActive`| Active/pressed control background                 |
| `surfaceMuted` | Recessed surfaces and read-only fields            |
| `text`         | Primary icons and text                            |
| `textMuted`    | Secondary labels, placeholders and shortcuts      |
| `textActive`   | Icons/text on an active surface                   |
| `accent`       | Focus rings, check marks and selection handles    |
| `border`       | Outer border of floating controls                 |
| `divider`      | Dividers between adjacent controls                |
| `focus`        | Focus ring color                                  |
| `radius`       | Toolbar island and compact control radius         |
| `radiusSm`     | Small internal controls and swatches              |
| `radiusLg`     | Menus and popovers                                |
| `shadow`       | Floating toolbar / contextual tooltip shadow      |
| `shadowPopup`  | Menu and popover shadow                           |
| `controlSize`  | Square control size                               |
| `groupGap`     | Gap between toolbar islands                       |
| `iconSize`     | Icon size inside controls                         |
| `fontFamily`   | Chrome font family                                |
| `fontSize`     | Chrome font size                                  |
| `lineHeight`   | Chrome line height                                |
| `variables`    | Extra CSS custom properties (`--tual-*` or `--app-*`) |

`themeTokens` is also available on `createLeafletTual(map, { themeTokens })` and on an external `<Toolbar themeTokens={...} />`.

### Reusable chrome controls

The controls used by the built-in toolbar, sidebar, popovers and contextual tooltip are exported for custom panels:

- Buttons and inputs: `Button`, `IconButton`, `PillButton`, `SegmentedControl`, `Select`, `SelectField`, `NumberField`, `TextField`, `PropertyRow`, `Collapsible`
- Dropdowns and popovers: `Popover`, `DropdownMenu`, `DropdownItem`, `ConfirmPopover`, `ColorDropdown`, `TypographyDropdown`, `LabelPositionDropdown`, `BorderPopover`, `useOutsideDismiss`, `useWheelGuard`
- Item styling: `ColorSwatch`, `ColorSwatchList`, `ColorSwatchControls`, `CustomColorPicker`, `TextFormattingControls`
- Isolation: `useLeafletDomGuard`, `useLeafletDisableClick`, `disableMapInteractions`, `createLeafletControl`, `createControlContainer`

Import them from `leaflet-tual/react`. Wrap a custom panel with `useLeafletDomGuard()` or give it the `tual-panel` class so Leaflet does not receive its pointer, wheel and context-menu events.

---

## 6. Controller: `useLeafletTual(options?)`

```ts
const tual = useLeafletTual({
  defaultValue,
  value,
  onChange,
  readOnly: false,
  translations: {},
  tool: 'select',
})
```

### State
- `doc`: Full document.
- `items`: Items on active page.
- `tool`: Active tool (`'select' | 'text' | 'note' | 'freedraw' | 'pen' | 'arrow' | 'shape' | 'ruler' | 'area'`).
- `variant`: Active variant of type `ToolVariant | null` (`ArrowKind | ShapeKind | null`).
- `style`: Current drawing defaults.
- `selection`: Selected item ids.
- `selected`: Selected items.
- `readOnly`: Boolean.
- `canUndo` / `canRedo`: History status.
- `translations`: Current resolved `TranslationTokens`.

### Actions
- `setTool(tool, variant?)`
- `setStyle(patch)` (selection-aware)
- `setTranslations(patch)`
- `add(item)`
- `update(id, patch, committed?)`
- `updateMany(patches, committed?)`
- `duplicate(ids?)`
- `reorder(ids, action)` (`'front' | 'back' | 'forward' | 'backward'`)
- `bringToFront(ids?)` / `sendToBack(ids?)` / `bringForward(ids?)` / `sendBackward(ids?)`
- `remove(ids?)`
- `clear()`
- `select(ids)` / `selectAll()`
- `edit(id)`
- `undo()` / `redo()`
- `fit(target)` ('all', 'selection', or item id)
- `load(doc)`
- `setReadOnly(boolean)`
- `pages`: `list`, `active`, `add(name?)`, `rename(id, name)`, `remove(id)`, `move(id, toIndex)`, `select(id)`

---

## 7. Internationalization (i18n)

Every user-facing label, tooltip, placeholder, and unit is driven by clean translation tokens with English defaults.

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

You can also configure default tokens globally or update them dynamically:

```ts
import { setDefaultTranslations } from 'leaflet-tual'

// Configure globally for your entire app
setDefaultTranslations({
  select: 'Choisir',
  delete: 'Supprimer',
})

// Or dynamically on any controller instance
controller.setTranslations({ select: 'Auswählen' })
```

---

## 8. Vanilla JS (No React)

```ts
import L from 'leaflet'
import { createLeafletTual, emptyDoc } from 'leaflet-tual'
import 'leaflet-tual/styles.css'

const map = L.map('map').setView([41.01, 28.97], 13)
const tual = createLeafletTual(map, {
  defaultValue: emptyDoc(),
  onChange: (doc, info) => info.committed && save(doc),
})

tual.setTool('freedraw')
tual.on('select', (items) => console.log(items))

// cleanup
tual.destroy()
```

The vanilla core mounts the canvas only. Render `<Toolbar>` from `leaflet-tual/react` or build your own controls with `setTool` / `setStyle`.

---

## 9. License

MIT &copy; Yusuf Arslan
