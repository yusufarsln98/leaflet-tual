---
'leaflet-tual': patch
---

Fix page switching so the controller immediately exposes the selected page's items. The canvas and overlays previously kept rendering the previous page until the next committed edit updated the store.
