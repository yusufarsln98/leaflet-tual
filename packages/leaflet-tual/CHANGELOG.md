# leaflet-tual

## 0.1.0

### Minor Changes

- **Initial Public Release of `leaflet-tual`**: A high-performance, framework-agnostic, geographically synchronized annotation and tactical canvas toolkit for Leaflet maps with optional React bindings.

  #### Framework-Agnostic Core & Optional React Bindings

  - **`leaflet-tual` / `leaflet-tual/core`**: Zero-React framework-agnostic core (`createLeafletCanvas`, `createLeafletCanvasController`, `paintLeafletCanvas`, `bindLeafletSync`) usable in Vanilla JS, TypeScript, Vue, Svelte, or Angular.
  - **`leaflet-tual/react`**: First-class React components (`<LeafletCanvas>`, `<CanvasToolbar>`) and hooks (`useLeafletCanvas`, `useLeafletSync`) shipped on a dedicated subpath so non-React consumers never resolve React peer dependencies.

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
  - **Integrated Label Badges**: Centered label pills with inline editing mode and keyboard `Enter` shortcuts.

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

  - **Decoupled Controller (`createLeafletCanvasController` & `useLeafletCanvas`)**: Manage state in either uncontrolled mode (with built-in 50-step undo/redo history) or controlled mode (`items` + `onItemsChange`).
  - **Flexible Floating Toolbar (`<CanvasToolbar>`)**: Built-in floating toolbar with 8 positioning presets, geometric 16px SVG icons, collapsible trigger, or completely decoupled outside the map container.
  - **Read-Only Mode (`readOnly`)**: Strip edit handles and toolbars for presentation or dashboard embedding while keeping Leaflet map pan, zoom, and click interactions completely unobstructed.
  - **Keyboard Shortcuts**: Built-in hotkeys for tools (`V` Select, `P` Free Draw, `A` Linear Arrow, `C` Curved Arrow, `B` Bi-directional, `E` Elbow, `S` S-Curve, `R` Ruler, `N` Note, `T` Text), `Enter` (edit label), `Escape` (cancel/deselect), and `Delete` / `Backspace` (remove item).

  #### Pure Geometry & GIS Utilities Exported

  - `calculateGeodesicDistance(p1, p2)`: Calculates spherical distance in meters between two geographic coordinates.
  - `formatRealWorldDistance(meters, unit)`: Formats meter distance into human-readable metric (`m`, `km`) or imperial (`ft`, `mi`) strings.
  - `calculateLineDistance(points)`: Calculates cumulative geodesic distance across multi-segment polylines.
  - `geoToScreen(map, point)` & `screenToGeo(map, point)`: Bidirectional conversion between lat/lng and screen container pixels.
  - `constrainToAspectRatio(anchor, target, ratio)`: Constrains bounding boxes to fixed aspect ratios.
  - `constrainAngleTo45Degrees(anchor, target)`: Snaps line angles to 45° increments.
  - `computeDefaultControlGeoPoint(start, end, curvature)`: Computes quadratic Bézier control points perpendicular to midpoints.
  - `distanceToSegment(p, v, w)` & `distanceToQuadraticBezier(p, p0, p1, p2)`: Pure 2D hit-testing algorithms.
