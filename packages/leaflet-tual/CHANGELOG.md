# leaflet-tual

## 2.0.2

### Patch Changes

- **Label Typography & Inline Editor Synchronization**:
  - Synchronized font family between normal canvas label pill rendering and the inline shape/arrow label editor (`InlineShapeLabelEditor`). Canvas text now dynamically resolves the container's computed `fontFamily` (with fallback to default sans-serif font stack), matching the input element's font face and eliminating font face jumping when entering or exiting edit mode.
  - Aligned font sizing (`baseFontSize * scale` without rounding or clamping), font weight, text colors, `line-height: 1`, border radius (3px), and zoom-scaled padding (`paddingX`, `paddingY`) between canvas pills and edit-mode inputs for seamless pixel alignment.

- **Label Opacity Isolation**:
  - Ensured label pills on shapes and canvas annotations never inherit shape fill or stroke opacity (`ctx.globalAlpha = 1`), keeping labels consistently opaque and readable regardless of shape transparency.

- **Color Modal Opacity Synchronization**:
  - Selecting a theme color preset in the secondary tooltip now preserves the current opacity value when switching to the Custom tab.
  - Cleaned up item styles and demo presets to use standard hex colors with numeric opacity properties, removing deprecated RGB string conversions.

- **Shape Shift-Resize Anchor Stability**:
  - Fixed an issue where holding `Shift` to constrain proportions during shape resizing caused the opposite reference anchor to shift away from its starting position. Proportional expansion now firmly anchors to the opposing corner or side.

## 2.0.1

### Patch Changes

- **Event Propagation & UI Isolation**:
  - Implemented `useLeafletDisableClick` and `useLeafletDomGuard` to cleanly isolate Leaflet Tual overlay widgets (Toolbar, ContextMenu, Sidebar, Popovers, Tooltips, and canvas overlays) from underlying Leaflet map listeners and third-party plugins.
  - Right-click (`contextmenu`) on drawn annotations and UI widgets no longer propagates to the Leaflet map container, while right-clicking empty canvas space continues to fall back to map context menu events.
  - Eliminated magic property mutations (`_leaflet_disable_click`) embedded across components.

- **Laser Pointer Interactions**:
  - Panning and zooming are no longer disabled when the laser pointer tool is selected.
  - Restored mouse wheel zooming over the laser pointer canvas.
  - Enabled middle-click drag panning with the mouse wheel while the laser tool is active, restricting laser trail generation to the primary mouse button (`button === 0`).
  - Correctly restored `map.dragging` on pointer up.

- **React 19 Compatibility & Codebase Refactoring**:
  - Replaced deprecated `MutableRefObject<T>` references with React 19's `RefObject<T>`.
  - Reorganized the `gestures/` module into single-responsibility subdirectories (`drafts/`, `handlers/`, `types.ts`, and a lean coordinator `use-canvas-gestures.ts`).
  - Reorganized the `Sidebar/` module into structured subpackages (`components/`, `hooks/`, `sections/`, `utils/`, `types.ts`).
  - Decomposed `LeafletTual.tsx` into dedicated coordinator hooks (`useCanvasScene`, `useContextMenuCoordinator`) and decomposed subcomponents (`LeafletTualOverlays`, `LeafletTualWidgets`).

## 2.0.0

### Major Changes

