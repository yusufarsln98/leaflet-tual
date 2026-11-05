import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react'
import { Toolbar, useLeafletTual } from '../index.js'
import { emptyDoc } from '../../core/index.js'

import type { ToolbarProps } from '../types/index.js'

function TestToolbar({ toolbarProps = {} }: { toolbarProps?: Partial<ToolbarProps> }) {
  const controller = useLeafletTual({
    defaultValue: emptyDoc(),
  })
  return <Toolbar controller={controller} {...toolbarProps} />
}

describe('v3 Toolbar Component', () => {
  it('renders grouped default controls and page switcher', () => {
    const { container } = render(<TestToolbar />)
    expect(screen.getByTitle(/Page Switcher/i)).toBeDefined()
    expect(screen.getByTitle(/Select/i)).toBeDefined()
    expect(screen.getByTitle(/Draw/i)).toBeDefined()
    expect(screen.getByTitle(/Arrow/i)).toBeDefined()
    expect(screen.getByTitle(/Shape/i)).toBeDefined()
    expect(screen.getByTitle(/Ruler/i)).toBeDefined()
    expect(screen.getByTitle(/Laser/i)).toBeDefined()
    expect(screen.getByTitle(/Note/i)).toBeDefined()
    expect(screen.getByTitle(/Text/i)).toBeDefined()
    expect(screen.getByTitle(/Undo/i)).toBeDefined()
    expect(screen.getByTitle(/Redo/i)).toBeDefined()

    const groups = Array.from(container.querySelectorAll('.tual-tool-group'))
    expect(groups).toHaveLength(3)
  })

  it('derives a horizontal layout for top and bottom positions', () => {
    const { container, rerender } = render(<TestToolbar />)
    const toolbar = container.querySelector('.tual-toolbar') as HTMLElement

    expect(toolbar.getAttribute('data-position')).toBe('top-left')
    expect(toolbar.getAttribute('data-orientation')).toBe('horizontal')
    expect(toolbar.getAttribute('data-edge')).toBe('top')
    expect(toolbar.getAttribute('data-align')).toBe('start')

    rerender(<TestToolbar toolbarProps={{ position: 'top' }} />)
    expect(toolbar.getAttribute('data-orientation')).toBe('horizontal')
    expect(toolbar.getAttribute('data-edge')).toBe('top')
    expect(toolbar.getAttribute('data-align')).toBe('center')

    rerender(<TestToolbar toolbarProps={{ position: 'bottom-right' }} />)
    expect(toolbar.getAttribute('data-orientation')).toBe('horizontal')
    expect(toolbar.getAttribute('data-edge')).toBe('bottom')
    expect(toolbar.getAttribute('data-align')).toBe('end')
  })

  it('derives a vertical layout for left and right positions', () => {
    const { container, rerender } = render(<TestToolbar toolbarProps={{ position: 'left-top' }} />)
    const toolbar = container.querySelector('.tual-toolbar') as HTMLElement

    expect(toolbar.getAttribute('data-orientation')).toBe('vertical')
    expect(toolbar.getAttribute('data-edge')).toBe('left')
    expect(toolbar.getAttribute('data-align')).toBe('start')

    rerender(<TestToolbar toolbarProps={{ position: 'right' }} />)
    expect(toolbar.getAttribute('data-orientation')).toBe('vertical')
    expect(toolbar.getAttribute('data-edge')).toBe('right')
    expect(toolbar.getAttribute('data-align')).toBe('center')

    rerender(<TestToolbar toolbarProps={{ position: 'right-bottom' }} />)
    expect(toolbar.getAttribute('data-orientation')).toBe('vertical')
    expect(toolbar.getAttribute('data-edge')).toBe('right')
    expect(toolbar.getAttribute('data-align')).toBe('end')
  })

  it('ignores orientation overrides for anchored positions', () => {
    const { container } = render(
      <TestToolbar toolbarProps={{ position: 'top-left', orientation: 'vertical' }} />,
    )
    const toolbar = container.querySelector('.tual-toolbar') as HTMLElement
    expect(toolbar.getAttribute('data-orientation')).toBe('horizontal')
  })

  it('supports inline positioning for external toolbars', () => {
    const { container, rerender } = render(<TestToolbar toolbarProps={{ position: 'inline' }} />)
    const toolbar = container.querySelector('.tual-toolbar') as HTMLElement
    expect(toolbar.getAttribute('data-position')).toBe('inline')
    expect(toolbar.getAttribute('data-orientation')).toBe('vertical')

    rerender(<TestToolbar toolbarProps={{ position: 'inline', orientation: 'horizontal' }} />)
    expect(toolbar.getAttribute('data-orientation')).toBe('horizontal')
  })

  it('applies toolbar theme tokens locally', () => {
    const { container } = render(
      <TestToolbar toolbarProps={{ themeTokens: { surface: '#fafafa', controlSize: '34px' } }} />,
    )
    const toolbar = container.querySelector('.tual-toolbar') as HTMLElement
    expect(toolbar.style.getPropertyValue('--tual-bg')).toBe('#fafafa')
    expect(toolbar.style.getPropertyValue('--tual-control-size')).toBe('34px')
  })

  it('filters tools when tools prop is provided', () => {
    render(<TestToolbar toolbarProps={{ tools: ['select', 'pen', 'note'] }} />)
    expect(screen.getByTitle(/Select/i)).toBeDefined()
    expect(screen.getByTitle(/Draw/i)).toBeDefined()
    expect(screen.getByTitle(/Note/i)).toBeDefined()
    expect(screen.queryByTitle(/Ruler/i)).toBeNull()
  })

  it('can hide history and pages groups', () => {
    render(<TestToolbar toolbarProps={{ history: false, pages: false }} />)
    expect(screen.queryByTitle(/Undo/i)).toBeNull()
    expect(screen.queryByTitle(/Page Switcher/i)).toBeNull()
  })

  it('groups free draw and pen under one Draw dropdown triggered by the corner affordance', () => {
    const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))
    render(<Toolbar controller={result.current} />)

    fireEvent.click(screen.getByTitle(/Draw/i))
    expect(result.current.tool).toBe('freedraw')
    expect(screen.queryByText('Free draw')).toBeNull()

    fireEvent.click(screen.getByLabelText(/Draw options/i))
    expect(screen.getByText('Draw')).toBeDefined()
    expect(screen.getByText('Free draw')).toBeDefined()
    expect(screen.getByText('Pen')).toBeDefined()

    fireEvent.click(screen.getByText('Pen'))
    expect(result.current.tool).toBe('pen')
    expect(result.current.variant).toBeNull()

    fireEvent.click(screen.getByLabelText(/Draw options/i))
    fireEvent.click(screen.getByText('Free draw'))
    expect(result.current.tool).toBe('freedraw')
  })

  it('opens shape variants when the corner affordance is clicked and applies the selected kind', () => {
    const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))
    render(<Toolbar controller={result.current} />)

    fireEvent.click(screen.getByTitle(/Shape/i))
    expect(result.current.tool).toBe('shape')
    expect(screen.queryByText('Shape Type')).toBeNull()

    fireEvent.click(screen.getByLabelText(/Shape options/i))
    expect(screen.getByText('Shape Type')).toBeDefined()
    expect(screen.getByText('Triangle')).toBeDefined()
    expect(screen.getByText('Diamond')).toBeDefined()
    expect(screen.getByText('Hexagon')).toBeDefined()

    fireEvent.click(screen.getByText('Circle'))
    expect(result.current.tool).toBe('shape')
    expect(result.current.variant).toBe('circle')
  })

  it('keeps shape and arrow tool variants completely isolated in the toolbar', () => {
    const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))
    render(<Toolbar controller={result.current} />)

    const arrowButton = screen.getByTitle(/Arrow/i)
    const shapeButton = screen.getByTitle(/Shape/i)

    fireEvent.click(screen.getByLabelText(/Shape options/i))
    fireEvent.click(screen.getByText('Circle'))
    expect(result.current.tool).toBe('shape')
    expect(result.current.variant).toBe('circle')

    expect(shapeButton.querySelector('.lucide-circle')).not.toBeNull()
    expect(arrowButton.querySelector('.lucide-circle')).toBeNull()

    fireEvent.click(screen.getByLabelText(/Arrow options/i))
    fireEvent.click(screen.getByText('Curved'))
    expect(result.current.tool).toBe('arrow')
    expect(result.current.variant).toBe('curved')

    expect(arrowButton.querySelector('.lucide-redo')).not.toBeNull()
    expect(shapeButton.querySelector('.lucide-redo')).toBeNull()
    expect(shapeButton.querySelector('.lucide-circle')).not.toBeNull()

    fireEvent.click(screen.getByTitle(/Select/i))
    expect(result.current.tool).toBe('select')
    expect(arrowButton.querySelector('.lucide-redo')).not.toBeNull()
    expect(shapeButton.querySelector('.lucide-circle')).not.toBeNull()
  })

  it('groups ruler and area measure under one Measure dropdown triggered by the corner affordance', () => {
    const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))
    render(<Toolbar controller={result.current} />)

    fireEvent.click(screen.getByTitle(/Ruler/i))
    expect(result.current.tool).toBe('ruler')
    expect(screen.queryByText('Area')).toBeNull()

    fireEvent.click(screen.getByLabelText(/Measure options/i))
    expect(screen.getByText('Measure Type')).toBeDefined()
    expect(screen.getAllByText('Ruler').length).toBeGreaterThan(0)
    expect(screen.getByText('Area')).toBeDefined()

    fireEvent.click(screen.getByText('Area'))
    expect(result.current.tool).toBe('area')

    fireEvent.click(screen.getByLabelText(/Measure options/i))
    fireEvent.click(screen.getAllByText('Ruler')[0])
    expect(result.current.tool).toBe('ruler')
  })

  it('renders laser pointer button and activates laser tool', () => {
    const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))
    render(<Toolbar controller={result.current} />)

    fireEvent.click(screen.getByTitle(/Laser/i))
    expect(result.current.tool).toBe('laser')
  })

  it('undoes and redoes from the history group', () => {
    const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))
    render(<Toolbar controller={result.current} />)

    act(() => {
      result.current.add({
        type: 'text',
        at: { lat: 41.05, lng: 28.05 },
        text: 'Hello',
      })
    })

    expect(result.current.items).toHaveLength(1)
    fireEvent.click(screen.getByTitle(/Undo/i))
    expect(result.current.items).toHaveLength(0)
    fireEvent.click(screen.getByTitle(/Redo/i))
    expect(result.current.items).toHaveLength(1)
  })
})
