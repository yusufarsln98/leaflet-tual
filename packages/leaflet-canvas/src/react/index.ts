/**
 * leaflet-canvas/react
 *
 * React bindings on top of the framework-agnostic leaflet-canvas core.
 * Exposes `<LeafletCanvas>`, `<CanvasToolbar>`, `useLeafletCanvas`,
 * `useLeafletSync`, and all overlay components, types, and utilities.
 *
 * Import from the dedicated subpath so non-React consumers never resolve
 * the React peer dependency:
 *
 *     import { LeafletCanvas, useLeafletCanvas } from 'leaflet-canvas/react'
 */

export * from '../core/index.js'
export * from './types/index.js'
export * from './shared/index.js'
export * from './entities/index.js'
export * from './features/index.js'
export * from './widgets/index.js'

