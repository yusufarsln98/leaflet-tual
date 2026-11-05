import type { ThemeTokens } from 'leaflet-tual/react'

/**
 * Maps the homepage design system onto leaflet-tual chrome tokens.
 * Values are CSS variable references so the map controls follow the live
 * light/dark app theme without duplicating color values.
 */
export const WORKBENCH_THEME_TOKENS: Partial<ThemeTokens> = {
  surface: 'var(--bg-pane)',
  surfaceActive: 'var(--accent)',
  surfaceMuted: 'var(--bg-app)',
  text: 'var(--text-primary)',
  textMuted: 'var(--text-muted)',
  textActive: 'var(--accent-fg)',
  accent: 'var(--accent)',
  border: 'var(--border-secondary)',
  divider: 'color-mix(in oklab, var(--text-primary) 12%, var(--bg-pane))',
  focus: 'var(--accent)',
  radius: '6px',
  radiusSm: '4px',
  radiusLg: '6px',
  shadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
  shadowPopup: '0 12px 32px -12px rgba(0, 0, 0, 0.35)',
  controlSize: '30px',
  groupGap: '6px',
  iconSize: '16px',
  fontFamily: 'var(--font-sans)',
}
