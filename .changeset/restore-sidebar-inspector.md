---
'leaflet-tual': minor
---

Restore the optional right-side properties and layers inspector and refresh the toolbar chrome. `sidebar` opens the inspector initially, `onSidebarChange` keeps external state in sync, and the inspector can be toggled from its close button, the toolbar More menu, or the selected item's contextual toolbar. The page switcher moves to the start of the toolbar, shows the active page name with inline rename, and the built-in toolbar is pinned to the top center while the sidebar is open. The toolbar now uses item separators, a muted variant indicator, and clearer disabled states. `Sidebar`, `ToolbarMoreMenu`, `Collapsible` and `PropertyRow` are exported for custom panels.
