/**
 * leaflet-canvas/react — subpath entry for React components and hooks.
 *
 * Kept as a separate entry point so React peer dependencies are only ever
 * pulled in by consumers who explicitly import `leaflet-canvas/react`.
 * The core (`leaflet-canvas` / `leaflet-canvas/core`) stays framework-agnostic.
 */

export * from './react/index.js'

