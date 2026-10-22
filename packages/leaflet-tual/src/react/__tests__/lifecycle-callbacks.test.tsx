import React from 'react'
import type L from 'leaflet'
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, act } from '@testing-library/react'
import {
  useLeafletCanvas,
  LeafletCanvas,
  type CanvasItem,
} from '../index.js'
import './test-utils.js'

describe('change completion and edit lifecycle callbacks', () => {
  it('fires onChange / onItemsChange immediately during edits and waits for completion before firing onChangeComplete / onItemsChangeComplete', () => {
    const onChange = vi.fn()
    const onItemsChange = vi.fn()
    const onChangeComplete = vi.fn()
    const onItemsChangeComplete = vi.fn()
    const onEditEnd = vi.fn()
    const onEditComplete = vi.fn()
    const onItemCreate = vi.fn()
    const onItemChange = vi.fn()
    const onItemSelect = vi.fn()

    let controller!: ReturnType<typeof useLeafletCanvas>

    function TestHarness() {
      controller = useLeafletCanvas({
        onChange,
        onItemsChange,
        onChangeComplete,
        onItemsChangeComplete,
        onEditEnd,
        onEditComplete,
        onItemCreate,
        onItemChange,
        onItemSelect,
      })
      return null
    }

    render(React.createElement(TestHarness))

    // 1. Add item
    const newItem: CanvasItem = {
      id: 'shape-1',
      type: 'shape',
      shape: 'square',
      start: { lat: 40.0, lng: 29.0 },
      end: { lat: 40.1, lng: 29.1 },
      color: '#ff0000',
      strokeWidth: 2,
      createdAt: 100,
    }

    act(() => {
      controller.addItem(newItem)
    })

    // Immediate onChange and onItemsChange fired
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onItemsChange).toHaveBeenCalledTimes(1)
    expect(onItemCreate).toHaveBeenCalledWith(newItem)
    expect(controller.selectedId).toBe('shape-1')
    expect(onItemSelect).toHaveBeenCalledWith(newItem)

    // onChangeComplete not fired yet because edit session is still open (item is selected)
    expect(onChangeComplete).not.toHaveBeenCalled()
    expect(onItemsChangeComplete).not.toHaveBeenCalled()

    // 2. Continuous updates (e.g. dragging or changing styling)
    act(() => {
      controller.updateItem('shape-1', { color: '#00ff00' })
    })

    expect(onChange).toHaveBeenCalledTimes(2)
    expect(onItemsChange).toHaveBeenCalledTimes(2)
    expect(onItemChange).toHaveBeenCalled()
    expect(onChangeComplete).not.toHaveBeenCalled()

    // 3. Click outside -> deselect item (setSelectedId(null))
    act(() => {
      controller.setSelectedId(null)
    })

    // Now completion callbacks fire with finalized items
    expect(onChangeComplete).toHaveBeenCalledTimes(1)
    expect(onItemsChangeComplete).toHaveBeenCalledTimes(1)
    expect(onEditEnd).toHaveBeenCalledTimes(1)
    expect(onEditComplete).toHaveBeenCalledTimes(1)
    expect(onChangeComplete.mock.calls[0][0][0].color).toBe('#00ff00')

    // Clicking outside again with no changes does not redundantly fire completion callback
    act(() => {
      controller.setSelectedId(null)
    })
    expect(onChangeComplete).toHaveBeenCalledTimes(1)
  })

  it('supports explicit notifyChangeComplete() for headless and custom workflows', () => {
    const onChangeComplete = vi.fn()
    let controller!: ReturnType<typeof useLeafletCanvas>

    function TestHarness() {
      controller = useLeafletCanvas({
        onChangeComplete,
      })
      return null
    }

    render(React.createElement(TestHarness))

    act(() => {
      controller.addItem({
        id: 'note-1',
        type: 'note',
        position: { lat: 41.0, lng: 28.0 },
        text: 'Draft note',
        backgroundColor: '#fef08a',
        textColor: '#000',
        createdAt: 1,
      })
    })

    expect(onChangeComplete).not.toHaveBeenCalled()

    act(() => {
      controller.notifyChangeComplete()
    })

    expect(onChangeComplete).toHaveBeenCalledTimes(1)
    expect(onChangeComplete.mock.calls[0][0]).toHaveLength(1)
  })

  it('fires completion callbacks on delete and clearAll', () => {
    const onChangeComplete = vi.fn()
    const onItemDelete = vi.fn()
    let controller!: ReturnType<typeof useLeafletCanvas>

    function TestHarness() {
      controller = useLeafletCanvas({
        initialItems: [
          {
            id: 'arrow-1',
            type: 'arrow',
            arrowStyle: 'linear',
            start: { lat: 0, lng: 0 },
            end: { lat: 1, lng: 1 },
            color: '#000',
            strokeWidth: 2,
            createdAt: 1,
          },
        ],
        onChangeComplete,
        onItemDelete,
      })
      return null
    }

    render(React.createElement(TestHarness))

    act(() => {
      controller.deleteItem('arrow-1')
    })

    expect(onItemDelete).toHaveBeenCalledWith('arrow-1')
    expect(onChangeComplete).toHaveBeenCalledTimes(1)
  })

  it('activates select (V) mode and fires onChangeComplete when user draws and clicks outside', () => {
    const onChange = vi.fn()
    const onChangeComplete = vi.fn()
    const onItemsChangeComplete = vi.fn()

    const mapContainer = document.createElement('div')
    document.body.appendChild(mapContainer)

    const mockMap = {
      getContainer: () => mapContainer,
      getSize: () => ({ x: 800, y: 600 }),
      latLngToContainerPoint: () => ({ x: 100, y: 100 }),
      containerPointToLatLng: () => ({ lat: 41.0, lng: 28.0 }),
      layerPointToLatLng: () => ({ lat: 41.0, lng: 28.0 }),
      latLngToLayerPoint: () => ({ x: 100, y: 100 }),
      on: vi.fn(),
      off: vi.fn(),
      dragging: {
        enable: vi.fn(),
        disable: vi.fn(),
        enabled: () => true,
      },
      doubleClickZoom: {
        enable: vi.fn(),
        disable: vi.fn(),
      },
    } as unknown as L.Map

    const origGetContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      arc: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      scale: vi.fn(),
      translate: vi.fn(),
      setTransform: vi.fn(),
      setLineDash: vi.fn(),
    }) as unknown as typeof HTMLCanvasElement.prototype.getContext

    const { unmount } = render(
      React.createElement(LeafletCanvas, {
        map: mockMap,
        onChange,
        onChangeComplete,
        onItemsChangeComplete,
        initialTool: 'freedraw',
      }),
    )

    // Finding drawing surface
    const drawingSurface = mapContainer.querySelector('[data-rlc-drawing-surface]')
    expect(drawingSurface).toBeTruthy()

    // User draws a stroke with freedraw
    act(() => {
      fireEvent.pointerDown(drawingSurface!, { clientX: 50, clientY: 50, button: 0 })
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: 70, clientY: 70 }))
      window.dispatchEvent(new PointerEvent('pointerup', { clientX: 70, clientY: 70 }))
    })

    // Immediate onChange fired on drawing creation
    expect(onChange).toHaveBeenCalled()
    // onChangeComplete has not fired yet because edit session is still open (item is selected in select mode)
    expect(onChangeComplete).not.toHaveBeenCalled()

    // Clicking outside the map container (on window / document body)
    const outsideEl = document.createElement('button')
    document.body.appendChild(outsideEl)
    act(() => {
      outsideEl.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }))
    })

    // Select mode activated and completion callbacks fired properly
    expect(onChangeComplete).toHaveBeenCalledTimes(1)
    expect(onItemsChangeComplete).toHaveBeenCalledTimes(1)
    expect(onChangeComplete.mock.calls[0][0]).toHaveLength(1)
    expect(onChangeComplete.mock.calls[0][0][0].type).toBe('freedraw')

    unmount()
    document.body.removeChild(outsideEl)
    document.body.removeChild(mapContainer)
    HTMLCanvasElement.prototype.getContext = origGetContext
  })
})

