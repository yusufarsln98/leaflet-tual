import { describe, expect, it, vi } from 'vitest'
import type L from 'leaflet'
import { bounds } from '../index.js'
import { fitItemsToBounds } from '../../features/item-crud/fit.js'
import type { Item } from '../../entities/index.js'

const EARTH_RADIUS = 6378137
const WORLD_CIRCUMFERENCE = 2 * Math.PI * EARTH_RADIUS

function lngSpanAtZoom(pixels: number, zoom: number): number {
  const metersPerPixel = WORLD_CIRCUMFERENCE / (256 * 2 ** zoom)
  return ((pixels * metersPerPixel) / EARTH_RADIUS) * (180 / Math.PI)
}

function shape(overrides: Record<string, unknown> = {}): Item {
  return {
    id: 'shape-1',
    type: 'shape',
    kind: 'square',
    at: { lat: 41, lng: 29 },
    width: 100,
    height: 100,
    baseZoom: 13,
    createdAt: 1,
    ...overrides,
  } as Item
}

describe('fit bounds', () => {
  it('gives shapes a geographic size based on their pixel size and base zoom', () => {
    const itemBounds = bounds(shape())

    expect(itemBounds.maxLng - itemBounds.minLng).toBeCloseTo(lngSpanAtZoom(100, 13), 8)
    expect(itemBounds.maxLat).toBeGreaterThan(itemBounds.minLat)
  })

  it('scales the geographic size when the item was created at a lower zoom', () => {
    const itemBounds = bounds(shape({ baseZoom: 8 }))

    expect(itemBounds.maxLng - itemBounds.minLng).toBeCloseTo(lngSpanAtZoom(100, 8), 8)
  })

  it('fits shapes using their rendered size instead of an arbitrary tiny box', () => {
    const fitBounds = vi.fn()
    const stop = vi.fn()
    const map = { stop, fitBounds } as unknown as L.Map
    const item = shape()

    fitItemsToBounds(map, [item])

    expect(stop).toHaveBeenCalledTimes(1)
    expect(fitBounds).toHaveBeenCalledTimes(1)
    const [latLngs, options] = fitBounds.mock.calls[0]
    const [[minLat, minLng], [maxLat, maxLng]] = latLngs

    expect(maxLng - minLng).toBeCloseTo(lngSpanAtZoom(100, 13), 8)
    expect(maxLat).toBeGreaterThan(minLat)
    expect(options).toEqual({ padding: [50, 50], animate: true })
  })

  it('expands flat bounds so horizontal items still fit sensibly', () => {
    const fitBounds = vi.fn()
    const map = { stop: vi.fn(), fitBounds } as unknown as L.Map
    const ruler = {
      id: 'ruler-1',
      type: 'ruler',
      from: { lat: 41, lng: 29 },
      to: { lat: 41, lng: 29.01 },
      createdAt: 1,
    } as Item

    fitItemsToBounds(map, [ruler])

    const [latLngs] = fitBounds.mock.calls[0]
    const [[minLat, minLng], [maxLat, maxLng]] = latLngs
    expect(maxLat - minLat).toBeGreaterThan(0)
    expect(maxLng - minLng).toBeCloseTo(0.01, 8)
  })
})
