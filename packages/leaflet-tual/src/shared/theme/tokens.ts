/**
 * Design tokens for leaflet-tual chrome.
 *
 * Tokens describe the floating Leaflet-style controls (toolbar, zoom, history,
 * pages, popovers and the contextual tooltip). Annotation items keep their own
 * fixed palette and are intentionally not affected by these tokens.
 *
 * Applications can pass plain values (`#ffffff`) or CSS variable references
 * (`var(--app-surface)`) so the chrome follows the app theme automatically.
 */

export interface ThemeTokens {
  /** Floating panel background. */
  surface?: string
  /** Active/pressed control background. */
  surfaceActive?: string
  /** Recessed surfaces (read-only fields, subtle panels). */
  surfaceMuted?: string

  /** Primary icon and text color. */
  text?: string
  /** Secondary labels, placeholders and shortcuts. */
  textMuted?: string
  /** Text and icon color on an active surface. */
  textActive?: string

  /** Accent used for focus rings, check marks and selection handles. */
  accent?: string

  /** Outer border of floating controls. */
  border?: string
  /** Internal dividers between adjacent controls. */
  divider?: string
  /** Focus ring color. */
  focus?: string

  /** Corner radius of toolbar islands and compact controls. */
  radius?: string
  /** Corner radius of small internal controls and swatches. */
  radiusSm?: string
  /** Corner radius of menus and popovers. */
  radiusLg?: string

  /** Shadow of floating toolbars and the contextual tooltip. */
  shadow?: string
  /** Shadow of menus and popovers. */
  shadowPopup?: string

  /** Square control size. */
  controlSize?: string
  /** Gap between toolbar islands. */
  groupGap?: string
  /** Icon size inside controls. */
  iconSize?: string

  /** Font family. */
  fontFamily?: string
  /** Base font size. */
  fontSize?: string
  /** Base line height. */
  lineHeight?: string

  /**
   * Escape hatch for app-specific CSS custom properties. Keys must be valid
   * custom property names including the leading `--`.
   */
  variables?: Record<string, string>
}

/**
 * Default Leaflet-compatible chrome tokens. Deliberately plain and neutral so
 * the toolbar reads as a native map control.
 */
export const DEFAULT_THEME_TOKENS: Required<Omit<ThemeTokens, 'variables'>> = {
  surface: '#ffffff',
  surfaceActive: '#e6e6e6',
  surfaceMuted: '#f8f9fa',
  text: '#222222',
  textMuted: '#555555',
  textActive: '#111111',
  accent: '#3388ff',
  border: 'rgba(0, 0, 0, 0.16)',
  divider: 'rgba(0, 0, 0, 0.12)',
  focus: '#3388ff',
  radius: '4px',
  radiusSm: '2px',
  radiusLg: '4px',
  shadow: '0 1px 2px rgba(0, 0, 0, 0.12)',
  shadowPopup: '0 3px 8px rgba(0, 0, 0, 0.12)',
  controlSize: '30px',
  groupGap: '6px',
  iconSize: '16px',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontSize: '13px',
  lineHeight: '1.35',
}

const TOKEN_TO_VARIABLES: Record<Exclude<keyof ThemeTokens, 'variables'>, string[]> = {
  surface: ['--tual-bg', '--tual-surface'],
  surfaceActive: [
    '--tual-bg-active',
    '--tual-active-bg',
    '--tual-surface-active-neutral',
  ],
  surfaceMuted: ['--tual-bg-subtle', '--tual-surface-recessed', '--tual-canvas-bg'],
  text: ['--tual-fg', '--tual-text'],
  textMuted: [
    '--tual-fg-muted',
    '--tual-text-secondary',
    '--tual-text-tertiary',
    '--tual-muted',
  ],
  textActive: ['--tual-fg-active', '--tual-active-fg'],
  accent: ['--tual-accent', '--tual-handle'],
  border: ['--tual-border', '--tual-border-solid', '--tual-toolbar-border'],
  divider: [
    '--tual-border-divider',
    '--tual-border-muted',
    '--tual-border-hover',
    '--tual-divider',
  ],
  focus: ['--tual-focus-color', '--tual-border-focus'],
  radius: [
    '--tual-radius',
    '--tual-radius-toolbar',
    '--tual-radius-tooltip',
    '--tual-radius-popover-compact',
  ],
  radiusSm: [
    '--tual-radius-sm',
    '--tual-radius-row',
    '--tual-radius-btn',
    '--tual-radius-input',
    '--tual-radius-swatch',
    '--tual-radius-track',
  ],
  radiusLg: ['--tual-radius-lg', '--tual-radius-popover'],
  shadow: [
    '--tual-shadow',
    '--tual-shadow-floating',
    '--tual-shadow-tooltip',
    '--tual-shadow-thumb',
  ],
  shadowPopup: [
    '--tual-shadow-popup',
    '--tual-shadow-popover',
    '--tual-shadow-tooltip-dark',
  ],
  controlSize: ['--tual-control-size'],
  groupGap: ['--tual-toolbar-gap'],
  iconSize: ['--tual-icon-size'],
  fontFamily: ['--tual-font'],
  fontSize: ['--tual-font-size'],
  lineHeight: ['--tual-line-height'],
}

/**
 * Converts a ThemeTokens object to CSS custom properties.
 */
export function themeTokensToCssVariables(tokens: Partial<ThemeTokens>): Record<string, string> {
  const vars: Record<string, string> = {}

  for (const [token, value] of Object.entries(tokens)) {
    if (token === 'variables' || typeof value !== 'string') continue
    const names = TOKEN_TO_VARIABLES[token as keyof typeof TOKEN_TO_VARIABLES]
    if (!names) continue
    for (const name of names) vars[name] = value
  }

  if (tokens.variables) {
    for (const [name, value] of Object.entries(tokens.variables)) {
      if (name.startsWith('--')) vars[name] = value
    }
  }

  return vars
}

/** Returns a fresh copy of the default chrome tokens. */
export function getThemeTokens(): Required<Omit<ThemeTokens, 'variables'>> {
  return { ...DEFAULT_THEME_TOKENS }
}

/** Creates a complete token set by overriding defaults. */
export function createTheme(
  overrides: Partial<ThemeTokens> = {},
): Required<Omit<ThemeTokens, 'variables'>> & Pick<ThemeTokens, 'variables'> {
  const theme = {
    ...DEFAULT_THEME_TOKENS,
    ...overrides,
  }

  // Accent drives focus rings by default, so keep them in sync unless the
  // caller supplied an explicit focus color.
  if (overrides.accent !== undefined && overrides.focus === undefined) {
    theme.focus = overrides.accent
  }

  return theme
}

/**
 * Applies custom theme tokens to a DOM element or selector via CSS custom
 * properties. Returns an unapply cleanup function.
 */
export function applyTheme(
  target: HTMLElement | string = ':root',
  tokens: Partial<ThemeTokens>,
): () => void {
  const element =
    typeof target === 'string'
      ? (document.querySelector(target) as HTMLElement | null)
      : target

  if (!element) return () => {}

  const cssVars = themeTokensToCssVariables(tokens)
  const previousValues: Record<string, string> = {}

  for (const [key, value] of Object.entries(cssVars)) {
    previousValues[key] = element.style.getPropertyValue(key)
    element.style.setProperty(key, value)
  }

  return () => {
    for (const [key, prev] of Object.entries(previousValues)) {
      if (prev) {
        element.style.setProperty(key, prev)
      } else {
        element.style.removeProperty(key)
      }
    }
  }
}
