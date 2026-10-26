import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, renderHook } from '@testing-library/react'
import { LeafletTual } from '../widgets/LeafletTual/LeafletTual.js'
import { useLeafletTual } from '../features/use-leaflet-tual.js'
import { emptyDoc } from '../../core/index.js'
import { createMockCanvasContext } from '../../core/__tests__/test-utils.js'
import { createMockMap } from './test-utils.js'

describe('v2 bezier pen tool gestures', () => {
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

  it('places anchors on click and finishes an open path with Enter', () => {
    const { canvas, controller } = setup()
    act(() => controller.setTool('pen'))

    click(canvas, 100, 100)
    click(canvas, 200, 150)
    click(canvas, 300, 250)

    // The draft stays active between clicks.
    expect(controller.items).toHaveLength(0)
    expect(controller.tool).toBe('pen')

    fireEvent.keyDown(window, { key: 'Enter' })

    expect(controller.items).toHaveLength(1)
    const pen = controller.items[0]
    expect(pen.type).toBe('pen')
    if (pen.type !== 'pen') return
    expect(pen.closed).toBe(false)
    expect(pen.points.map((point) => point.at)).toEqual([
      { lat: 10, lng: 10 },
      { lat: 15, lng: 20 },
      { lat: 25, lng: 30 },
    ])
    expect(controller.tool).toBe('select')
  })

  it('creates mirrored bezier handles by dragging from an anchor', () => {
    const { canvas, controller } = setup()
    act(() => controller.setTool('pen'))

    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 })
    fireEvent.mouseMove(window, { clientX: 140, clientY: 100 })
    fireEvent.mouseUp(window, { clientX: 140, clientY: 100 })
    click(canvas, 240, 100)
    fireEvent.keyDown(window, { key: 'Enter' })

    const pen = controller.items[0]
    expect(pen.type).toBe('pen')
    if (pen.type !== 'pen') return

    const first = pen.points[0]
    expect(first.out).toEqual({ lat: 10, lng: 14 })
    expect(first.in).toEqual({ lat: 10, lng: 6 })
  })

  it('closes the path when the first anchor is clicked', () => {
    const { canvas, controller } = setup()
    act(() => controller.setTool('pen'))

    click(canvas, 100, 100)
    click(canvas, 200, 200)
    click(canvas, 100, 100)

    expect(controller.items).toHaveLength(1)
    const pen = controller.items[0]
    expect(pen.type).toBe('pen')
    if (pen.type !== 'pen') return
    expect(pen.closed).toBe(true)
    expect(pen.points).toHaveLength(2)
  })

  it('edits a selected pen by dragging an anchor', () => {
    const { canvas, controller } = setup()

    act(() => {
      const pen = controller.add({
        type: 'pen',
        points: [
          { at: { lat: 10, lng: 10 } },
          { at: { lat: 20, lng: 20 } },
        ],
      })
      controller.select(pen.id)
    })

    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 })
    fireEvent.mouseMove(window, { clientX: 150, clientY: 100 })
    fireEvent.mouseUp(window, { clientX: 150, clientY: 100 })

    const pen = controller.items[0]
    expect(pen.type).toBe('pen')
  })
})
