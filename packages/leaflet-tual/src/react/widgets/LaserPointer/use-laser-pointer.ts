import { useEffect, useRef } from 'react'
import { LASER_LIFETIME_MS } from '../../../features/drawing-tools/laser/render-laser.js'
import { createLaserTracker, type LaserTracker } from '../../../shared/drawing/gestures/laser-tracker.js'
import { DEFAULT_PALETTE } from '../../../shared/theme/index.js'
import type { UseLaserPointerOptions, UseLaserPointerReturn } from './types.js'

export function useLaserPointer({
  controller,
  active: activeProp,
  color: colorProp,
  duration = LASER_LIFETIME_MS,
  redraw,
}: UseLaserPointerOptions): UseLaserPointerReturn {
  const isToolActive =
    activeProp !== undefined
      ? activeProp
      : controller
        ? controller.tool === 'laser'
        : true

  const resolvedColor = colorProp ?? DEFAULT_PALETTE.red
  const redrawRef = useRef(redraw)
  redrawRef.current = redraw

  const trackerRef = useRef<LaserTracker | null>(null)
  if (!trackerRef.current) {
    trackerRef.current = createLaserTracker({
      duration,
      color: resolvedColor,
      active: isToolActive,
      onRedraw: () => redrawRef.current(),
    })
  }

  const tracker = trackerRef.current

  useEffect(() => {
    tracker.setActive(isToolActive)
  }, [isToolActive, tracker])

  useEffect(() => {
    tracker.setColor(resolvedColor)
  }, [resolvedColor, tracker])

  useEffect(() => {
    return () => {
      tracker.destroy()
    }
  }, [tracker])

  return {
    handleLaserPointerDown: (pt) => tracker.handlePointerDown(pt),
    handleLaserPointerMove: (pt) => tracker.handlePointerMove(pt),
    handleLaserPointerUp: () => tracker.handlePointerUp(),
    handleLaserPointerLeave: () => tracker.handlePointerLeave(),
    clearLaser: () => tracker.clear(),
    getLaserState: () => tracker.getState(),
  }
}
