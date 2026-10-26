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
      <LeafletTual map={map} controller={result.current} defaultSidebarOpen={false} />,
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

    // Properties sections are shown in sidebar
    expect(screen.getByText('Fill & stroke')).toBeDefined()
    expect(screen.getByText('Appearance')).toBeDefined()

    // Opening a color menu in the sidebar and clicking outside closes the menu
    fireEvent.click(screen.getByTitle('Stroke'))
    expect(screen.getByText('Theme')).toBeDefined()
    fireEvent.pointerDown(screen.getByText('Properties'))
    expect(screen.queryByText('Theme')).toBeNull()

    // Edit Thickness & Opacity inside sidebar
    const thicknessInput = screen.getByLabelText('Stroke Width') as HTMLInputElement
    fireEvent.change(thicknessInput, { target: { value: '3' } })
    expect(result.current.items[0].style?.width).toBe(3)

    const opacityInput = screen.getByLabelText('Opacity') as HTMLInputElement
    fireEvent.change(opacityInput, { target: { value: '0.5' } })
    expect(result.current.items[0].style?.opacity).toBe(0.5)

    // Delete item from inside the sidebar using the x button and confirm popover
    const deleteTriggerBtn = screen.getByTitle('Delete')
    fireEvent.click(deleteTriggerBtn)
    expect(screen.getByText('Delete item?')).toBeDefined()

    // Confirm deletion in popover
    const dialog = screen.getByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))
    expect(result.current.items.find((i) => i.id === shapeId)).toBeUndefined()
  })
})

