'use client'

import { memo, useCallback, useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import type L from 'leaflet'
import { getRelativePoint } from '../../../core/index.js'
import { renderLaserOnCanvas } from '../../../features/drawing-tools/laser/render-laser.js'
import { useLeafletSync } from '../../features/use-leaflet-sync.js'
import { useControllerState } from '../../features/use-controller-state.js'
import { useLaserPointer } from './use-laser-pointer.js'
import type { LaserPointerProps } from './types.js'

const LaserPointerInner = memo(function LaserPointerInner({
  controller,
  map,
  active: activeProp,
  color,
  duration,
  className,
  style,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: LaserPointerProps & { map: L.Map }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const isLaserActive = activeProp !== undefined
    ? activeProp
    : controller
      ? controller.tool === 'laser'
      : true

  const laserRef = useRef<ReturnType<typeof useLaserPointer> | null>(null)

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !map) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = map.getSize()
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
    if (canvas.width !== size.x * dpr || canvas.height !== size.y * dpr) {
      canvas.width = size.x * dpr
      canvas.height = size.y * dpr
      canvas.style.width = `${size.x}px`
      canvas.style.height = `${size.y}px`
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, size.x, size.y)

    const laserState = laserRef.current?.getLaserState()
    if (laserState) {
      renderLaserOnCanvas(ctx, laserState, duration)
    }
  }, [duration, map])

  const laser = useLaserPointer({
    controller,
    active: isLaserActive,
    color,
    duration,
    redraw,
  })
  laserRef.current = laser

  useLeafletSync(map, redraw)
  useControllerState(controller, redraw)

  useEffect(() => {
    redraw()
  }, [redraw, isLaserActive])

  // Global pointer up to catch releases outside the canvas
  useEffect(() => {
    const onWindowPointerUp = () => {
      laser.handleLaserPointerUp()
    }
    window.addEventListener('pointerup', onWindowPointerUp)
    return () => {
      window.removeEventListener('pointerup', onWindowPointerUp)
    }
  }, [laser])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isLaserActive || e.button !== 0) return
      e.preventDefault()
      e.stopPropagation()
      map.dragging?.disable()
      const pt = getRelativePoint(e, e.currentTarget)
      laser.handleLaserPointerDown(pt)
      onPointerDown?.(e)
    },
    [isLaserActive, laser, map, onPointerDown],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isLaserActive) return
      const pt = getRelativePoint(e, e.currentTarget)
      laser.handleLaserPointerMove(pt)
      onPointerMove?.(e)
    },
    [isLaserActive, laser, onPointerMove],
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isLaserActive) return
      laser.handleLaserPointerUp()
      onPointerUp?.(e)
    },
    [isLaserActive, laser, onPointerUp],
  )

  const handlePointerLeave = useCallback(() => {
    if (!isLaserActive) return
    laser.handleLaserPointerLeave()
  }, [isLaserActive, laser])

  const combinedClassName = className
    ? `tual-laser-canvas ${className}`
    : 'tual-laser-canvas'

  return (
    <canvas
      ref={canvasRef}
      className={combinedClassName}
      data-active={isLaserActive ? 'true' : 'false'}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: isLaserActive ? 'auto' : 'none',
        cursor: isLaserActive ? 'none' : 'default',
        zIndex: 660,
        ...style,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    />
  )
})

function LaserPointerWithContext(props: LaserPointerProps) {
  const map = useMap()
  return <LaserPointerInner {...props} map={map} />
}

export const LaserPointer = memo(function LaserPointer(props: LaserPointerProps) {
  if (props.map) {
    return <LaserPointerInner {...props} map={props.map} />
  }
  return <LaserPointerWithContext {...props} />
})

export const Laser = LaserPointer
