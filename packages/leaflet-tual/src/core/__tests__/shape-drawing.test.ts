import { describe, it, expect } from 'vitest'
import type L from 'leaflet'
import {
  DEFAULT_SHAPE_SIZE_PX,
  resolveShapePlacement,
} from '../shared/drawing/shape-drawing.js'
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

describe('shape placement', () => {
  it('creates a centred default-sized shape when the gesture is a click', () => {
    const start: ScreenPoint = { x: 100, y: 100 }
    const result = resolveShapePlacement(map, start, start)

    expect(result.isClick).toBe(true)
    expect(result.at).toEqual({ lat: 10, lng: 10 })
    expect(result.width).toBe(DEFAULT_SHAPE_SIZE_PX)
    expect(result.height).toBe(DEFAULT_SHAPE_SIZE_PX)
  })

  it('uses the dragged box when the pointer moves past the click threshold', () => {
    const result = resolveShapePlacement(
      map,
      { x: 100, y: 100 },
      { x: 220, y: 180 },
    )

    expect(result.isClick).toBe(false)
    expect(result.at).toEqual({ lat: 14, lng: 16 })
    expect(result.width).toBe(120)
    expect(result.height).toBe(80)
  })

  it('locks to a square bounding box when shift is held', () => {
    const result = resolveShapePlacement(
      map,
      { x: 100, y: 100 },
      { x: 220, y: 180 },
      { shiftKey: true },
    )

    expect(result.isClick).toBe(false)
    expect(result.width).toBe(120)
    expect(result.height).toBe(120)
  })

  it('anchors the click-created shape to the current zoom projection', () => {
    const zoomedMap = {
      containerPointToLatLng: ([x, y]: [number, number]) => ({
        lat: y / 20,
        lng: x / 20,
      }),
    } as unknown as L.Map

    const result = resolveShapePlacement(zoomedMap, { x: 200, y: 200 }, { x: 200, y: 200 })

    expect(result.at).toEqual({ lat: 10, lng: 10 })
    expect(result.width).toBe(DEFAULT_SHAPE_SIZE_PX)
    expect(result.height).toBe(DEFAULT_SHAPE_SIZE_PX)
  })

  it('only creates default-sized shape when click is completed (isCompleted !== false)', () => {
    const start: ScreenPoint = { x: 100, y: 100 }

    // When click is completed (default or isCompleted: true)
    const completedResult = resolveShapePlacement(map, start, start, { isCompleted: true })
    expect(completedResult.isClick).toBe(true)
    expect(completedResult.width).toBe(DEFAULT_SHAPE_SIZE_PX)
    expect(completedResult.height).toBe(DEFAULT_SHAPE_SIZE_PX)

    // When click is NOT completed (e.g. mousedown / user may resize)
    const inProgressResult = resolveShapePlacement(map, start, start, { isCompleted: false })
    expect(inProgressResult.isClick).toBe(true)
    expect(inProgressResult.width).toBe(1)
    expect(inProgressResult.height).toBe(1)
  })
})