- **v2 whiteboard redesign**: A complete, breaking rewrite of `leaflet-tual` around a single versioned `Doc`, a multi-page document model, an opinionated design system, and a composable widget layer. The library now ships a pen tool, area measurement, laser pointer, sidebar, context menu, i18n, light/dark theming, and a standalone toolbar.

  #### New Document Model

  - **`Doc` instead of a flat item array**: State is now a plain JSON document with `activePageId` and `pages`. Each `Page` stores items in an O(1) `items` record with an explicit `order` array for z-order.
  - **Multi-page documents**: Add, rename, remove, reorder, and switch pages. Each page remembers its map view (`center` + `zoom`) and switching pages restores it. Undo/redo is global across pages.
  - **Document helpers**: `emptyDoc()`, `parseDoc(input)` for validating untrusted JSON (`DocError` on failure), `createId()`, `getPageItems()`, `cloneDoc()`, and `getItemPreview()`.

  #### New Tools & Interactions

  - **Pen tool (`P`)**: Bézier path drawing with geographic anchors, mirrored in/out control handles, click-first-anchor to close, `Enter`/double-click to finish, and `Escape` to cancel. With the Select tool, drag anchors or handles to reshape a path.
  - **Area measurement (`A`)**: Geodesic polygon area measurement with a rectangle drag mode or vertex-by-vertex polygon drafting. Draggable vertices and metric/imperial formatting (`m²`, `km²`, `sq ft`, `ac`, `sq mi`).
  - **Laser pointer (`K`)**: `<LaserPointer>` renders an ephemeral, fading presentation trail without modifying the document.
  - **Sidebar**: A layer tree plus a properties inspector for selection, fill/stroke, typography, colors, and zoom controls.
  - **Right-click context menu**: Duplicate, reorder (front/back/forward/backward), delete, and open properties from the canvas or sidebar.
  - **Secondary tooltip**: Contextual style controls appear above a single selected item.
  - **Improved selection**: Shift-click, marquee selection, `Alt` resize-from-center, `Shift` aspect lock and 45° angle snapping, arrow-key nudging, and middle-click map panning.

  #### Composable Toolbar

  - **`<Toolbar>` replaces `<TualToolbar>`**: One `toolbar` prop controls position (`8` presets), orientation, tool order, and the page switcher.
  - **Grouped tool popovers**: The Draw popover combines Free draw and Pen; the Measure popover combines Ruler and Area. Each group remembers its last-used tool.
  - **External toolbars**: Render `<Toolbar>` anywhere outside the map with the same controller, or pass `toolbar={false}` to hide the built-in UI entirely.
  - **No UI mode**: `useLeafletTual()` and `createLeafletTual()` work without any toolbar.

  #### Theme & Design System

  - **Strict style tokens**: Colors are palette names (`ink`, `gray`, `taupe`, `red`, `orange`, `yellow`, `green`, `blue`, `purple`, `pink`), widths are `'s' | 'm' | 'l'`, dashes are `'solid' | 'dashed' | 'dotted'`, and text sizes are `'s' | 'm' | 'l' | 'xl'`.
  - **Light/dark/system themes**: `theme` prop and `setTheme()` support `'light'`, `'dark'`, and `'system'`, with live `prefers-color-scheme` tracking. Annotation colors stay palette-stable while chrome adapts.
  - **CSS design system**: New `leaflet-tual/styles.css` entry point built from tokens and component styles (canvas, toolbar, sidebar, popovers, forms, typography, secondary tooltip, color picker). `sideEffects` now preserves CSS imports.
  - **Resolved styles**: `resolveColor`, `resolveWidth`, `resolveSize`, `resolveWeight`, `resolveDash`, `resolveNoteColors`, and `DEFAULT_TOOL_STYLES` are exported for consistent rendering.

  #### Internationalization

  - **Every UI string is a translation token**: Tooltips, placeholders, menus, units, and page names are localized with English defaults.
  - **Three configuration layers**: `translations` prop/option, `controller.setTranslations(patch)`, and global `setDefaultTranslations(patch)` / `resetDefaultTranslations()`.
  - **Localized measurements**: Distance and area units are translation-aware.

  #### Controller & State Management

  - **Zustand-backed controller**: `useLeafletTual()` and `createLeafletTual()` expose reactive state (`doc`, `items`, `tool`, `variant`, `style`, `selection`, `selected`, `theme`, `readOnly`, `canUndo`, `canRedo`, `translations`) plus store subscriptions.
  - **Controlled or uncontrolled**: Pass `value` or `defaultValue`. All edits flow through a single `onChange(doc, info)` callback.
  - **`ChangeInfo`**: Every change reports `reason` (`create`, `update`, `delete`, `reorder`, `page`, `load`, `undo`, `redo`), affected `ids`, a `committed` flag for saving, and optional patches.
  - **Animation-aware gestures**: `onGesture` fires during live gestures without polluting the committed change stream.
  - **Selection-aware `setStyle()`**: Updates selected items when there is a selection, otherwise updates drawing defaults.
  - **Expanded controller API**: `add`, `update`, `updateMany`, `duplicate`, `remove`, `clear`, `select`, `selectAll`, `edit`, `reorder`, `bringToFront`, `sendToBack`, `bringForward`, `sendBackward`, `fit`, `load`, `undo`, `redo`, and `pages.*`.
  - **Events**: `tual.on('change' | 'gesture' | 'select' | 'tool' | 'page' | 'state' | 'translations' | 'theme', handler)` returns an unsubscribe function.

  #### Framework-Agnostic Core & Vanilla API

  - **`LeafletTualCore`**: A reusable core class with `controller`, `mapContext`, `eventBus`, `addTo`/`onAdd`, `onRemove`, and `destroy`.
  - **`createLeafletTual(map, options)`**: Mounts the canvas directly on a Leaflet map and returns the full controller plus `destroy()` and `core`.
  - **Zero React requirement**: The root and `leaflet-tual/core` entries remain fully framework-agnostic; React stays an optional peer behind `leaflet-tual/react`.
  - **React entry re-exports the core**: `leaflet-tual/react` provides the components, hooks, UI primitives, and the complete core surface in one import.

  #### React UI Primitives & Widgets

  - **New widgets**: `<Toolbar>`, `<Sidebar>`, `<ContextMenu>`, `<LaserPointer>`, and `<SecondaryTooltip>`.
  - **Exported UI primitives**: Buttons (`Button`, `IconButton`, `PillButton`, `SegmentedControl`), `Collapsible`, color controls (`ColorPaletteGrid`, `ColorSwatch`, `ColorSwatchList`, `CustomColorPicker`), `Divider`, dropdowns/popovers (`ConfirmPopover`, `DropdownMenu`, `Popover`), inputs (`NumberField`, `PropertyRow`, `TextField`, `SelectField`), and `ResizeHandles`.
  - **New hooks**: `useControllerState`, `useControllerStore`, `useOverlayMapSync`, `useTranslation`, and the gesture/keyboard/theme hooks behind `<LeafletTual>`.

  #### Performance & Rendering

  - **Zoom-independent geometry**: Aspect locks, circles, curve offsets, hit tests, and resizing are computed in a world-space plane so shapes and curves keep their form at every zoom level and latitude.
  - **Viewport-aware canvas rendering**: Off-screen items are culled during drawing.
  - **High-DPI output**: Canvas rendering scales with `devicePixelRatio` for crisp strokes and handles.
  - **Screen-constant UI**: Selection handles and hit targets stay the same size on screen while text scales with zoom.

  #### Breaking Changes

  - **Items are now document pages**: `TualItem[]` is replaced by `Doc` (`{ activePageId, pages }`). Pages contain `items: Record<string, Item>` plus `order: string[]`.
  - **New item schema**: `arrowStyle` → `kind`, `start`/`end` → `from`/`to`, `controlPoint` → `via`, `shape` → `kind`, `position` → `at`, and `headStyle` → `heads`. Visual fields (`color`, `strokeWidth`, `dashed`, `filled`, `backgroundColor`, `textColor`, `fontSize`, …) are replaced by a single `style: Style`.
  - **Callback changes**: `initialItems` → `defaultValue`, controlled `items`/`onItemsChange` → `value`/`onChange`, and `onChange(items)` → `onChange(doc, info)`. Use `info.committed` to decide when to persist.
  - **Controller changes**: `createLeafletTualController` is consolidated into `createLeafletTual` / `useLeafletTual`; `TualTool` → `ToolId`; `setActiveTool` → `setTool`; `addItem`/`updateItem`/`removeItem` → `add`/`update`/`remove`; `clearAll` → `clear`; `selectedId` → `selection`/`selected`; and the individual `activeColor`, `strokeWidth`, `dashed`, `shapeFilled`, and `fontSize` fields → `style` + `setStyle`.
  - **Toolbar changes**: `showToolbar`, `toolbarPosition`, `toolbarOrientation`, `collapsible`, `customTools`, `renderToolbar`, and the per-part `labels`/`icons`/`classNames`/`styles` overrides are replaced by `toolbar: boolean | ToolbarOptions` and `<Toolbar>`.
  - **Removed custom render hooks**: `renderNote`, `renderText`, and the v1 overlay internals are replaced by the built-in React overlays and exported UI primitives.
  - **Explicit stylesheet import**: Consumers must now import `leaflet-tual/styles.css` alongside the library.
  - **Arrow tool variants**: The former separate tools (`arrow-linear`, `arrow-curved`, `arrow-bi`, `arrow-elbow`, `arrow-s-curve`) are now `setTool('arrow', kind)`. The `bi` style is expressed through `heads` rather than a separate arrow kind.

  #### Homepage, Docs & Testing

  - **Homepage updated for v2**: New code samples, feature pillars, map presets, demo workbench, changelog parser, and MDX rendering aligned with the `Doc` model and widget set.
  - **Expanded documentation**: `README.md`, `SKILL.md`, and `llms.txt` rewritten for v2 with the new data model, toolbar, theming, i18n, controller, and geometry utilities.
  - **Expanded test suite**: New coverage for documents, i18n, shape drawing, translation, context menus, laser pointer, number fields, pen gestures, secondary tooltips, shape gestures, sidebar, theming, zoom interactions, and the controller API.
  - **Tile/CSP support**: The homepage allows additional raster basemap hosts and resolves `leaflet-tual/styles.css` from source in development.

