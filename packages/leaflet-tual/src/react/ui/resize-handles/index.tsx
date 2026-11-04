'use client'

import type { ShapeHandleType } from '../../../core/index.js'

const HANDLES: ShapeHandleType[] = ['nw', 'ne', 'se', 'sw', 'n', 's', 'w', 'e']

export interface ResizeHandlesProps {
  classNamePrefix?: string
  onResizeStart: (e: React.PointerEvent<HTMLDivElement>, handle: ShapeHandleType) => void
}

export function ResizeHandles({
  classNamePrefix = 'tual-note-handle',
  onResizeStart,
}: ResizeHandlesProps) {
  return (
    <>
      {HANDLES.map((h) => (
        <div
          key={h}
          className={`${classNamePrefix} ${classNamePrefix}-${h}`}
          onPointerDown={(e) => onResizeStart(e, h)}
        />
      ))}
    </>
  )
}

