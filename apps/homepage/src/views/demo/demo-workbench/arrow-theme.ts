import type { ArrowRenderTheme } from 'leaflet-tual/react'

export const DEFAULT_ARROW_THEME: ArrowRenderTheme = {
  labelBackgroundColor: 'rgba(255, 255, 255, 0.95)',
  labelTextColor: '#0F172A',
  labelFont: '600 11px Inter, system-ui, -apple-system, sans-serif',
  shadowColor: 'rgba(0, 0, 0, 0.25)',
  shadowBlur: 4,
  selectionGlowColor: 'rgba(37, 99, 235, 0.35)',
  endpointHandleColor: '#2563EB',
  controlHandleColor: '#F59E0B',
  handleFillColor: '#FFFFFF',
  handleRadius: 6,
  guideLineColor: 'rgba(37, 99, 235, 0.45)',
}

export const STROKE_PALETTE = [
  '#B6F03C', // Signal Lime (Homepage Accent)
  '#22D3EE', // Cyan
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#A855F7', // Purple
  '#0F172A', // Slate Dark
] as const

