import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, renderHook } from '@testing-library/react'
import { LeafletTual } from '../widgets/LeafletTual/LeafletTual.js'
import { useLeafletTual } from '../features/use-leaflet-tual.js'
import { hitTest } from '../../core/index.js'
import { createMockCanvasContext } from '../../core/__tests__/test-utils.js'
import { createMockMap } from './test-utils.js'
import type { ArrowItem } from '../../entities/index.js'

describe('v2 precise hit-testing for diagonal arrows and shapes', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      createMockCanvasContext() as never,
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('hitTest on diagonal linear arrow returns false at bounding box corners outside stroke', () => {
    const map = createMockMap({
      latLngToContainerPoint: (ll: [number, number]) => {
        // Simple 1:1 projection for testing: lat 0, lng 0 -> (100, 100), lat 1, lng 1 -> (500, 500)
        return { x: 100 + ll[1] * 400, y: 100 + ll[0] * 400 }
      },
    })

    const diagonalArrow: ArrowItem = {
      id: 'arrow-diagonal',
      type: 'arrow',
      kind: 'linear',
      from: { lat: 0, lng: 0 },
      to: { lat: 1, lng: 1 },
      style: { width: 'm' },
      createdAt: 1000,
    }

    // Direct points along the arrow line: (100, 100) -> (500, 500)
    expect(hitTest(diagonalArrow, { x: 300, y: 300 }, 0, map)).toBe(true)
    expect(hitTest(diagonalArrow, { x: 100, y: 100 }, 0, map)).toBe(true)
    expect(hitTest(diagonalArrow, { x: 500, y: 500 }, 0, map)).toBe(true)

    // Points at the bounding box corners: (100, 500) and (500, 100)
    // In old behavior with rectangular/generous thresholds, these corners were mistakenly hit
    expect(hitTest(diagonalArrow, { x: 100, y: 500 }, 0, map)).toBe(false)
    expect(hitTest(diagonalArrow, { x: 500, y: 100 }, 0, map)).toBe(false)
    expect(hitTest(diagonalArrow, { x: 200, y: 400 }, 0, map)).toBe(false)
    expect(hitTest(diagonalArrow, { x: 400, y: 200 }, 0, map)).toBe(false)
  })

  it('double clicking on an arrow targets the intended arrow even if inside another diagonal arrow bounding box', () => {
    const map = createMockMap({
      latLngToContainerPoint: (ll: [number, number]) => {
        return { x: 100 + ll[1] * 400, y: 100 + ll[0] * 400 }
      },
      containerPointToLatLng: (pt: [number, number] | { x: number; y: number }) => {
        const [x, y] = Array.isArray(pt) ? pt : [pt.x, pt.y]
        return { lat: (y - 100) / 400, lng: (x - 100) / 400 }
      },
    })

    const { result } = renderHook(() =>
      useLeafletTual({
        defaultValue: {
          activePageId: 'p1',
          pages: [
            {
              id: 'p1',
              name: 'Page 1',
              items: {
                // Large diagonal arrow from (100, 100) to (500, 500)
                'arrow-main': {
                  id: 'arrow-main',
                  type: 'arrow',
                  kind: 'linear',
                  from: { lat: 0, lng: 0 },
                  to: { lat: 1, lng: 1 },
                  style: { width: 'm' },
                  label: 'Main Route',
                  createdAt: 1000,
                },
                // Second arrow located at (100, 300) to (200, 300) - inside main arrow bounding box
                'arrow-cross': {
                  id: 'arrow-cross',
                  type: 'arrow',
                  kind: 'linear',
                  from: { lat: 0.5, lng: 0 },
                  to: { lat: 0.5, lng: 0.25 },
                  style: { width: 'm' },
                  label: 'Cross Route',
                  createdAt: 2000,
                },
              },
              order: ['arrow-main', 'arrow-cross'],
            },
          ],
        },
      }),
    )

    const { container } = render(
      <LeafletTual map={map} controller={result.current} toolbar={false} />,
    )
    const canvas = container.querySelector('canvas')
    if (!canvas) throw new Error('Canvas missing')

    // Double-click on arrow-cross at (150, 300)
    fireEvent.doubleClick(canvas, { clientX: 150, clientY: 300 })

    // Must select and edit 'arrow-cross', NOT 'arrow-main'
    expect(result.current.selection).toEqual(['arrow-cross'])
    expect(result.current.editingId).toBe('arrow-cross')
  })

  it('allows dragging an already selected item when clicked within its selection bounds', () => {
    const map = createMockMap({
      latLngToContainerPoint: (ll: [number, number]) => {
        return { x: 100 + ll[1] * 400, y: 100 + ll[0] * 400 }
      },
      containerPointToLatLng: (pt: [number, number] | { x: number; y: number }) => {
        const [x, y] = Array.isArray(pt) ? pt : [pt.x, pt.y]
        return { lat: (y - 100) / 400, lng: (x - 100) / 400 }
      },
    })

    const { result } = renderHook(() =>
      useLeafletTual({
        defaultValue: {
          activePageId: 'p1',
          pages: [
            {
              id: 'p1',
              name: 'Page 1',
              items: {
                'shape-1': {
                  id: 'shape-1',
                  type: 'shape',
                  kind: 'square',
                  at: { lat: 0.5, lng: 0.5 },
                  width: 100,
                  height: 100,
                  createdAt: 1000,
                },
              },
              order: ['shape-1'],
            },
          ],
        },
      }),
    )

    const { container } = render(
      <LeafletTual map={map} controller={result.current} toolbar={false} />,
    )
    const canvas = container.querySelector('canvas')
    if (!canvas) throw new Error('Canvas missing')

    // Select shape-1
    act(() => result.current.select('shape-1'))
    expect(result.current.selection).toEqual(['shape-1'])

    // Click inside the selection bounding box of shape-1
    fireEvent.mouseDown(canvas, { clientX: 300, clientY: 300 })
    expect(result.current.selection).toEqual(['shape-1'])
  })
})
