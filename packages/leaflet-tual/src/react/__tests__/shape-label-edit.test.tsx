import type L from 'leaflet'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, act, cleanup } from '@testing-library/react'
import {
  LeafletTual,
  useLeafletTual,
  type ShapeItem,
} from '../index.js'
import { createMockCanvasContext } from './test-utils.js'

describe('Shape label edit mode and keyboard enter interaction', () => {
  let mapContainer: HTMLDivElement
  let mockMap: L.Map
  let origGetContext: typeof HTMLCanvasElement.prototype.getContext

  beforeEach(() => {
    mapContainer = document.createElement('div')
    document.body.appendChild(mapContainer)

    mockMap = {
      getContainer: () => mapContainer,
      getSize: () => ({ x: 800, y: 600 }),
      getZoom: () => 14,
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
        enabled: () => true,
      },
    } as unknown as L.Map

    origGetContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation(() => createMockCanvasContext())
  })

  afterEach(() => {
    cleanup()
    HTMLCanvasElement.prototype.getContext = origGetContext
    if (mapContainer.parentElement) {
      document.body.removeChild(mapContainer)
    }
  })

  it('enables edit label mode and focuses on the shape label input when a shape is selected and Enter is pressed', () => {
    const initialShape: ShapeItem = {
      id: 'shape-star-1',
      type: 'shape',
      shape: 'star',
      start: { lat: 41.0, lng: 28.9 },
      end: { lat: 41.02, lng: 28.95 },
      color: '#f59e0b',
      strokeWidth: 2,
      label: 'Initial Star Label',
      createdAt: 100,
    }

    let controller!: ReturnType<typeof useLeafletTual>

    function TestApp() {
      controller = useLeafletTual({
        initialItems: [initialShape],
      })
      return (
        <LeafletTual
          map={mockMap}
          controller={controller}
          showToolbar={true}
        />
      )
    }

    const { getByPlaceholderText } = render(<TestApp />)

    // 1. Select / focus the shape
    act(() => {
      controller.setSelectedId('shape-star-1')
    })

    expect(controller.selectedId).toBe('shape-star-1')
    expect(controller.isEditingLabel).toBe(false)

    const shapeInput = getByPlaceholderText('Shape label...') as HTMLInputElement
    expect(shapeInput).toBeTruthy()
    expect(shapeInput.value).toBe('Initial Star Label')
    expect(document.activeElement).not.toBe(shapeInput)

    // 2. Press Enter while shape is focused/selected
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    })

    // 3. Edit label mode should be enabled and the input for the selected shape focused
    expect(controller.isEditingLabel).toBe(true)
    expect(document.activeElement).toBe(shapeInput)

    // 4. Modify the label and press Enter to commit & blur
    act(() => {
      fireEvent.change(shapeInput, { target: { value: 'Updated Star Label' } })
    })

    expect(controller.items[0]).toMatchObject({
      label: 'Updated Star Label',
    })

    act(() => {
      fireEvent.keyDown(shapeInput, { key: 'Enter' })
    })

    expect(controller.isEditingLabel).toBe(false)
    expect(document.activeElement).not.toBe(shapeInput)
  })

  it('does NOT enable edit label mode or focus on the input if the shape has labelMode: false', () => {
    const shapeWithoutLabelMode: ShapeItem = {
      id: 'shape-no-label',
      type: 'shape',
      shape: 'circle',
      start: { lat: 41.0, lng: 28.9 },
      end: { lat: 41.02, lng: 28.95 },
      color: '#10b981',
      strokeWidth: 2,
      labelMode: false,
      createdAt: 100,
    }

    let controller!: ReturnType<typeof useLeafletTual>

    function TestApp() {
      controller = useLeafletTual({
        initialItems: [shapeWithoutLabelMode],
      })
      return (
        <LeafletTual
          map={mockMap}
          controller={controller}
          showToolbar={true}
        />
      )
    }

    const { queryByPlaceholderText } = render(<TestApp />)

    // 1. Select the shape with labelMode: false
    act(() => {
      controller.setSelectedId('shape-no-label')
    })

    // Shape label input should not even be rendered in toolbar
    expect(queryByPlaceholderText('Shape label...')).toBeNull()

    // 2. Press Enter
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    })

    // Should NOT enable edit label mode
    expect(controller.isEditingLabel).toBe(false)
    expect(queryByPlaceholderText('Shape label...')).toBeNull()
  })

  it('renders and focuses on InlineShapeLabelEditor when toolbar is disabled (showToolbar=false)', () => {
    const initialShape: ShapeItem = {
      id: 'shape-square-1',
      type: 'shape',
      shape: 'square',
      start: { lat: 41.0, lng: 28.9 },
      end: { lat: 41.02, lng: 28.95 },
      color: '#2563eb',
      strokeWidth: 2,
      label: 'Box Alpha',
      createdAt: 100,
    }

    let controller!: ReturnType<typeof useLeafletTual>

    function TestApp() {
      controller = useLeafletTual({
        initialItems: [initialShape],
      })
      return (
        <LeafletTual
          map={mockMap}
          controller={controller}
          showToolbar={false}
        />
      )
    }

    const { getByTestId, queryByTestId } = render(<TestApp />)

    // Initially, no inline editor rendered
    expect(queryByTestId('inline-shape-label-input')).toBeNull()

    // Select shape
    act(() => {
      controller.setSelectedId('shape-square-1')
    })

    // Press Enter to enable edit label mode
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    })

    expect(controller.isEditingLabel).toBe(true)

    // Inline input is rendered and focused
    const inlineInput = getByTestId('inline-shape-label-input') as HTMLInputElement
    expect(inlineInput).toBeTruthy()
    expect(inlineInput.value).toBe('Box Alpha')
    expect(document.activeElement).toBe(inlineInput)

    // Escape closes inline editor
    act(() => {
      fireEvent.keyDown(inlineInput, { key: 'Escape' })
    })

    expect(controller.isEditingLabel).toBe(false)
  })

  it('does NOT enable edit label mode if a non-labelable item (such as freedraw) is selected and Enter is pressed', () => {
    let controller!: ReturnType<typeof useLeafletTual>

    function TestApp() {
      controller = useLeafletTual({
        initialItems: [
          {
            id: 'freedraw-1',
            type: 'freedraw',
            points: [
              { lat: 41.0, lng: 28.0 },
              { lat: 41.1, lng: 28.1 },
            ],
            color: '#ff0000',
            strokeWidth: 2,
            createdAt: 100,
          },
        ],
      })
      return (
        <LeafletTual
          map={mockMap}
          controller={controller}
          showToolbar={true}
        />
      )
    }

    render(<TestApp />)

    act(() => {
      controller.setSelectedId('freedraw-1')
    })

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    })

    expect(controller.isEditingLabel).toBe(false)
  })

  it('enables edit mode and focuses on input when a normal text item is selected and Enter is pressed', () => {
    let controller!: ReturnType<typeof useLeafletTual>

    function TestApp() {
      controller = useLeafletTual({
        initialItems: [
          {
            id: 'text-1',
            type: 'text',
            position: { lat: 41.0, lng: 28.0 },
            text: 'Hello World',
            color: '#000000',
            initialFontSize: 16,
            createdAt: 100,
          },
        ],
      })
      return (
        <LeafletTual
          map={mockMap}
          controller={controller}
          showToolbar={true}
        />
      )
    }

    const { getByPlaceholderText } = render(<TestApp />)

    // Select the text item
    act(() => {
      controller.setSelectedId('text-1')
    })

    expect(controller.selectedId).toBe('text-1')
    expect(controller.isEditingLabel).toBe(false)

    // Press Enter to enable edit mode
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    })

    expect(controller.isEditingLabel).toBe(true)

    // The on-canvas text textarea should be focused for inline editing, NOT the toolbar input
    const textArea = getByPlaceholderText('Type text...') as HTMLTextAreaElement
    const toolbarInput = document.querySelector('[data-tual-text-input="text-1"]') as HTMLInputElement
    expect(textArea).toBeTruthy()
    expect(toolbarInput).toBeTruthy()
    expect(textArea.value).toBe('Hello World')
    expect(document.activeElement).toBe(textArea)
    expect(document.activeElement).not.toBe(toolbarInput)

    // Typing in the textarea updates the text
    act(() => {
      fireEvent.change(textArea, { target: { value: 'Updated Normal Text' } })
    })

    expect(controller.items[0]).toMatchObject({
      text: 'Updated Normal Text',
    })

    // Press Enter inside textarea to finish editing
    act(() => {
      fireEvent.keyDown(textArea, { key: 'Enter' })
    })

    expect(document.activeElement).not.toBe(textArea)
  })
})
