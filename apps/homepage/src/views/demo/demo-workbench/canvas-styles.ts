import type { LeafletTualStyles } from 'leaflet-tual/react'
import { getToolbarStyles } from './toolbar-styles'
import { getModalAndControlStyles } from './modal-styles'
import { getAnnotationCardStyles } from './annotation-styles'

export function getHomepageCanvasStyles(isDark: boolean): LeafletTualStyles {
  return {
    ...getToolbarStyles(isDark),
    ...getModalAndControlStyles(isDark),
    ...getAnnotationCardStyles(isDark),
  } as LeafletTualStyles
}