describe('completion-driven undo/redo history', () => {
  it('collapses all edits of an interaction into a single undo step recorded on completion', () => {
    const onChangeComplete = vi.fn()
    let controller!: ReturnType<typeof useLeafletCanvas>

    function TestHarness() {
      controller = useLeafletCanvas({ onChangeComplete })
      return null
    }

    render(React.createElement(TestHarness))

    // Draw flow: create + tweak (e.g. drag) while the edit session is open
    act(() => {
      controller.addItem({
        id: 'shape-1',
        type: 'shape',
        shape: 'square',
        start: { lat: 40.0, lng: 29.0 },
        end: { lat: 40.1, lng: 29.1 },
        color: '#ff0000',
        strokeWidth: 2,
        createdAt: 1,
      })
      controller.updateItem('shape-1', { color: '#00ff00' })
    })

    expect(controller.canUndo).toBe(false)
    expect(onChangeComplete).not.toHaveBeenCalled()

    // Completing the interaction records the snapshot
    act(() => {
      controller.setSelectedId(null)
    })

    expect(controller.canUndo).toBe(true)
    expect(controller.canRedo).toBe(false)
    expect(onChangeComplete).toHaveBeenCalledTimes(1)

    // A single undo reverts the whole interaction
    act(() => {
      controller.undo()
    })

    expect(controller.items).toHaveLength(0)
    expect(controller.canUndo).toBe(false)
    expect(controller.canRedo).toBe(true)
    expect(onChangeComplete).toHaveBeenCalledTimes(2)

    act(() => {
      controller.redo()
    })

    expect(controller.items).toHaveLength(1)
    expect((controller.items[0] as { color: string }).color).toBe('#00ff00')
    expect(onChangeComplete).toHaveBeenCalledTimes(3)

    // Undoing again with an empty stack is a no-op
    act(() => {
      controller.undo()
      controller.undo()
    })

    expect(controller.items).toHaveLength(0)
    expect(onChangeComplete).toHaveBeenCalledTimes(4)
  })

  it('coalesces successive updates between completions into one snapshot', () => {
    let controller!: ReturnType<typeof useLeafletCanvas>

    function TestHarness() {
      controller = useLeafletCanvas({
        initialItems: [
          {
            id: 'note-1',
            type: 'note',
            position: { lat: 41.0, lng: 28.0 },
            text: 'Draft',
            backgroundColor: '#fef08a',
            textColor: '#000',
            createdAt: 1,
          },
        ],
      })
      return null
    }

    render(React.createElement(TestHarness))

    act(() => {
      controller.updateItem('note-1', { text: 'Draft v2' })
      controller.updateItem('note-1', { text: 'Draft v3' })
    })

    expect(controller.canUndo).toBe(false)

    act(() => {
      controller.notifyChangeComplete()
    })

    expect(controller.canUndo).toBe(true)

    act(() => {
      controller.undo()
    })

    expect((controller.items[0] as { text: string }).text).toBe('Draft')
    expect(controller.canRedo).toBe(true)
  })

  it('caps the recorded history depth with maxHistory', () => {
    let controller!: ReturnType<typeof useLeafletCanvas>

    function TestHarness() {
      controller = useLeafletCanvas({
        initialItems: [
          {
            id: 'text-1',
            type: 'text',
            position: { lat: 41.0, lng: 28.0 },
            text: 'v0',
            color: '#000',
            initialFontSize: 14,
            createdAt: 1,
          },
        ],
        maxHistory: 2,
      })
      return null
    }

    render(React.createElement(TestHarness))

    const setText = (text: string) => {
      act(() => {
        controller.updateItem('text-1', { text })
        controller.notifyChangeComplete()
      })
    }

    setText('v1')
    setText('v2')
    setText('v3')

    expect(controller.canUndo).toBe(true)

    act(() => {
      controller.undo()
    })
    expect((controller.items[0] as { text: string }).text).toBe('v2')

    // Only one snapshot is retained (maxHistory: 2)
    act(() => {
      controller.undo()
    })
    expect(controller.canUndo).toBe(false)
    expect((controller.items[0] as { text: string }).text).toBe('v2')

    act(() => {
      controller.redo()
      controller.redo()
    })
    expect(controller.canRedo).toBe(false)
    expect((controller.items[0] as { text: string }).text).toBe('v3')
  })
})
