---
name: leaflet-tual-api-change-maintenance
description: Checklist and instructions for updating all documentation, contract tests, demo playground, and references across the monorepo after a change to the leaflet-tual library API (props, controller methods, items, hooks, types, utilities, or exports).
---

# Skill: API Change Maintenance

When the **leaflet-tual** library API surface changes — e.g. a prop is added/removed/renamed, a hook signature changes, an item type is modified, a geometry utility function is added, or an export is removed — the entire monorepo must be audited and updated to stay in sync.

---

## 1. Core Architectural Invariants

Before updating any API surface, verify that changes comply with the library's design principles:

1. **Geographic Coordinate Decoupling**: All persistent `Item` elements (`ArrowItem`, `FreedrawItem`, `PenItem`, `ShapeItem`, `RulerItem`, `NoteItem`, `TextItem`) store geographic coordinates (`GeoPoint`: `{ lat, lng }`), NOT screen pixels. Projection to screen coordinates (`geoToScreen` / `screenToGeo`) occurs dynamically at render and interaction time using Leaflet map projection APIs.
2. **Decoupled Controller State**: `createController` / `useLeafletTual` / `createLeafletTual` manages drawing mode, selection, item creation/update/deletion, pages, and undo/redo history stacks. It operates in either controlled mode (`value` + `onChange`) or uncontrolled mode (`defaultValue`).
3. **Pure Function Decomposition**: Coordinate transformations (`src/core/shared/geometry/`), hit-testing (`hitTest`), and canvas rendering (`renderArrowOnCanvas`, `renderShapeOnCanvas`, `renderFreedrawOnCanvas`, `renderPenOnCanvas`, `renderRulerOnCanvas`) are pure, deterministic functions decoupled from React component lifecycles and Leaflet DOM operations.
4. **Module Layering**: The package source separates framework-agnostic core (`src/core/`) and React bindings (`src/react/`):
   - `src/core/types`: Public TypeScript interfaces and type definitions (`Doc`, `Page`, `Item`, `Style`, `Controller`).
   - `src/core/shared`: Geo math, palette, doc validation (`emptyDoc`, `parseDoc`), i18n tokens, drawing helpers.
   - `src/core/entities`: Domain models and canvas renderers for items (`arrow`, `shape`, `freedraw`, `pen`, `ruler`, `item`).
   - `src/core/features`: Core controller state machine (`controller`) and vanilla JS factory (`vanilla`).
   - `src/react/ui`: Reusable React UI primitives (`button`, `color-picker`, `divider`, `dropdown`, `icons`, `input`, `popover`, `resize-handles`, `segmented-control`, `select`).
   - `src/react/features`: React hooks (`use-leaflet-tual`, `use-leaflet-sync`, `use-controller-state`, `i18n`).
   - `src/react/widgets`: Composite UI widgets (`LeafletTual`, `Toolbar`, `SecondaryTooltip`, `Sidebar`).

---

## 2. Public Entrypoints & Runtime Contract Tests

Whenever an export is added, removed, or renamed:

### Files to Update

- **Core entry:** `packages/leaflet-tual/src/index.ts` and `packages/leaflet-tual/src/core/index.ts`
- **React entry:** `packages/leaflet-tual/src/react.ts` and `packages/leaflet-tual/src/react/index.ts`
- **Sub-barrel entries:**
  - `packages/leaflet-tual/src/core/types/index.ts`
  - `packages/leaflet-tual/src/core/shared/index.ts`
  - `packages/leaflet-tual/src/core/entities/index.ts`
  - `packages/leaflet-tual/src/core/features/index.ts`
  - `packages/leaflet-tual/src/react/ui/index.ts`
  - `packages/leaflet-tual/src/react/features/index.ts`
  - `packages/leaflet-tual/src/react/widgets/index.ts`

### Mandatory Contract Tests

**File:** `packages/leaflet-tual/src/react/__tests__/index.test.ts`

This test suite validates core and React exports, UI primitives, geometry utilities, and i18n helpers. **You MUST update and run this test** whenever public types, components, geometry utilities, or exports change:

```bash
npm test
```

---

## 3. Internal Modular Subsystems & Tests

The library is organized into single-responsibility modules:

