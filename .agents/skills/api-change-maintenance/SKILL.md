---
name: leaflet-tual-api-change-maintenance
description: Checklist and instructions for updating all documentation, contract tests, demo playground, and references across the monorepo after a change to the leaflet-tual library API (props, controller methods, items, hooks, types, utilities, or exports).
---

# Skill: API Change Maintenance

When the **leaflet-tual** library API surface changes — e.g. a prop is added/removed/renamed, a hook signature changes, an item type is modified, a geometry utility function is added, or an export is removed — the entire monorepo must be audited and updated to stay in sync.

---

## 1. Core Architectural Invariants

Before updating any API surface, verify that changes comply with the library's design principles:

1. **Geographic Coordinate Decoupling**: All persistent `CanvasItem` elements (`ArrowItem`, `FreeDrawItem`, `ShapeItem`, `NoteItem`, `TextItem`) store geographic coordinates (`GeoPoint`: `{ lat, lng }`), NOT screen pixels. Projection to screen coordinates (`geoToScreen` / `screenToGeo`) occurs dynamically at render and interaction time using Leaflet map projection APIs.
2. **Decoupled Controller State**: `useLeafletCanvas` manages drawing mode, selection, item creation/update/deletion, and undo/redo history stacks. It operates in either controlled mode (`items` + `onItemsChange`) or uncontrolled mode (`initialItems`).
3. **Pure Function Decomposition**: Coordinate transformations (`shared/geo.ts`), hit-testing (`hitTestArrow`, `hitTestShape`, `hitTestFreeDraw`), and canvas rendering (`renderArrowOnCanvas`, `renderShapeOnCanvas`, `renderFreeDrawOnCanvas`) are pure, deterministic functions decoupled from React component lifecycles and Leaflet DOM operations.
4. **FSD Module Layering**: The package source strictly follows Feature-Sliced Design layers:
   - `shared`: Geo math, constants, generic utility helpers.
   - `entities`: Domain models and renderers for items (`arrow`, `shape`, `freedraw`, `note`, `text`).
   - `features`: Interaction hooks (`use-leaflet-tual`, `use-leaflet-sync`).
   - `widgets`: Composite UI components (`LeafletCanvas`, `CanvasToolbar`).
   - `types`: Public TypeScript interfaces and type definitions.

---

## 2. Public Entrypoints & Runtime Contract Tests

Whenever an export is added, removed, or renamed:

### Files to Update

- **Main entry:** `packages/leaflet-tual/src/index.ts`
- **Sub-barrel entries:**
  - `packages/leaflet-tual/src/types/index.ts`
  - `packages/leaflet-tual/src/shared/index.ts`
  - `packages/leaflet-tual/src/entities/index.ts`
  - `packages/leaflet-tual/src/features/index.ts`
  - `packages/leaflet-tual/src/widgets/index.ts`

### Mandatory Contract Tests

**File:** `packages/leaflet-tual/src/__tests__/index.test.ts`

This test suite validates core exports, utility math functions, toolbar interaction harness, aspect-ratio locking, angle snapping, and toolbar labels. **You MUST update and run this test** whenever public types, toolbar buttons, geometry utilities, or exports change:

```bash
npm test -- src/__tests__/index.test.ts
```

---

## 3. Internal Modular Subsystems & Tests

The library is organized into single-responsibility modules:

