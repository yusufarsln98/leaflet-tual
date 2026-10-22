export const INSTALL_COMMANDS = {
  pnpm: 'pnpm add leaflet-canvas',
  npm: 'npm install leaflet-canvas',
  bun: 'bun add leaflet-canvas',
} as const

export type PackageManager = keyof typeof INSTALL_COMMANDS

export type LayerFilter = 'all' | 'arrows' | 'shapes' | 'notes'

