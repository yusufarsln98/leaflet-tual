import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, renderHook, act, within } from '@testing-library/react'
import { LeafletTual, Sidebar, useLeafletTual } from '../index.js'
import { emptyDoc } from '../../core/index.js'
import { createMockMap } from './test-utils.js'

vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)

function createSelectedShape() {
  const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))
  let shapeId = ''

  act(() => {
    const shape = result.current.add({
      type: 'shape',
      kind: 'square',
      at: { lat: 41.05, lng: 28.05 },
      width: 100,
      height: 100,
      label: 'Park',
    })
    shapeId = shape.id
    result.current.select(shape.id)
  })

  return { controller: result.current, shapeId }
}

describe('Sidebar inspector', () => {
  it('renders from the sidebar prop and hides the contextual item toolbar', () => {
    const { controller } = createSelectedShape()
    const map = createMockMap()

    const { container, rerender } = render(
      <LeafletTual map={map} controller={controller} />,
    )

    expect(container.querySelector('.tual-sidebar')).toBeNull()
    expect(container.querySelector('.tual-secondary-tooltip')).not.toBeNull()

    rerender(<LeafletTual map={map} controller={controller} sidebar />)

    expect(container.querySelector('.tual-sidebar')).not.toBeNull()
    expect(container.querySelector('.tual-secondary-tooltip')).toBeNull()

    rerender(<LeafletTual map={map} controller={controller} sidebar={false} />)

    expect(container.querySelector('.tual-sidebar')).toBeNull()
    expect(container.querySelector('.tual-secondary-tooltip')).not.toBeNull()
  })

  it('closes the built-in sidebar from the header close button', () => {
    const { controller } = createSelectedShape()
    const map = createMockMap()
    const onSidebarChange = vi.fn()

    const { container } = render(
      <LeafletTual
        map={map}
        controller={controller}
        sidebar
        onSidebarChange={onSidebarChange}
      />,
    )

    expect(container.querySelector('.tual-sidebar')).not.toBeNull()

    fireEvent.click(screen.getByTitle('Close sidebar'))

    expect(onSidebarChange).toHaveBeenLastCalledWith(false)
    expect(container.querySelector('.tual-sidebar')).toBeNull()
    expect(container.querySelector('.tual-secondary-tooltip')).not.toBeNull()
  })

  it('opens the sidebar from the selected item toolbar more button', () => {
    const { controller } = createSelectedShape()
    const map = createMockMap()

    const { container } = render(<LeafletTual map={map} controller={controller} />)

    const itemToolbar = container.querySelector('.tual-secondary-tooltip') as HTMLElement
    expect(itemToolbar).not.toBeNull()

    fireEvent.click(within(itemToolbar).getByTitle('More Options'))

    expect(container.querySelector('.tual-sidebar')).not.toBeNull()
    expect(container.querySelector('.tual-secondary-tooltip')).toBeNull()
  })

  it('pins the toolbar to top center while open and toggles the sidebar from the more menu', () => {
    const { controller } = createSelectedShape()
    const map = createMockMap()
    const onSidebarChange = vi.fn()

    const { container } = render(
      <LeafletTual
        map={map}
        controller={controller}
        sidebar
        toolbar={{ position: 'right' }}
        onSidebarChange={onSidebarChange}
      />,
    )

    const toolbar = container.querySelector('.tual-toolbar') as HTMLElement
    expect(toolbar.getAttribute('data-position')).toBe('top')
    expect(toolbar.getAttribute('data-edge')).toBe('top')
    expect(toolbar.getAttribute('data-align')).toBe('center')

    fireEvent.click(within(toolbar).getByTitle(/More Options/i))
    fireEvent.click(screen.getByText('Hide sidebar'))

    expect(onSidebarChange).toHaveBeenLastCalledWith(false)
    expect(container.querySelector('.tual-sidebar')).toBeNull()
    expect(container.querySelector('.tual-secondary-tooltip')).not.toBeNull()
    expect(toolbar.getAttribute('data-position')).toBe('right')

    fireEvent.click(within(toolbar).getByTitle(/More Options/i))
    fireEvent.click(screen.getByText('Show sidebar'))

    expect(onSidebarChange).toHaveBeenLastCalledWith(true)
    expect(container.querySelector('.tual-sidebar')).not.toBeNull()
    expect(container.querySelector('.tual-secondary-tooltip')).toBeNull()
    expect(toolbar.getAttribute('data-position')).toBe('top')
  })

  it('shows the layer tree and edits selected item properties', () => {
    const { controller, shapeId } = createSelectedShape()
    const map = createMockMap()

    const { container } = render(
      <LeafletTual map={map} controller={controller} sidebar />,
    )

    const sidebar = container.querySelector('.tual-sidebar') as HTMLElement
    expect(sidebar).not.toBeNull()
    expect(within(sidebar).getByText('Properties')).toBeDefined()
    expect(within(sidebar).getByText('Square')).toBeDefined()
    expect(within(sidebar).getByText('“Park”')).toBeDefined()
    expect(within(sidebar).getByText('Fill & stroke')).toBeDefined()
    expect(within(sidebar).getByText('Typography')).toBeDefined()

    act(() => {
      controller.select(null)
    })

    fireEvent.click(within(sidebar).getByRole('treeitem'))
    expect(controller.selection).toEqual([shapeId])
    expect(map.fitBounds).toHaveBeenCalled()

    fireEvent.change(within(sidebar).getByLabelText('Stroke Width'), {
      target: { value: '3' },
    })
    expect(controller.items[0].style?.width).toBe(3)

    fireEvent.change(within(sidebar).getByLabelText('Opacity'), {
      target: { value: '0.6' },
    })
    expect(controller.items[0].style?.opacity).toBe(0.6)

    fireEvent.click(within(sidebar).getByTitle('Delete'))
    const dialog = screen.getByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))
    expect(controller.items.find((item) => item.id === shapeId)).toBeUndefined()
  })

  it('opens the shared context menu when right-clicking a layer tree item', () => {
    const { controller, shapeId } = createSelectedShape()
    const map = createMockMap()

    const { container } = render(
      <LeafletTual map={map} controller={controller} sidebar />,
    )

    fireEvent.contextMenu(screen.getByRole('treeitem'), { clientX: 750, clientY: 150 })

    expect(controller.selection).toEqual([shapeId])
    expect(container.querySelector('.tual-context-menu')).not.toBeNull()
    expect(screen.getByText('Duplicate')).toBeDefined()

    fireEvent.click(screen.getByText('Duplicate'))
    expect(controller.items).toHaveLength(2)
    expect(container.querySelector('.tual-context-menu')).toBeNull()
  })

  it('restores map dragging when a standalone sidebar closes or unmounts', () => {
    const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))
    const map = createMockMap()
    const onClose = vi.fn()

    const { container, unmount } = render(
      <Sidebar controller={result.current} map={map} onClose={onClose} />,
    )

    const sidebar = container.querySelector('.tual-sidebar') as HTMLElement
    fireEvent.mouseEnter(sidebar)
    expect(map.dragging.enabled()).toBe(false)

    fireEvent.click(screen.getByTitle('Close sidebar'))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(map.dragging.enabled()).toBe(true)

    fireEvent.mouseEnter(sidebar)
    expect(map.dragging.enabled()).toBe(false)
    unmount()
    expect(map.dragging.enabled()).toBe(true)
  })

  it('does not render a close button without a host close callback', () => {
    const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))

    render(<Sidebar controller={result.current} map={createMockMap()} />)

    expect(screen.getByText('Properties')).toBeDefined()
    expect(screen.queryByTitle('Close sidebar')).toBeNull()
  })

  it('stays hidden in read-only mode even when requested', () => {
    const { controller } = createSelectedShape()
    const map = createMockMap()

    const { container } = render(
      <LeafletTual map={map} controller={controller} readOnly sidebar />,
    )

    expect(container.querySelector('.tual-sidebar')).toBeNull()
  })
})
