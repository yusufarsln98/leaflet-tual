import type { ScreenPoint } from '../../../shared/types/index.js'

export interface LaserPoint {
  x: number
  y: number
  time: number
  strokeId?: number
}

export interface LaserState {
  trail: LaserPoint[]
  pointerPos: ScreenPoint | null
  active: boolean
  isDrawing?: boolean
  color?: string
}
