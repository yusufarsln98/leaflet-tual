import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react'
import { LeafletTual } from '../widgets/LeafletTual/LeafletTual.js'
import { useLeafletTual } from '../features/use-leaflet-tual.js'
import { emptyDoc } from '../../core/index.js'
import { createMockCanvasContext } from '../../core/__tests__/test-utils.js'
import { createMockMap } from './test-utils.js'

describe('v2 ContextMenu, Shift+drag marquee selection, and z-order', () => {
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
      latLngToContainerPoint: ([lat, lng]: [number, number]) => ({ x: lng * 10, y: lat * 10 }),
      containerPointToLatLng: ([x, y]: [number, number]) => ({ lat: y / 10, lng: x / 10 }),
    })
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
    return { canvas, container, controller: result.current, map }
  }

  it('selects multiple shapes by holding Shift and dragging a marquee box, and suppresses SecondaryTooltip on multi-select', () => {
    const { canvas, container, controller } = setup()

    let s1Id = ''
    let s2Id = ''
    let s3Id = ''
    act(() => {
      const s1 = controller.add({
        type: 'shape',
        kind: 'square',
        at: { lat: 15, lng: 15 }, // screen (150, 150)
        width: 60,
        height: 60,
      })
      const s2 = controller.add({
        type: 'shape',
        kind: 'circle',
        at: { lat: 25, lng: 25 }, // screen (250, 250)
        width: 60,
        height: 60,
      })
      const s3 = controller.add({
        type: 'shape',
        kind: 'star',
        at: { lat: 50, lng: 50 }, // screen (500, 500)
        width: 60,
        height: 60,
      })
      s1Id = s1.id
      s2Id = s2.id
      s3Id = s3.id
    })

    // Selecting 1 shape shows the SecondaryTooltip
    act(() => controller.select(s1Id))
    expect(container.querySelector('.tual-secondary-tooltip')).not.toBeNull()

    // Shift + drag marquee box from (100, 100) to (300, 300) covering s1 and s2 (but not s3)
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100, button: 0, shiftKey: true })
    fireEvent.mouseMove(window, { clientX: 300, clientY: 300, shiftKey: true })
    fireEvent.mouseUp(window, { clientX: 300, clientY: 300, button: 0, shiftKey: true })

    expect(controller.selection).toEqual([s1Id, s2Id])
    expect(controller.selection).not.toContain(s3Id)

    // When multiple shapes are selected, SecondaryTooltip must NOT appear
    expect(container.querySelector('.tual-secondary-tooltip')).toBeNull()
  })

  it('opens multi-selection context menu on right-click to reorder, duplicate, or delete', () => {
    const { canvas, container, controller } = setup()

    let s1Id = ''
    let s2Id = ''
    let s3Id = ''
    act(() => {
      const s1 = controller.add({
        type: 'shape',
        kind: 'square',
        at: { lat: 15, lng: 15 },
        width: 60,
        height: 60,
      })
      const s2 = controller.add({
        type: 'shape',
        kind: 'circle',
        at: { lat: 25, lng: 25 },
        width: 60,
        height: 60,
      })
      const s3 = controller.add({
        type: 'shape',
        kind: 'triangle',
        at: { lat: 40, lng: 40 },
        width: 60,
        height: 60,
      })
      s1Id = s1.id
      s2Id = s2.id
      s3Id = s3.id
      controller.select([s1.id, s2.id])
    })

    // Right-click on one of the selected shapes
    fireEvent.contextMenu(canvas, { clientX: 150, clientY: 150 })

    const menu = container.querySelector('.tual-context-menu')
    expect(menu).not.toBeNull()
    expect(screen.getByText('Duplicate')).toBeDefined()
    expect(screen.getByText('Bring to front')).toBeDefined()
    expect(screen.getByText('Bring forward')).toBeDefined()
    expect(screen.getByText('Send backward')).toBeDefined()
    expect(screen.getByText('Send to back')).toBeDefined()
    expect(screen.getByText('Delete')).toBeDefined()

    // Bring selected shapes to front (above s3)
    fireEvent.click(screen.getByText('Bring to front'))
    expect(controller.items.map((i) => i.id)).toEqual([s3Id, s1Id, s2Id])

    // Duplicate selected shapes
    fireEvent.contextMenu(canvas, { clientX: 150, clientY: 150 })
    fireEvent.click(screen.getByText('Duplicate'))
    expect(controller.items).toHaveLength(5)
  })

  it('opens single-shape context menu on right-click with Edit label, Duplicate, Z-order, Lock, and Delete', () => {
    const { canvas, container, controller } = setup()

    let s1Id = ''
    let s2Id = ''
    act(() => {
      const s1 = controller.add({
        type: 'shape',
        kind: 'square',
        at: { lat: 15, lng: 15 },
        width: 80,
        height: 80,
        label: 'Box 1',
      })
      const s2 = controller.add({
        type: 'shape',
        kind: 'circle',
        at: { lat: 30, lng: 30 },
        width: 80,
        height: 80,
      })
      s1Id = s1.id
      s2Id = s2.id
    })

    // Right-click directly on unselected s1 -> selects s1 and opens context menu
    fireEvent.contextMenu(canvas, { clientX: 150, clientY: 150 })
    expect(controller.selection).toEqual([s1Id])
    expect(container.querySelector('.tual-context-menu')).not.toBeNull()
    // SecondaryTooltip is hidden while context menu is open
    expect(container.querySelector('.tual-secondary-tooltip')).toBeNull()

    // Single shape extras: Edit label, Duplicate, Bring to front, Send to back, Lock, Delete
    expect(screen.getByText('Edit label')).toBeDefined()
    expect(screen.getByText('Duplicate')).toBeDefined()
    expect(screen.getByText('Bring to front')).toBeDefined()
    expect(screen.getByText('Send to back')).toBeDefined()
    expect(screen.getByText('Lock')).toBeDefined()
    expect(screen.getByText('Delete')).toBeDefined()

    // Click Bring to front -> s1 moves after s2
    fireEvent.click(screen.getByText('Bring to front'))
    expect(controller.items.map((i) => i.id)).toEqual([s2Id, s1Id])

    // Right-click s1 and click Duplicate -> creates a 3rd shape
    fireEvent.contextMenu(canvas, { clientX: 150, clientY: 150 })
    fireEvent.click(screen.getByText('Duplicate'))
    expect(controller.items).toHaveLength(3)

    // Right-click the duplicated shape and Delete it
    const dupeId = controller.selection[0]
    fireEvent.contextMenu(canvas, { clientX: 150, clientY: 150 })
    fireEvent.click(screen.getByText('Delete'))
    expect(controller.items).toHaveLength(2)
    expect(controller.items.find((i) => i.id === dupeId)).toBeUndefined()
  })
})
