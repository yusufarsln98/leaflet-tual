/**
 * leaflet-tual — core (framework-agnostic)
 *
 * Interactive canvas and annotation toolkit for Leaflet maps — draw vector
 * arrows, geometric shapes, freehand sketches, rulers, sticky notes, and text
 * overlays that stay geographically synchronized with Leaflet across panning
 * and zooming.
 *
 * This module is the entire framework-agnostic public surface. It has zero
 * dependency on React or any UI framework, so it can be used directly from
 * vanilla JavaScript, TypeScript, Vue, Svelte, Angular, or a plain `<script>` tag.
 *
 * React users: see `leaflet-tual/react` for `<LeafletTual>`, `<TualToolbar>`,
 * `useLeafletTual`, and `useLeafletSync`.
 */

import pkg from '../../package.json'

export * from './types/index.js'
export * from './shared/index.js'
export * from './entities/index.js'
export * from './features/index.js'

export const VERSION: string = pkg.version

