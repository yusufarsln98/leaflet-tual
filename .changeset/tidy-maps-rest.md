---
'leaflet-tual': patch
---

Fix read-only mode swallowing map interactions. The canvas, note and text overlays, and inline label editor are now click-through in read-only, entering read-only cancels active gestures and resets transient tool/edit state, and the laser pointer no longer re-enables map dragging globally while inactive.
