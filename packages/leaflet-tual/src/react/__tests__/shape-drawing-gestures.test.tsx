import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, renderHook } from '@testing-library/react'
import { LeafletTual } from '../widgets/LeafletTual/LeafletTual.js'
import { useLeafletTual } from '../features/use-leaflet-tual.js'
import { emptyDoc } from '../../core/index.js'
import { createMockCanvasContext } from '../../core/__tests__/test-utils.js'
import { resizeShapeInWorld } from '../widgets/LeafletTual/use-shape-handles.js'
import { createMockMap } from './test-utils.js'

const SHAPE_LATLNG_UNIT = 10 // mock map: 10 screen px per degree

describe('v2 shape drawing gestures', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      createMockCanvasContext() as never,
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function setup(mapOverrides: Partial<Record<string, unknown>> = {}) {
    const map = createMockMap(mapOverrides)
    const { result } = renderHook(() =>
      useLeafletTual({
        defaultValue: emptyDoc(),
      }),
    )
    const { container } = render(
      <LeafletTual map={map} controller={result.current} toolbar={false} />,
    )
    const canvas = container.querySelector('canvas')
    if (!canvas) throw new Error('Canvas not rendered')
    return { canvas, controller: result.current, map }
  }

  function drag(canvas: HTMLCanvasElement, from: [number, number], to: [number, number]) {
    fireEvent.mouseDown(canvas, { clientX: from[0], clientY: from[1] })
    fireEvent.mouseMove(window, { clientX: to[0], clientY: to[1] })
    fireEvent.mouseUp(window, { clientX: to[0], clientY: to[1] })
  }

  it('creates a default-sized shape when the map is clicked', () => {
    const { canvas, controller } = setup()
    act(() => controller.setTool('shape', 'circle'))

    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 })
    fireEvent.mouseUp(window, { clientX: 100, clientY: 100 })

    expect(controller.items).toHaveLength(1)
    const shape = controller.items[0]
    expect(shape.type).toBe('shape')
    if (shape.type !== 'shape') return
    expect(shape.kind).toBe('circle')
    expect((shape.to.lat - shape.from.lat) * SHAPE_LATLNG_UNIT).toBeCloseTo(96, 6)
    expect((shape.to.lng - shape.from.lng) * SHAPE_LATLNG_UNIT).toBeCloseTo(96, 6)
  })

  it('creates the dragged shape with the selected variant', () => {
    const { canvas, controller } = setup()
    act(() => controller.setTool('shape', 'triangle'))

    drag(canvas, [100, 100], [220, 180])

    expect(controller.items).toHaveLength(1)
    const shape = controller.items[0]
    expect(shape.type).toBe('shape')
    if (shape.type !== 'shape') return
    expect(shape.kind).toBe('triangle')
    expect(shape.from).toEqual({ lat: 10, lng: 10 })
    expect(shape.to).toEqual({ lat: 18, lng: 22 })
  })

  it('uses the release point when the final move event is dropped', () => {
    const { canvas, controller } = setup()
    act(() => controller.setTool('shape', 'star'))

    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 })
    fireEvent.mouseUp(window, { clientX: 300, clientY: 240 })

    const shape = controller.items[0]
    expect(shape?.type).toBe('shape')
    if (shape?.type !== 'shape') return
    expect(shape.kind).toBe('star')
    expect(shape.from).toEqual({ lat: 10, lng: 10 })
    expect(shape.to).toEqual({ lat: 24, lng: 30 })
  })

  it('keeps Leaflet box zoom disabled so Shift can resize items', () => {
    const { controller, map } = setup()
    expect(map.boxZoom?.enabled()).toBe(false)

    act(() => controller.setTool('shape', 'circle'))
    expect(map.boxZoom?.enabled()).toBe(false)

    act(() => controller.setTool('select'))
    expect(map.boxZoom?.enabled()).toBe(false)
  })

  it('does not re-enable map panning on toolbar clicks or while drawing', () => {
    const { canvas, controller, map } = setup()
    act(() => controller.setTool('shape', 'circle'))
    expect(map.dragging?.enabled()).toBe(false)

    // Releasing the mouse after clicking the toolbar must not re-enable panning.
    fireEvent.mouseUp(window, { clientX: 0, clientY: 0 })
    expect(map.dragging?.enabled()).toBe(false)

    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 })
    fireEvent.mouseMove(window, { clientX: 300, clientY: 240 })
    expect(map.dragging?.enabled()).toBe(false)

    fireEvent.mouseUp(window, { clientX: 300, clientY: 240 })
    // Drawing finished, the tool switched back to select, so panning returns.
    expect(map.dragging?.enabled()).toBe(true)
  })

  it('does not leave a zero-sized arrow behind on a simple click', () => {
    const { canvas, controller } = setup()
    act(() => controller.setTool('arrow', 'linear'))

    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 })
    fireEvent.mouseUp(window, { clientX: 100, clientY: 100 })

    expect(controller.items).toHaveLength(0)
  })

  it('resizes from the grabbed edge while keeping the opposite edge anchored', () => {
    const from = { lat: 10, lng: 10 }
    const to = { lat: 20, lng: 20 }

    const expectBounds = (
      result: { from: { lat: number; lng: number }; to: { lat: number; lng: number } },
      expected: { from: { lat: number; lng: number }; to: { lat: number; lng: number } },
    ) => {
      expect(result.from.lat).toBeCloseTo(expected.from.lat, 6)
      expect(result.from.lng).toBeCloseTo(expected.from.lng, 6)
      expect(result.to.lat).toBeCloseTo(expected.to.lat, 6)
      expect(result.to.lng).toBeCloseTo(expected.to.lng, 6)
    }

    // South-east: the south and east edges follow the pointer.
    expectBounds(resizeShapeInWorld(from, to, { lat: 0, lng: 25 }, 'se'), {
      from: { lat: 0, lng: 10 },
      to: { lat: 20, lng: 25 },
    })

    // North-west: the north and west edges follow the pointer.
    expectBounds(resizeShapeInWorld(from, to, { lat: 30, lng: 5 }, 'nw'), {
      from: { lat: 10, lng: 5 },
      to: { lat: 30, lng: 20 },
    })

    // North-east: the north edge must move, not the south edge.
    expectBounds(resizeShapeInWorld(from, to, { lat: 30, lng: 25 }, 'ne'), {
      from: { lat: 10, lng: 10 },
      to: { lat: 30, lng: 25 },
    })
  })

  it('resizes a selected shape from its handle without creating another shape', () => {
    const { canvas, controller } = setup({
      latLngToContainerPoint: ([lat, lng]: [number, number]) => ({ x: lng * 10, y: (100 - lat) * 10 }),
      containerPointToLatLng: ([x, y]: [number, number]) => ({ lat: 100 - y / 10, lng: x / 10 }),
    })

    act(() => {
      const shape = controller.add({
        type: 'shape',
        kind: 'square',
        from: { lat: 10, lng: 10 },
        to: { lat: 20, lng: 20 },
      })
      controller.select(shape.id)
    })

    // The south-east handle sits at the bottom-right of the screen.
    fireEvent.mouseDown(canvas, { clientX: 200, clientY: 900 })
    fireEvent.mouseMove(window, { clientX: 250, clientY: 1000 })
    fireEvent.mouseUp(window, { clientX: 250, clientY: 1000 })

    expect(controller.items).toHaveLength(1)
    const shape = controller.items[0]
    expect(shape.type).toBe('shape')
    if (shape.type !== 'shape') return
    expect(shape.from.lat).toBeCloseTo(0, 6)
    expect(shape.from.lng).toBeCloseTo(10, 6)
    expect(shape.to.lat).toBeCloseTo(20, 6)
    expect(shape.to.lng).toBeCloseTo(25, 6)
  })

  it('prefers a selected handle over the active drawing tool', () => {
    const { canvas, controller } = setup({
      latLngToContainerPoint: ([lat, lng]: [number, number]) => ({ x: lng * 10, y: (100 - lat) * 10 }),
      containerPointToLatLng: ([x, y]: [number, number]) => ({ lat: 100 - y / 10, lng: x / 10 }),
    })

    act(() => {
      const shape = controller.add({
        type: 'shape',
        kind: 'square',
        from: { lat: 10, lng: 10 },
        to: { lat: 20, lng: 20 },
      })
      controller.setTool('shape', 'circle')
      controller.select(shape.id)
    })

    fireEvent.mouseDown(canvas, { clientX: 200, clientY: 900 })
    fireEvent.mouseMove(window, { clientX: 250, clientY: 1000 })
    fireEvent.mouseUp(window, { clientX: 250, clientY: 1000 })

    expect(controller.items).toHaveLength(1)
    const shape = controller.items[0]
    expect(shape.type).toBe('shape')
    if (shape.type !== 'shape') return
    expect(shape.kind).toBe('square')
    expect(shape.from.lat).toBeCloseTo(0, 6)
    expect(shape.to.lng).toBeCloseTo(25, 6)
  })

  it('edits a shape on double click without letting the event bubble to map zoom', () => {
    const { canvas, controller } = setup({
      latLngToContainerPoint: ([lat, lng]: [number, number]) => ({ x: lng * 10, y: lat * 10 }),
      containerPointToLatLng: ([x, y]: [number, number]) => ({ lat: y / 10, lng: x / 10 }),
    })

    let shapeId = ''
    act(() => {
      const shape = controller.add({
        type: 'shape',
        kind: 'square',
        from: { lat: 10, lng: 10 },
        to: { lat: 20, lng: 20 },
      })
      shapeId = shape.id
      controller.select(shape.id)
    })

    const parent = canvas.parentElement
    if (!parent) throw new Error('Canvas parent missing')
    const onParentDoubleClick = vi.fn()
    parent.addEventListener('dblclick', onParentDoubleClick)

    fireEvent.doubleClick(canvas, { clientX: 150, clientY: 150 })

    expect(controller.editingId).toBe(shapeId)
    expect(onParentDoubleClick).not.toHaveBeenCalled()

    parent.removeEventListener('dblclick', onParentDoubleClick)
  })

  it('does not let double clicks on tual UI reach the map zoom handler', () => {
    const { canvas, controller } = setup()

    act(() => {
      const shape = controller.add({
        type: 'shape',
        kind: 'square',
        from: { lat: 10, lng: 10 },
        to: { lat: 20, lng: 20 },
      })
      controller.select(shape.id)
    })

    const container = canvas.parentElement
    const outer = container?.parentElement
    if (!container || !outer) throw new Error('Tual container missing')

    const tooltip = container.querySelector('.tual-secondary-tooltip') as HTMLElement
    expect(tooltip).not.toBeNull()

    const onMapDoubleClick = vi.fn()
    outer.addEventListener('dblclick', onMapDoubleClick)

    // Direct double click on the contextual tooltip.
    fireEvent.doubleClick(tooltip)
    expect(onMapDoubleClick).not.toHaveBeenCalled()

    // Direct double click on an open dropdown.
    fireEvent.click(tooltip.querySelector('[title="Color"]') as HTMLElement)
    const dropdown = container.querySelector('.tual-color-popover') as HTMLElement
    expect(dropdown).not.toBeNull()
    fireEvent.doubleClick(dropdown)
    expect(onMapDoubleClick).not.toHaveBeenCalled()

    // Selecting a dropdown item closes it after the first click; the second
    // click lands on the canvas but still must not zoom the map.
    fireEvent.mouseDown(tooltip)
    fireEvent.doubleClick(canvas, { clientX: 50, clientY: 50 })
    expect(onMapDoubleClick).not.toHaveBeenCalled()

    outer.removeEventListener('dblclick', onMapDoubleClick)
  })

  it('rotates a selected ruler by dragging one of its endpoint handles', () => {
    const { canvas, controller } = setup({
      latLngToContainerPoint: ([lat, lng]: [number, number]) => ({ x: lng * 10, y: lat * 10 }),
      containerPointToLatLng: ([x, y]: [number, number]) => ({ lat: y / 10, lng: x / 10 }),
    })

    act(() => {
      const ruler = controller.add({
        type: 'ruler',
        from: { lat: 10, lng: 10 },
        to: { lat: 20, lng: 20 },
      })
      controller.select(ruler.id)
    })

    fireEvent.mouseDown(canvas, { clientX: 200, clientY: 200 })
    fireEvent.mouseMove(window, { clientX: 250, clientY: 130 })
    fireEvent.mouseUp(window, { clientX: 250, clientY: 130 })

    expect(controller.items).toHaveLength(1)
    const ruler = controller.items[0]
    expect(ruler.type).toBe('ruler')
    if (ruler.type !== 'ruler') return
    expect(ruler.from).toEqual({ lat: 10, lng: 10 })
    expect(ruler.to.lat).toBeCloseTo(13, 6)
    expect(ruler.to.lng).toBeCloseTo(25, 6)
  })
})
