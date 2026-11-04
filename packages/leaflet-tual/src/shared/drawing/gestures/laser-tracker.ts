import type { ScreenPoint } from '../../types/index.js'
import type { LaserPoint, LaserState } from '../../../features/drawing-tools/laser/types.js'
import { LASER_LIFETIME_MS } from '../../../features/drawing-tools/laser/render-laser.js'

export interface LaserTrackerOptions {
  duration?: number
  color?: string
  active?: boolean
  onRedraw?: () => void
}

export interface LaserTracker {
  handlePointerDown: (pt: ScreenPoint) => void
  handlePointerMove: (pt: ScreenPoint) => void
  handlePointerUp: () => void
  handlePointerLeave: () => void
  clear: () => void
  getState: () => LaserState
  setActive: (active: boolean) => void
  setColor: (color?: string) => void
  destroy: () => void
}

/**
 * Headless laser pointer engine managing the decay animation loop,
 * stroke tracking, and pointer coordinates. Fully framework-agnostic.
 */
export function createLaserTracker(options: LaserTrackerOptions = {}): LaserTracker {
  const duration = options.duration ?? LASER_LIFETIME_MS
  let active = options.active ?? true
  let color = options.color ?? 'red'
  let trail: LaserPoint[] = []
  let pointerPos: ScreenPoint | null = null
  let isDrawing = false
  let strokeId = 0
  let animFrameId: number | null = null

  function cleanupOldPoints() {
    const now = Date.now()
    trail = trail.filter((pt) => now - pt.time < duration)
  }

  function tick() {
    cleanupOldPoints()
    options.onRedraw?.()

    if (trail.length > 0 || isDrawing) {
      animFrameId = requestAnimationFrame(tick)
    } else {
      animFrameId = null
    }
  }

  function ensureLoop() {
    if (animFrameId === null) {
      animFrameId = requestAnimationFrame(tick)
    }
  }

  function handlePointerDown(pt: ScreenPoint) {
    if (!active) return
    isDrawing = true
    strokeId += 1
    pointerPos = pt
    trail.push({ x: pt.x, y: pt.y, time: Date.now(), strokeId })
    ensureLoop()
  }

  function handlePointerMove(pt: ScreenPoint) {
    if (!active) return
    pointerPos = pt
    if (isDrawing) {
      trail.push({ x: pt.x, y: pt.y, time: Date.now(), strokeId })
      ensureLoop()
    } else {
      options.onRedraw?.()
    }
  }

  function handlePointerUp() {
    isDrawing = false
    ensureLoop()
  }

  function handlePointerLeave() {
    isDrawing = false
    pointerPos = null
    ensureLoop()
  }

  function clear() {
    trail = []
    pointerPos = null
    isDrawing = false
    if (animFrameId !== null) {
      cancelAnimationFrame(animFrameId)
      animFrameId = null
    }
    options.onRedraw?.()
  }

  function getState(): LaserState {
    return {
      trail,
      pointerPos,
      active,
      isDrawing,
      color,
    }
  }

  function setActive(nextActive: boolean) {
    active = nextActive
    if (!active) {
      clear()
    }
  }

  function setColor(nextColor?: string) {
    color = nextColor ?? 'red'
    options.onRedraw?.()
  }

  function destroy() {
    clear()
  }

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerLeave,
    clear,
    getState,
    setActive,
    setColor,
    destroy,
  }
}

