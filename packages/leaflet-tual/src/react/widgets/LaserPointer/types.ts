import type { CSSProperties, PointerEvent } from 'react'
import type L from 'leaflet'
import type { Controller, ScreenPoint } from '../../../core/index.js'
import type { LaserState } from '../../../features/drawing-tools/laser/types.js'

export interface LaserPointerProps {
  controller?: Controller
  map?: L.Map
  active?: boolean
  color?: string
  duration?: number
  className?: string
  style?: CSSProperties
  onPointerDown?: (e: PointerEvent<HTMLCanvasElement>) => void
  onPointerMove?: (e: PointerEvent<HTMLCanvasElement>) => void
  onPointerUp?: (e: PointerEvent<HTMLCanvasElement>) => void
}

export interface UseLaserPointerOptions {
  controller?: Controller
  active?: boolean
  color?: string
  duration?: number
  redraw: () => void
}

export interface UseLaserPointerReturn {
  handleLaserPointerDown: (pt: ScreenPoint) => void
  handleLaserPointerMove: (pt: ScreenPoint) => void
  handleLaserPointerUp: () => void
  handleLaserPointerLeave: () => void
  clearLaser: () => void
  getLaserState: () => LaserState
}
