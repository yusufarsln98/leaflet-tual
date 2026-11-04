import { defineConfig, type Options } from 'tsup'

/**
 * Core entry ("." and "./core").
 * Fully framework-agnostic — no React import, so no "use client" banner.
 */
const core: Options = {
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  // First of the two sequential builds — wipes dist exactly once.
  clean: true,
  minify: true,
  external: ['leaflet'],
}

/**
 * React entry ("./react").
 * Bundles the React components and hooks together with the core functions they
 * drive; React peer dependencies stay external and the "use client" banner
 * ships only here. `clean: false` keeps the core output from the build above.
 */
const react: Options = {
  entry: ['src/react.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: false,
  minify: true,
  // No `treeshake`: its Rollup pass runs after esbuild inserts the banner and
  // would strip the "use client" directive from the final output again.
  external: ['react', 'react-dom', 'leaflet', 'react-leaflet'],
  injectStyle: true,
  banner: {
    js: '"use client";',
  },
}

export default defineConfig([core, react])
