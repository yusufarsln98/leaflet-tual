import type { ArrowStyle, TualAnnotationTheme } from '../types/index.js'

export const TOOL_TO_ARROW_STYLE: Record<string, ArrowStyle | undefined> = {
  'arrow-linear': 'linear',
  'arrow-curved': 'curved',
  'arrow-bi': 'bi',
  'arrow-elbow': 'elbow',
  'arrow-s-curve': 's-curve',
}

export const STROKE_COLORS = [
  '#000000', // Black (Default)
  '#4b5563', // Slate Gray
  '#2563eb', // Blue
  '#dc2626', // Red
  '#16a34a', // Green
  '#d97706', // Amber
  '#9333ea', // Purple
  '#0891b2', // Cyan
] as const

export interface NoteColorTheme {
  name: string
  bg: string
  border: string
  header: string
  text: string
}

export const NOTE_COLOR_THEMES: readonly NoteColorTheme[] = [
  {
    name: 'Amber',
    bg: '#fef9c3',
    border: '#fde047',
    header: '#fef08a',
    text: '#422006',
  },
  {
    name: 'Sky',
    bg: '#e0f2fe',
    border: '#7dd3fc',
    header: '#bae6fd',
    text: '#0c4a6e',
  },
  {
    name: 'Emerald',
    bg: '#dcfce7',
    border: '#86efac',
    header: '#bbf7d0',
    text: '#064e3b',
  },
  {
    name: 'Rose',
    bg: '#ffe4e6',
    border: '#fda4af',
    header: '#fecdd3',
    text: '#881337',
  },
  {
    name: 'Violet',
    bg: '#f3e8ff',
    border: '#d8b4fe',
    header: '#e9d5ff',
    text: '#3b0764',
  },
  {
    name: 'Dark Slate',
    bg: '#1e293b',
    border: '#334155',
    header: '#0f172a',
    text: '#f8fafc',
  },
  {
    name: 'Midnight',
    bg: '#111827',
    border: '#374151',
    header: '#030712',
    text: '#f9fafb',
  },
] as const

export const DEFAULT_STROKE_COLOR = '#000000'
export const DEFAULT_STROKE_WIDTH = 2
export const DEFAULT_STROKE_WIDTH_OPTIONS: readonly number[] = [
  1, 2, 3, 4, 5, 6, 8, 10, 12,
] as const
export const STROKE_WIDTH_OPTIONS = DEFAULT_STROKE_WIDTH_OPTIONS
export const DEFAULT_NOTE_BG = '#fef9c3'
export const DEFAULT_NOTE_TEXT = '#422006'
export const DEFAULT_FONT_SIZE = 16
export const DEFAULT_FONT_SIZE_OPTIONS: readonly number[] = [
  10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48,
] as const
export const FONT_SIZE_OPTIONS = DEFAULT_FONT_SIZE_OPTIONS

/**
 * Super simple unified annotation default theme matching basic HTML element appearance.
 */
export const DEFAULT_ANNOTATION_THEME: Readonly<TualAnnotationTheme> = {
  selectionGlowColor: 'rgba(0, 0, 0, 0.2)',
  selectionGlowWidth: 6,
  guideLineDash: [4, 4],
  guideLineColor: 'rgba(100, 100, 100, 0.6)',
  guideLineWidth: 1.2,
  endpointHandleColor: '#4f4f4f',
  controlHandleColor: '#4f4f4f',
  handleFillColor: '#ffffff',
  handleRadius: 5,
  handleStrokeWidth: 2,
  shadowColor: 'rgba(0, 0, 0, 0.2)',
  shadowBlur: 3,
  shadowOffsetY: 1.5,
  labelBackgroundColor: '#ffffff',
  labelTextColor: '#000000',
  labelFont: '12px system-ui, -apple-system, sans-serif',
  labelBorderWidth: 1,
  labelBorderRadius: 2,
  labelPaddingX: 6,
  labelPaddingY: 18,
  shapeDefaultFillOpacity: 0.16,
  shapeBorderRadius: 0,
} as const