| Subsystem              | Source Location                                                  | Tests Location                | Responsibility                                                                    |
| :--------------------- | :--------------------------------------------------------------- | :---------------------------- | :-------------------------------------------------------------------------------- |
| **Arrow Rendering**    | `packages/leaflet-tual/src/entities/arrow/render-arrow.ts`| `annotation-rendering.test.ts`| Linear, curved, bi-directional, elbow, and s-curve arrow paths & hit-tests        |
| **Shape Rendering**    | `packages/leaflet-tual/src/entities/shape/render-shape.ts`| `annotation-rendering.test.ts`| Star, square, circle, actor, triangle, diamond, hexagon, and marker paths        |
| **FreeDraw Rendering** | `packages/leaflet-tual/src/entities/freedraw/render-freedraw.ts` | `lifecycle-callbacks.test.tsx`| Freehand drawing paths, hit-testing, and bounding boxes                          |
| **Note Overlay**       | `packages/leaflet-tual/src/entities/note/NoteOverlay.tsx`| `note-overlay.test.tsx`       | Interactive draggable sticky notes with color themes and auto-resize textareas    |
| **Text Overlay**       | `packages/leaflet-tual/src/entities/text/TextOverlay.tsx`| `text-overlay.test.tsx`       | Floating canvas text annotations with inline editing and font styling             |
| **Canvas Controller**  | `packages/leaflet-tual/src/features/use-leaflet-tual.ts`| `readonly.test.tsx`, `lifecycle-callbacks.test.tsx` | Controller state machine, history undo/redo stacks, active tool & selection state |
| **Leaflet Sync**       | `packages/leaflet-tual/src/features/use-leaflet-sync.ts` | `map-interactions.test.ts`    | Leaflet map event bindings (`move`, `zoom`, `resize`, `viewreset`)                |
| **LeafletCanvas**      | `packages/leaflet-tual/src/widgets/LeafletCanvas.tsx`    | `lifecycle-callbacks.test.tsx`, `map-interactions.test.ts` | Main canvas overlay component, mouse/touch event router, drag handles & portals |
| **CanvasToolbar**      | `packages/leaflet-tual/src/widgets/CanvasToolbar.tsx`    | `toolbar.test.tsx`            | Floating/docked toolbar with tool groups, secondary settings bar, and dropdowns   |
| **Geo Math**           | `packages/leaflet-tual/src/shared/geo.ts`                | `geo.test.ts`                 | Pure coordinate transformations, aspect-ratio locking, angle snapping, distances |

---

## 4. Library Documentation (Canonical Source of Truth)

**File:** `packages/leaflet-tual/README.md` and root `README.md`

Update documentation to reflect any changes:
- Component prop tables (`<LeafletCanvas>`, `<CanvasToolbar>`)
- Hook options and return interfaces (`useLeafletCanvas`, `useLeafletSync`)
- Data model types (`CanvasItem`, `ArrowItem`, `ShapeItem`, `NoteItem`, `TextItem`, `GeoPoint`)
- Toolbar customization (`CanvasLabels`, `CanvasIcons`, `LeafletCanvasClassNames`, `LeafletCanvasStyles`)
- Quick Start and code examples

---

## 5. Interactive Demo Maintenance

**File:** `apps/homepage/src/views/demo/demo-workbench.tsx`

The homepage application contains the live interactive demo workbench:
- If a new tool, shape, or arrow style is added, verify it renders and functions properly in the interactive workbench.
- If toolbar props or customization options are updated, test them in the homepage demo view.

---

## 6. Monorepo Verification Pipeline

Always run the full verification pipeline before committing or releasing any API change:

```bash
# 1. Run all unit tests
npm test

# 2. Typecheck library
npm run typecheck

# 3. Build the library (produces ESM, CJS, and DTS bundles)
npm run build:lib

# 4. Build the homepage application
npm run build:homepage
```

---

## 7. Quick Audit Checklist

When changing any API, verify each item:

- [ ] **Implementation**: Added/updated in modular source file (e.g. `src/entities/`, `src/features/`, or `src/widgets/`)
- [ ] **Re-export**: Re-exported through slice barrel (`index.ts`) and root entrypoint (`src/index.ts`)
- [ ] **Contract Test**: `packages/leaflet-tual/src/__tests__/index.test.ts` updated and passing
- [ ] **Canonical README**: `packages/leaflet-tual/README.md` and root `README.md` updated
- [ ] **Homepage Demo**: `apps/homepage` demo workbench updated and tested
- [ ] **Full Build**: `npm test`, `npm run typecheck`, `npm run build:lib`, and `npm run build:homepage` all pass cleanly
- [ ] **Changeset**: Run `npm run changeset` if preparing for release
