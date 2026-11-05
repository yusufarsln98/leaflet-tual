---
'leaflet-tual': major
---

Leaflet-tual v3: a minimal, Leaflet-native chrome and a cleaner annotation experience.

- Rebuilt the toolbar as grouped islands for tools, history and pages, with square icon controls, corner variant menus, and built-in undo/redo/fit/pages. Toolbar orientation now follows its position: top/bottom toolbars are horizontal, left/right toolbars are vertical, and every edge supports start, center and end alignment.
- Replaced the old `theme` prop and `controller.setTheme()` with semantic `themeTokens` (`surface`, `text`, `accent`, `border`, `radius`, `controlSize`, `groupGap`, etc.). Hover, focus and disabled states derive from tokens, scoped themes cascade into every chrome layer, and the stylesheet now uses tokens directly without fallbacks.
- Unified popovers, menus, selects, inputs and the context menu on the same compact, token-driven Leaflet container styling.
- Removed the sidebar widget, `ZoomBar`, the `'s-curve'` arrow kind, `Collapsible`, `ColorPaletteGrid`, idle helpers and unused translation tokens/exports. Documents containing `kind: 's-curve'` no longer validate; use `kind: 'curved'` instead.
- Exported the reusable chrome controls used by the contextual toolbar, including `ColorDropdown`, `ColorSwatchControls`, `TypographyDropdown`, `TextFormattingControls`, `LabelPositionDropdown` and `useTooltipEvents`.
- Improved annotations: easier note dragging, consistent hover and selection treatments, accurate free draw/pen hit testing, coalesced selection redraws, and a fixed light surface for text editing.
