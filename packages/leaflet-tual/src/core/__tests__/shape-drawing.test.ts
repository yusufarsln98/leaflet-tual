import { describe, it, expect } from 'vitest'
import type L from 'leaflet'
import {
  DEFAULT_SHAPE_SIZE_PX,
  resolveShapeDragBounds,
} from '../shared/drawing/shape-drawing.js'
import { toWorld } from '../shared/geometry/coordinates.js'
import type { ScreenPoint } from '../types/index.js'

function createProjectionMap(): L.Map {
  return {
    containerPointToLatLng: ([x, y]: [number, number]) => ({
      lat: y / 10,
      lng: x / 10,
    }),
  } as unknown as L.Map
}

const map = createProjectionMap()

describe('shape drag bounds', () => {
  it('creates a centred default-sized shape when the gesture is a click', () => {
    const start: ScreenPoint = { x: 100, y: 100 }
    const result = resolveShapeDragBounds(map, start, start)

    expect(result.isClick).toBe(true)
    expect(result.from).toEqual({
      lat: (100 - DEFAULT_SHAPE_SIZE_PX / 2) / 10,
      lng: (100 - DEFAULT_SHAPE_SIZE_PX / 2) / 10,
    })
    expect(result.to).toEqual({
      lat: (100 + DEFAULT_SHAPE_SIZE_PX / 2) / 10,
      lng: (100 + DEFAULT_SHAPE_SIZE_PX / 2) / 10,
    })
  })

  it('uses the dragged box when the pointer moves past the click threshold', () => {
    const result = resolveShapeDragBounds(
      map,
      { x: 100, y: 100 },
      { x: 220, y: 180 },
    )

    expect(result.isClick).toBe(false)
    expect(result.from).toEqual({ lat: 10, lng: 10 })
    expect(result.to).toEqual({ lat: 18, lng: 22 })
  })

  it('locks to a square bounding box when shift is held', () => {
    const result = resolveShapeDragBounds(
      map,
      { x: 100, y: 100 },
      { x: 220, y: 180 },
      { shiftKey: true },
    )

    expect(result.isClick).toBe(false)
    const width = Math.abs(toWorld(result.to).x - toWorld(result.from).x)
    const height = Math.abs(toWorld(result.to).y - toWorld(result.from).y)
    expect(width).toBeCloseTo(height, 3)
  })

  it('scales the click-created shape with the current zoom projection', () => {
    const zoomedMap = {
      containerPointToLatLng: ([x, y]: [number, number]) => ({
        lat: y / 20,
        lng: x / 20,
      }),
    } as unknown as L.Map

    const result = resolveShapeDragBounds(zoomedMap, { x: 200, y: 200 }, { x: 200, y: 200 })
    const span = result.to.lat - result.from.lat

    expect(span * 20).toBeCloseTo(DEFAULT_SHAPE_SIZE_PX, 6)
  })
})
