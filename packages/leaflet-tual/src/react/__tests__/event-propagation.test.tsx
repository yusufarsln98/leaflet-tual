import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react'
import { LeafletTual } from '../widgets/LeafletTual/LeafletTual.js'
import { useLeafletTual } from '../features/use-leaflet-tual.js'
import { emptyDoc } from '../../core/index.js'
import { createMockCanvasContext } from '../../core/__tests__/test-utils.js'
import { createMockMap } from './test-utils.js'

describe('Leaflet-Tual Event Propagation Isolation', () => {
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
    const { container } = render(<LeafletTual map={map} controller={result.current} />)
    const canvas = container.querySelector('canvas.tual-canvas') as HTMLCanvasElement
    if (!canvas) throw new Error('Canvas not found')
    return { canvas, container, controller: result.current, map }
  }

  it('stops contextmenu propagation on Tual shapes so external map context menus do not open', () => {
    const { canvas, container, controller, map } = setup()

    // Simulate an external plugin listening to map contextmenu
    const onMapContextMenu = vi.fn()
    map.on('contextmenu', onMapContextMenu)

    // Add a square shape at (150, 150)
    let shapeId = ''
    act(() => {
      const s = controller.add({
        type: 'shape',
        kind: 'square',
        at: { lat: 15, lng: 15 },
        width: 80,
        height: 80,
      })
      shapeId = s.id
    })

    // Right-click on the shape at (150, 150)
    fireEvent.contextMenu(canvas, { clientX: 150, clientY: 150 })

    // Tual context menu opens
    expect(controller.selection).toEqual([shapeId])
    expect(container.querySelector('.tual-context-menu')).not.toBeNull()

    // Map contextmenu event MUST NOT have been triggered
    expect(onMapContextMenu).not.toHaveBeenCalled()
  })

  it('allows contextmenu propagation on empty canvas so external map context menus can open', () => {
    const { canvas, container, controller, map } = setup()

    const onMapContextMenu = vi.fn()
    map.on('contextmenu', onMapContextMenu)

    // Add a shape away from click point
    act(() => {
      controller.add({
        type: 'shape',
        kind: 'square',
        at: { lat: 15, lng: 15 },
        width: 80,
        height: 80,
      })
    })

    // Right-click on empty map at (500, 500)
    const defaultPrevented = !fireEvent.contextMenu(canvas, { clientX: 500, clientY: 500 })

    // Tual context menu must NOT open
    expect(container.querySelector('.tual-context-menu')).toBeNull()

    // Event was NOT prevented, allowing map context menu to open
    expect(defaultPrevented).toBe(false)
  })

  it('stops contextmenu on Toolbar and ContextMenu from leaking to map', () => {
    const { canvas, container, controller, map } = setup()

    const onMapContextMenu = vi.fn()
    map.on('contextmenu', onMapContextMenu)

    // Right-click on toolbar
    const toolbar = container.querySelector('.tual-toolbar') as HTMLElement
    expect(toolbar).not.toBeNull()
    fireEvent.contextMenu(toolbar, { clientX: 50, clientY: 50 })
    expect(onMapContextMenu).not.toHaveBeenCalled()

    // Open context menu
    act(() => {
      const s = controller.add({
        type: 'shape',
        kind: 'square',
        at: { lat: 15, lng: 15 },
        width: 80,
        height: 80,
      })
      controller.select(s.id)
    })
    fireEvent.contextMenu(canvas, { clientX: 150, clientY: 150 })
    const menu = container.querySelector('.tual-context-menu') as HTMLElement
    expect(menu).not.toBeNull()

    // Right-click inside ContextMenu
    fireEvent.contextMenu(menu, { clientX: 160, clientY: 160 })
    expect(onMapContextMenu).not.toHaveBeenCalled()
  })

  it('stops contextmenu propagation from the sidebar so external map context menus do not open', () => {
    const mapHost = document.createElement('div')
    document.body.appendChild(mapHost)
    const onMapContextMenu = vi.fn()
    mapHost.addEventListener('contextmenu', onMapContextMenu)

    const map = createMockMap()
    const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))
    const { container } = render(<LeafletTual map={map} controller={result.current} />, {
      container: mapHost,
    })

    try {
      fireEvent.click(screen.getByTitle('Toggle sidebar'))
      const sidebar = container.querySelector('.tual-sidebar') as HTMLElement
      expect(sidebar).not.toBeNull()

      fireEvent.contextMenu(sidebar, { clientX: 50, clientY: 50 })
      expect(onMapContextMenu).not.toHaveBeenCalled()
    } finally {
      mapHost.remove()
    }
  })

  it('stops contextmenu propagation from sidebar items while opening their context menu', () => {
    const mapHost = document.createElement('div')
    document.body.appendChild(mapHost)
    const onMapContextMenu = vi.fn()
    mapHost.addEventListener('contextmenu', onMapContextMenu)

    const map = createMockMap()
    const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))

    let shapeId = ''
    act(() => {
      const shape = result.current.add({
        type: 'shape',
        kind: 'square',
        at: { lat: 41.05, lng: 28.05 },
        width: 100,
        height: 100,
      })
      shapeId = shape.id
    })

    const { container } = render(<LeafletTual map={map} controller={result.current} />, {
      container: mapHost,
    })

    try {
      fireEvent.click(screen.getByTitle('Toggle sidebar'))
      fireEvent.contextMenu(screen.getByRole('treeitem'), { clientX: 750, clientY: 150 })

      expect(result.current.selection).toEqual([shapeId])
      expect(container.querySelector('.tual-context-menu')).not.toBeNull()
      expect(onMapContextMenu).not.toHaveBeenCalled()
    } finally {
      mapHost.remove()
    }
  })

  it('disables map click when clicking Toolbar buttons', () => {
    const { map } = setup()

    const onMapClick = vi.fn()
    map.on('click', onMapClick)

    const penButton = screen.getByTitle(/Draw/i)
    expect(penButton).toBeDefined()

    // Click the pen button in Toolbar
    fireEvent.click(penButton)

    // Map click MUST NOT be triggered
    expect(onMapClick).not.toHaveBeenCalled()
  })

  it('disables map click when clicking ContextMenu items', () => {
    const { canvas, controller, map } = setup()

    const onMapClick = vi.fn()
    map.on('click', onMapClick)

    act(() => {
      controller.add({
        type: 'shape',
        kind: 'square',
        at: { lat: 15, lng: 15 },
        width: 80,
        height: 80,
      })
    })

    fireEvent.contextMenu(canvas, { clientX: 150, clientY: 150 })
    const duplicateButton = screen.getByText('Duplicate')
    expect(duplicateButton).toBeDefined()

    // Click duplicate
    fireEvent.click(duplicateButton)
    expect(controller.items).toHaveLength(2)

    // Map click MUST NOT be triggered
    expect(onMapClick).not.toHaveBeenCalled()
  })

  it('prevents map click when drawing with pen or shape tool on canvas', () => {
    const { canvas, controller, map } = setup()

    const onMapClick = vi.fn()
    map.on('click', onMapClick)

    // Switch to pen tool
    act(() => controller.setTool('pen'))

    // Click on canvas to draw points
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100, button: 0 })
    fireEvent.mouseUp(canvas, { clientX: 100, clientY: 100, button: 0 })
    fireEvent.click(canvas, { clientX: 100, clientY: 100 })

    // Drawing clicks must not trigger map click
    expect(onMapClick).not.toHaveBeenCalled()
  })

  it('prevents map click when selecting an existing shape on canvas', () => {
    const { canvas, controller, map } = setup()

    const onMapClick = vi.fn()
    map.on('click', onMapClick)

    let sId = ''
    act(() => {
      const s = controller.add({
        type: 'shape',
        kind: 'square',
        at: { lat: 15, lng: 15 },
        width: 80,
        height: 80,
      })
      sId = s.id
    })

    // Click on the shape at (150, 150)
    fireEvent.mouseDown(canvas, { clientX: 150, clientY: 150, button: 0 })
    fireEvent.mouseUp(canvas, { clientX: 150, clientY: 150, button: 0 })
    fireEvent.click(canvas, { clientX: 150, clientY: 150 })

    expect(controller.selection).toEqual([sId])
    // Map click MUST NOT be triggered when selecting an item
    expect(onMapClick).not.toHaveBeenCalled()
  })
})
