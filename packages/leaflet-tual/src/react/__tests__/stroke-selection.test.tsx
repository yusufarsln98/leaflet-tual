import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, renderHook } from '@testing-library/react'
import { LeafletTual } from '../widgets/LeafletTual/LeafletTual.js'
import { useLeafletTual } from '../features/use-leaflet-tual.js'
import { emptyDoc } from '../../core/index.js'
import { createMockCanvasContext } from '../../core/__tests__/test-utils.js'
import { createMockMap } from './test-utils.js'

describe('v3 freedraw and pen selection', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      createMockCanvasContext() as never,
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function setup() {
    const map = createMockMap({
      latLngToContainerPoint: ([lat, lng]: [number, number]) => ({
        x: lng * 10,
        y: lat * 10,
      }),
      containerPointToLatLng: ([x, y]: [number, number]) => ({
        lat: y / 10,
        lng: x / 10,
      }),
    })
    const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))
    const { container } = render(
      <LeafletTual map={map} controller={result.current} toolbar={false} />,
    )
    const canvas = container.querySelector('canvas')
    if (!canvas) throw new Error('Canvas not rendered')
    return { canvas, controller: result.current }
  }

  function click(canvas: HTMLCanvasElement, x: number, y: number) {
    fireEvent.mouseDown(canvas, { clientX: x, clientY: y })
    fireEvent.mouseUp(window, { clientX: x, clientY: y })
  }

  it('selects a freedraw stroke when clicking beside it', () => {
    const { canvas, controller } = setup()

    act(() => {
      controller.add({
        type: 'freedraw',
        points: [
          { lat: 10, lng: 10 },
          { lat: 10, lng: 30 },
        ],
      })
    })

    click(canvas, 200, 104)

    expect(controller.selection).toHaveLength(1)
    expect(controller.selected[0].type).toBe('freedraw')
  })

  it('selects a freedraw stroke on its smoothed curve', () => {
    const { canvas, controller } = setup()

    act(() => {
      controller.add({
        type: 'freedraw',
        points: [
          { lat: 10, lng: 10 },
          { lat: 10, lng: 20 },
          { lat: 20, lng: 20 },
        ],
      })
    })

    // The rendered curve passes through (175, 112.5), away from both raw
    // pointer segments. The hit target must follow the visible stroke.
    click(canvas, 175, 113)

    expect(controller.selection).toHaveLength(1)
    expect(controller.selected[0].type).toBe('freedraw')
  })

  it('selects a pen stroke when clicking beside it', () => {
    const { canvas, controller } = setup()

    act(() => {
      controller.add({
        type: 'pen',
        points: [
          { at: { lat: 10, lng: 10 } },
          {
            at: { lat: 10, lng: 30 },
            in: { lat: 10, lng: 25 },
          },
        ],
      })
    })

    click(canvas, 200, 96)

    expect(controller.selection).toHaveLength(1)
    expect(controller.selected[0].type).toBe('pen')
  })

  it('does not select a freedraw stroke when clicking far away', () => {
    const { canvas, controller } = setup()

    act(() => {
      controller.add({
        type: 'freedraw',
        points: [
          { lat: 10, lng: 10 },
          { lat: 10, lng: 30 },
        ],
      })
    })

    click(canvas, 200, 130)

    expect(controller.selection).toHaveLength(0)
  })
})