| Subsystem              | Source Location                                                              | Tests Location                     | Responsibility                                                                    |
| :--------------------- | :--------------------------------------------------------------------------- | :--------------------------------- | :-------------------------------------------------------------------------------- |
| **Arrow Rendering**    | `packages/leaflet-tual/src/core/entities/arrow/render-arrow.ts`              | `annotation-rendering.test.ts`     | Linear, curved, elbow, and s-curve arrow paths & arrowheads                       |
| **Shape Rendering**    | `packages/leaflet-tual/src/core/entities/shape/render-shape.ts`              | `annotation-rendering.test.ts`     | Star, square, circle, actor, triangle, diamond, hexagon, and marker paths        |
| **Freedraw Rendering** | `packages/leaflet-tual/src/core/entities/freedraw/render-freedraw.ts`        | `lifecycle-callbacks.test.tsx`     | Freehand drawing paths and hit-testing                                            |
| **Pen Rendering**      | `packages/leaflet-tual/src/core/entities/pen/render-pen.ts`                  | `pen-tool.test.tsx`                | Cubic Bezier paths, anchor handles, and hit-testing                               |
| **Ruler Rendering**    | `packages/leaflet-tual/src/core/entities/ruler/render-ruler.ts`              | `annotation-rendering.test.ts`     | Geodesic measurement lines and distance pill labels                               |
| **Core Controller**    | `packages/leaflet-tual/src/core/features/controller/create-controller.ts`    | `controller-actions.test.ts`       | Controller state machine, pages, history undo/redo stacks, tool & selection state |
| **LeafletTual**        | `packages/leaflet-tual/src/react/widgets/LeafletTual/LeafletTual.tsx`        | `shape-drawing-gestures.test.tsx`  | Main canvas overlay component, mouse/touch event router, inline editors           |
| **Toolbar**            | `packages/leaflet-tual/src/react/widgets/Toolbar/Toolbar.tsx`                | `toolbar.test.tsx`                 | Floating toolbar with tool groups, page switcher, and variant popovers            |
| **SecondaryTooltip**   | `packages/leaflet-tual/src/react/widgets/SecondaryTooltip/SecondaryTooltip.tsx` | `secondary-tooltip.test.tsx`    | Contextual floating property bar above selected items                             |
| **Sidebar**            | `packages/leaflet-tual/src/react/widgets/Sidebar/Sidebar.tsx`                | `sidebar.test.tsx`                 | Properties inspector and layer tree sidebar                                       |
| **Geo Math**           | `packages/leaflet-tual/src/core/shared/geometry/`                            | `geo.test.ts`                      | Pure coordinate transformations, aspect-ratio locking, angle snapping, distances |

---

## 4. Library Documentation (Canonical Source of Truth)

**File:** `packages/leaflet-tual/README.md` and root `README.md`

Update documentation to reflect any changes:
- Component prop tables (`<LeafletTual>`, `<Toolbar>`)
- Hook and controller options and return interfaces (`useLeafletTual`, `createLeafletTual`)
- Data model types (`Doc`, `Page`, `Item`, `ArrowItem`, `ShapeItem`, `FreedrawItem`, `PenItem`, `RulerItem`, `NoteItem`, `TextItem`, `GeoPoint`)
- Toolbar configuration (`ToolbarOptions`, `ToolbarAction`) and internationalization (`TranslationTokens`, `setDefaultTranslations`)
- Quick Start and code examples

---

## 5. AI Context Standards (SKILL.md & llms.txt)

Documentation is maintained via singleton AI standards:
- **SKILL.md:** `.agents/skills/leaflet-tual/SKILL.md` (mirrored to `apps/homepage/public/SKILL.md`)
- **llms.txt:** `apps/homepage/public/llms.txt`

When an API surface changes, audit and update the type definitions, prop signatures, and code examples in:
1. `.agents/skills/leaflet-tual/SKILL.md` (and copy to `apps/homepage/public/SKILL.md`)
2. `apps/homepage/public/llms.txt`

---

## 6. Interactive Demo Maintenance

**File:** `apps/homepage/src/views/demo/demo-workbench.tsx`

The homepage application contains the live interactive demo workbench:
- If a new tool, shape, or arrow style is added, verify it renders and functions properly in the interactive workbench.
- If toolbar props or customization options are updated, test them in the homepage demo view.

---

## 7. Monorepo Verification Pipeline

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

## 8. Quick Audit Checklist

When changing any API, verify each item:

- [ ] **Implementation**: Added/updated in modular source file (`src/core/` or `src/react/`)
- [ ] **Re-export**: Re-exported through slice barrel (`index.ts`) and root entrypoint (`src/index.ts` / `src/react.ts`)
- [ ] **Contract Test**: `packages/leaflet-tual/src/react/__tests__/index.test.ts` updated and passing
- [ ] **Canonical README**: `packages/leaflet-tual/README.md` and root `README.md` updated
- [ ] **AI SKILL.md**: `.agents/skills/leaflet-tual/SKILL.md` updated and mirrored to `apps/homepage/public/SKILL.md`
- [ ] **AI llms.txt**: `apps/homepage/public/llms.txt` updated
- [ ] **Homepage Demo**: `apps/homepage` demo workbench updated and tested
- [ ] **Full Build**: `npm test`, `npm run typecheck`, `npm run build:lib`, and `npm run build:homepage` all pass cleanly
- [ ] **Changeset**: Run `npm run changeset` if preparing for release
