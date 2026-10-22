'use client'

import { useMemo } from 'react'
import type { ArrowRenderTheme, LeafletCanvasStyles } from 'leaflet-tual/react'
import { DEFAULT_ARROW_THEME, STROKE_PALETTE } from './arrow-theme'
import { getHomepageCanvasStyles } from './canvas-styles'

export function useCanvasThemeStyles(isDark: boolean) {
  const arrowTheme = useMemo<ArrowRenderTheme>(() => DEFAULT_ARROW_THEME, [])
  const strokeColors = useMemo(() => [...STROKE_PALETTE], [])
  const canvasStyles = useMemo<LeafletCanvasStyles>(
    () => getHomepageCanvasStyles(isDark),
    [isDark],
  )

  return { arrowTheme, strokeColors, canvasStyles }
}

