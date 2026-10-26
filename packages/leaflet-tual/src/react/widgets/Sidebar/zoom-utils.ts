export const BASE_ZOOM = 13

export const ZOOM_PRESETS = [25, 50, 100, 200] as const

export function getZoomPercent(zoom: number | undefined): number {
  return zoom !== undefined ? Math.round(Math.pow(2, zoom - BASE_ZOOM) * 100) : 100
}

export function zoomPercentToLevel(percent: number): number {
  return BASE_ZOOM + Math.log2(percent / 100)
}

