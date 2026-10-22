export const INSTALL_COMMANDS = {
  pnpm: 'pnpm add leaflet-tual',
  npm: 'npm install leaflet-tual',
  bun: 'bun add leaflet-tual',
} as const

export type PackageManager = keyof typeof INSTALL_COMMANDS

export type LayerFilter = 'all' | 'arrows' | 'shapes' | 'notes'

