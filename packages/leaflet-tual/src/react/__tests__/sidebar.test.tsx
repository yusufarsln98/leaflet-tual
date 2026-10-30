import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, renderHook, act, within } from '@testing-library/react'
import { LeafletTual, Sidebar, SidebarTriggerBar, useLeafletTual } from '../index.js'
import { emptyDoc } from '../../core/index.js'
import { createMockMap } from './test-utils.js'

vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)

describe('v2 Sidebar and SidebarTriggerBar', () => {
  it('renders SidebarTriggerBar with sidebar toggle and zoom level (and no play button)', () => {
    const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))
    const map = createMockMap()
    const onToggle = vi.fn()

    render(
      <SidebarTriggerBar
        controller={result.current}
        map={map}
        sidebarOpen={false}
        onToggleSidebar={onToggle}
      />,
    )

    const toggleBtn = screen.getByTitle('Toggle sidebar')
    expect(toggleBtn).toBeDefined()
    expect(screen.getByTitle(/Zoom level/i)).toBeDefined()
    expect(screen.queryByTitle(/Play/i)).toBeNull()

    fireEvent.click(toggleBtn)
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('opens a zoom menu with zoom, fit, and history actions', () => {
    const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))
    const map = createMockMap({ setZoom: vi.fn(), zoomIn: vi.fn(), zoomOut: vi.fn() })

    render(
      <SidebarTriggerBar
        controller={result.current}
        map={map}
        currentZoom={14}
        sidebarOpen={false}
        onToggleSidebar={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByTitle('Zoom level'))

    expect(screen.getByText('Zoom in')).toBeDefined()
    expect(screen.getByText('Zoom out')).toBeDefined()
    expect(screen.getByText('Fit in View')).toBeDefined()
    expect(screen.getByText('Fit selection')).toBeDefined()
    expect(screen.getByText('Undo')).toBeDefined()
    expect(screen.getByText('Redo')).toBeDefined()

    const fitAll = screen.getByText('Fit in View').closest('button') as HTMLButtonElement
    const fitSelection = screen.getByText('Fit selection').closest('button') as HTMLButtonElement
    expect(fitAll.disabled).toBe(true)
    expect(fitSelection.disabled).toBe(true)

    fireEvent.click(screen.getByText('50%'))
    expect(map.setZoom).toHaveBeenCalledWith(12)
    expect(screen.queryByText('Zoom in')).toBeNull()
  })

  it('fits all items and the current selection from the zoom menu', () => {
    const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))

    act(() => {
      const item = result.current.add({
        type: 'text',
        at: { lat: 41.05, lng: 28.05 },
        text: 'Hello',
      })
      result.current.select(item.id)
    })

    const map = createMockMap({ setZoom: vi.fn() })
    render(<LeafletTual map={map} controller={result.current} />)

    fireEvent.click(screen.getByTitle('Zoom level'))
    fireEvent.click(screen.getByText('Fit selection'))
    expect(map.fitBounds).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByTitle('Zoom level'))
    fireEvent.click(screen.getByText('Fit in View'))
    expect(map.fitBounds).toHaveBeenCalledTimes(2)
  })

  it('runs undo from the zoom menu', () => {
    const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))
    const map = createMockMap({ setZoom: vi.fn() })

    act(() => {
      result.current.add({
        type: 'text',
        at: { lat: 41.05, lng: 28.05 },
        text: 'Hello',
      })
    })

    render(
      <SidebarTriggerBar
        controller={result.current}
        map={map}
        currentZoom={13}
        sidebarOpen={false}
        onToggleSidebar={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByTitle('Zoom level'))
    fireEvent.click(screen.getByText('Undo'))

    expect(result.current.items).toHaveLength(0)
  })

  it('preserves section order when sections are collapsed', () => {
    const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))

    act(() => {
      const shape = result.current.add({
        type: 'shape',
        kind: 'square',
        at: { lat: 41.05, lng: 28.05 },
        width: 100,
        height: 100,
      })
      result.current.select(shape.id)
    })

    const { container } = render(
      <Sidebar controller={result.current} map={createMockMap()} onClose={vi.fn()} />,
    )

    fireEvent.click(screen.getByText('Fill & stroke').closest('button') as HTMLButtonElement)
    fireEvent.click(screen.getByText('Typography').closest('button') as HTMLButtonElement)

    const properties = container.querySelector('.tual-sidebar-properties') as HTMLElement
    const titles = Array.from(properties.querySelectorAll('.tual-collapsible-title')).map(
      (node) => node.textContent,
    )

    expect(titles).toEqual(['Fill & stroke', 'Typography'])
    expect(properties.querySelector('.tual-sidebar-collapsed-stack')).toBeNull()
  })

  it('shows empty state when sidebar is open and nothing is selected', () => {
    const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))
    const map = createMockMap()
    const onClose = vi.fn()

    render(<Sidebar controller={result.current} map={map} onClose={onClose} />)

    expect(screen.getByText('Properties')).toBeDefined()
    expect(screen.getByText('Nothing selected')).toBeDefined()
    expect(screen.getByText('Click any element in the design to edit it here.')).toBeDefined()
  })

  it('hides item SecondaryTooltip when sidebar is active and edits properties & deletes inside sidebar', () => {
    const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))

    let shapeId = ''
    act(() => {
      const s = result.current.add({
        type: 'shape',
        kind: 'square',
        at: { lat: 41.05, lng: 28.05 },
        width: 100,
        height: 100,
        label: 'Park',
      })
      shapeId = s.id
      result.current.select(s.id)
    })

    const map = createMockMap()
    const { container } = render(
      <LeafletTual map={map} controller={result.current} />,
    )

    // When sidebar is inactive, SecondaryTooltip is visible on the item and has More Options button
    expect(container.querySelector('.tual-secondary-tooltip')).not.toBeNull()
    const moreBtn = screen.getByTitle('More Options')
    expect(moreBtn).toBeDefined()

    // Clicking More Options on the item tooltip opens the sidebar with the item selected
    fireEvent.click(moreBtn)

    // Once sidebar is active, SecondaryTooltip (and its More Options button) on the item is hidden
    expect(container.querySelector('.tual-secondary-tooltip')).toBeNull()
    expect(screen.queryByTitle('More Options')).toBeNull()
    expect(container.querySelector('.tual-sidebar')).not.toBeNull()

    // Layer tree shows the shape item and its preview
    expect(screen.getByText('Square')).toBeDefined()
    expect(screen.getByText('“Park”')).toBeDefined()

    // Selecting an item in the sidebar layer tree focuses on it in the map
    act(() => {
      result.current.select(null)
    })
    fireEvent.click(screen.getByRole('treeitem'))
    expect(result.current.selection).toEqual([shapeId])
    expect(map.fitBounds).toHaveBeenCalledTimes(1)

    // Properties sections are shown in sidebar; opacity lives in Fill & stroke
    expect(screen.getByText('Fill & stroke')).toBeDefined()
    expect(screen.queryByText('Appearance')).toBeNull()
    expect(screen.queryByText('Preview')).toBeNull()

    // Collapsing a section keeps it in place; expanding restores its content
    const fillHeader = screen.getByText('Fill & stroke').closest('button') as HTMLButtonElement
    fireEvent.click(fillHeader)
    expect(screen.queryByLabelText('Opacity')).toBeNull()

    fireEvent.click(fillHeader)
    expect(screen.getByLabelText('Opacity')).toBeDefined()

    // Opening a color menu in the sidebar and clicking outside closes the menu
    fireEvent.click(screen.getByTitle('Stroke'))
    expect(screen.getByText('Theme')).toBeDefined()
    fireEvent.pointerDown(screen.getByText('Properties'))
    expect(screen.queryByText('Theme')).toBeNull()

    // Edit Thickness & Opacity inside sidebar
    const thicknessInput = screen.getByLabelText('Stroke Width') as HTMLInputElement
    expect(thicknessInput.step).toBe('1')
    fireEvent.change(thicknessInput, { target: { value: '3' } })
    expect(result.current.items[0].style?.width).toBe(3)

    const opacityInput = screen.getByLabelText('Opacity') as HTMLInputElement
    expect(opacityInput.step).toBe('0.1')
    fireEvent.change(opacityInput, { target: { value: '0.5' } })
    expect(result.current.items[0].style?.opacity).toBe(0.5)

    // Delete item from inside the sidebar using the close button and confirm popover
    const deleteTriggerBtn = screen.getByTitle('Delete')
    expect(deleteTriggerBtn.querySelector('svg')).not.toBeNull()
    expect(deleteTriggerBtn.querySelector('svg path[d="M18 6 6 18"]')).not.toBeNull()
    fireEvent.click(deleteTriggerBtn)
    expect(screen.getByText('Delete item?')).toBeDefined()

    // Confirm deletion in popover
    const dialog = screen.getByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))
    expect(result.current.items.find((i) => i.id === shapeId)).toBeUndefined()
  })

  it('re-enables map dragging when closing the sidebar or unmounting', () => {
    const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))
    const map = createMockMap()
    const onClose = vi.fn()

    const { container, unmount } = render(
      <Sidebar controller={result.current} map={map} onClose={onClose} />,
    )

    const sidebar = container.querySelector('.tual-sidebar') as HTMLElement
    expect(sidebar).not.toBeNull()

    // Mouse enters sidebar -> dragging is disabled so gestures in sidebar do not pan map
    fireEvent.mouseEnter(sidebar)
    expect(map.dragging.enabled()).toBe(false)

    // Clicking close button re-enables map dragging immediately
    const closeBtn = screen.getByTitle('Close sidebar')
    fireEvent.click(closeBtn)
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(map.dragging.enabled()).toBe(true)

    // If mouse re-enters and sidebar unmounts, unmount cleanup restores dragging
    fireEvent.mouseEnter(sidebar)
    expect(map.dragging.enabled()).toBe(false)
    unmount()
    expect(map.dragging.enabled()).toBe(true)
  })

  it('allows panning immediately after closing sidebar in LeafletTual without clicking any action', () => {
    const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))
    const map = createMockMap()
    const { container } = render(<LeafletTual map={map} controller={result.current} />)

    // Open sidebar via trigger bar
    const toggleBtn = screen.getByTitle('Toggle sidebar')
    fireEvent.click(toggleBtn)

    const sidebar = container.querySelector('.tual-sidebar') as HTMLElement
    expect(sidebar).not.toBeNull()

    // Hover or interact with sidebar -> disables map dragging
    fireEvent.mouseEnter(sidebar)
    expect(map.dragging.enabled()).toBe(false)

    // Close sidebar from header close button
    const closeBtn = screen.getByTitle('Close sidebar')
    fireEvent.click(closeBtn)

    // Sidebar is gone and map dragging is immediately re-enabled
    expect(container.querySelector('.tual-sidebar')).toBeNull()
    expect(map.dragging.enabled()).toBe(true)
  })

  it('renders consistent chevron icon sizes between expanded and collapsed states in the sidebar', () => {
    const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))
    const map = createMockMap()
    const { container } = render(<Sidebar controller={result.current} map={map} onClose={vi.fn()} />)

    // Layer tree group chevron initially expanded
    const treeChevron = container.querySelector('.tual-sidebar-tree-chevron svg') as SVGSVGElement
    expect(treeChevron).not.toBeNull()
    expect(treeChevron.getAttribute('viewBox')).toBe('0 0 24 24')
    expect(treeChevron.getAttribute('width')).toBe('14')
    expect(treeChevron.getAttribute('height')).toBe('14')

    // Click to collapse
    const treeHeader = container.querySelector('.tual-sidebar-tree-group-header') as HTMLElement
    fireEvent.click(treeHeader)

    // Now collapsed, chevronRight is rendered with matching dimensions & viewBox
    const collapsedTreeChevron = container.querySelector('.tual-sidebar-tree-chevron svg') as SVGSVGElement
    expect(collapsedTreeChevron).not.toBeNull()
    expect(collapsedTreeChevron.getAttribute('viewBox')).toBe('0 0 24 24')
    expect(collapsedTreeChevron.getAttribute('width')).toBe('14')
    expect(collapsedTreeChevron.getAttribute('height')).toBe('14')
  })
})
