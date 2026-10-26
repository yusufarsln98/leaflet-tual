import type { ReactNode } from 'react'
import type { ArrowKind, DrawKind } from '../../../../core/index.js'

export const ARROW_ICONS: Record<ArrowKind, () => ReactNode> = {
  linear: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" shapeRendering="geometricPrecision">
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  ),
  curved: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" shapeRendering="geometricPrecision">
      <path d="M4 19C4 10 11 5 20 5" />
      <polyline points="15 2 20 5 16 10" />
    </svg>
  ),
  elbow: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" shapeRendering="geometricPrecision">
      <polyline points="4 18 12 18 12 6 20 6" />
      <polyline points="16 2 20 6 16 10" />
    </svg>
  ),
  's-curve': () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" shapeRendering="geometricPrecision">
      <path d="M5 19C9 19 11 15 12 12C13 9 15 9 19 5" />
      <polyline points="13 5 19 5 19 11" />
    </svg>
  ),
}

export const DRAW_ICONS: Record<DrawKind, () => ReactNode> = {
  freedraw: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  ),
  pen: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z" />
      <path d="m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18" />
      <path d="m2.3 2.3 7.286 7.286" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  ),
}