## 1.0.0

### Major Changes

- **Initial Stable Release of `leaflet-tual`**: A high-performance, framework-agnostic, geographically synchronized annotation and tactical canvas toolkit for Leaflet maps with optional React bindings.

  #### Framework-Agnostic Core & Optional React Bindings

  - **`leaflet-tual` / `leaflet-tual/core`**: Zero-React framework-agnostic core (`createLeafletTual`, `createLeafletTualController`, `paintLeafletTual`, `bindLeafletSync`) usable in Vanilla JS, TypeScript, Vue, Svelte, or Angular.
  - **`leaflet-tual/react`**: First-class React components (`<LeafletTual>`, `<TualToolbar>`) and hooks (`useLeafletTual`, `useLeafletSync`) shipped on a dedicated subpath so non-React consumers never resolve React peer dependencies.

  #### Geographic Lat/Lng Synchronization

  - **Zero-Drift Geographic Coordinates (`GeoPoint`)**: All annotation items persistently store latitude and longitude (`{ lat, lng }`), eliminating coordinate drift across map zoom, pan, and container resize.
  - **High-DPI Canvas Rendering**: Automatic `devicePixelRatio` scaling ensures crisp vector lines, labels, handles, and shapes across standard and Retina displays.

  #### Real-World Distance Ruler

  - **Dedicated Ruler Tool (`R`)**: Measures real-world geodesic distances across the map using the spherical Haversine formula on the WGS84 ellipsoid.
  - **Perpendicular End-Caps & Live Drag Preview**: Orthogonal T-caps indicate exact measurement endpoints, with real-time distance pill badges updating dynamically while drawing.
  - **Draggable Handles & Metric/Imperial Units**: Interactive start/end handles allow fine-tuning measurements after creation, with automatic unit formatting (`m`, `km`, `ft`, `mi`).

  #### Vector Arrows

  - **5 Vector Arrow Styles**: Linear, curved (quadratic Bézier with draggable midpoint control handle), bi-directional, orthogonal elbow / step, and s-curve.
  - **Customizable Arrowheads & Styling**: Closed triangle, open arrowhead, dual heads, dashed line patterns, custom stroke widths, and color swatches.
  - **Integrated Label Badges**: Centered label pills with inline editing mode activated via double-click.

  #### Geometric Shape Primitives

  - **8 Vector Shapes**: Square, Circle, Triangle, Star, Diamond, Hexagon, Actor (personnel/vessel), and Map Marker.
  - **Proportion Locking**: Hold `Shift` during drawing or dragging to constrain shapes to a 1:1 aspect ratio.
  - **Fill & Stroke Controls**: Configurable outline thickness, dashed stroke modes, solid fill toggling, and fill opacity customization.

  #### Freehand Drawing

  - **Smooth Polyline Sketching**: Real-time freehand paths with Bézier spline curve smoothing.
  - **Full Style Parity**: Supports custom stroke colors, stroke widths, and dashed patterns.

  #### Pinned Sticky Notes & Text Overlays

  - **3-State Note Lifecycle**: Sticky notes support `expanded` (full card with editable title and body), `collapsed` (compact header bar), and `compact` (floating circular/pill badge) states.
  - **Auto-Minimization on Zoom**: Automatically collapses notes into compact badges below configurable map zoom thresholds (`autoMinimizeNotesZoom`).
  - **Floating Text Annotations**: Geographic text overlays with dynamic zoom scaling (`calculateZoomFontSize`), bold styling, and draggable repositioning.

  #### Architecture & State Management

  - **Decoupled Controller (`createLeafletTualController` & `useLeafletTual`)**: Manage state in either uncontrolled mode (with built-in 50-step undo/redo history) or controlled mode (`items` + `onItemsChange`).
  - **Flexible Floating Toolbar (`<CanvasToolbar>`)**: Built-in floating toolbar with 8 positioning presets, geometric 16px SVG icons, collapsible trigger, or completely decoupled outside the map container.
  - **Read-Only Mode (`readOnly`)**: Strip edit handles and toolbars for presentation or dashboard embedding while keeping Leaflet map pan, zoom, and click interactions completely unobstructed.
  - **Keyboard Shortcuts**: Built-in hotkeys for tools (`V` Select, `P` Free Draw, `A` Linear Arrow, `C` Curved Arrow, `B` Bi-directional, `E` Elbow, `S` S-Curve, `R` Ruler, `N` Note, `T` Text), `Escape` (cancel/deselect), and `Delete` / `Backspace` (remove item).

  #### Pure Geometry & GIS Utilities Exported

  - `calculateGeodesicDistance(p1, p2)`: Calculates spherical distance in meters between two geographic coordinates.
  - `formatRealWorldDistance(meters, unit)`: Formats meter distance into human-readable metric (`m`, `km`) or imperial (`ft`, `mi`) strings.
  - `calculateLineDistance(points)`: Calculates cumulative geodesic distance across multi-segment polylines.
  - `geoToScreen(map, point)` & `screenToGeo(map, point)`: Bidirectional conversion between lat/lng and screen container pixels.
  - `constrainToAspectRatio(anchor, target, ratio)`: Constrains bounding boxes to fixed aspect ratios.
  - `constrainAngleTo45Degrees(anchor, target)`: Snaps line angles to 45° increments.
  - `computeDefaultControlGeoPoint(start, end, curvature)`: Computes quadratic Bézier control points perpendicular to midpoints.
  - `distanceToSegment(p, v, w)` & `distanceToQuadraticBezier(p, p0, p1, p2)`: Pure 2D hit-testing algorithms.
