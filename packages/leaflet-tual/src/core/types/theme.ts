import type { ColorName, Style } from './items.js'

export type Theme = 'light' | 'dark' | 'system'

export interface Scheme {
  surface: string
  surfaceHover: string
  border: string
  text: string
  muted: string
  activeBg: string
  activeFg: string
  shadow: string
  artboardFill: string
  artboardBorder: string
  handle: string
}

export interface Tokens {
  accent: string
  radius: number
  font: string
  light: Partial<Scheme>
  dark: Partial<Scheme>
  palette: Partial<Record<ColorName, { light: string; dark: string }>>
  defaults: Partial<
    Record<'freedraw' | 'pen' | 'arrow' | 'shape' | 'ruler' | 'note' | 'text', Style>
  >
}

export type Part = 'toolbar' | 'popover' | 'note' | 'text' | 'artboard' | 'handle'
