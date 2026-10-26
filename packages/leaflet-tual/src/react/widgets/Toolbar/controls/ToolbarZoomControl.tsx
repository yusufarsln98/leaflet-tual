'use client'

import type L from 'leaflet'
import { useTranslation } from '../../../features/i18n/index.js'

export interface ToolbarZoomControlProps {
  map?: L.Map
  zoomPercent: number | null
}

export function ToolbarZoomControl({ map, zoomPercent }: ToolbarZoomControlProps) {
  const { t } = useTranslation()
  if (zoomPercent === null) return null

  return (
    <>
      <div className="tual-separator" />
      <button
        type="button"
        className="tual-btn tual-zoom-pill"
        title={t('zoomReset')}
        style={{
          padding: '0 8px',
          fontSize: 12,
          fontWeight: 500,
          minWidth: 46,
          fontVariantNumeric: 'tabular-nums',
        }}
        onClick={() => {
          map?.setZoom(13)
        }}
      >
        {zoomPercent}%
      </button>
    </>
  )
}
