import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, renderHook } from '@testing-library/react'
import { Toolbar, useLeafletTual } from '../index.js'
import { emptyDoc } from '../../core/index.js'

import type { ToolbarProps } from '../types/index.js'

function TestToolbar({ toolbarProps = {} }: { toolbarProps?: Partial<ToolbarProps> }) {
  const controller = useLeafletTual({
    defaultValue: emptyDoc(),
  })
  return <Toolbar controller={controller} {...toolbarProps} />
}

describe('v2 Toolbar Component', () => {
  it('renders default tools and page switcher', () => {
    render(<TestToolbar />)
    expect(screen.getByText('Page 1')).toBeDefined()
    expect(screen.getByTitle(/Select/i)).toBeDefined()
    expect(screen.getByTitle(/Draw/i)).toBeDefined()
    expect(screen.getByTitle(/Arrow/i)).toBeDefined()
    expect(screen.getByTitle(/Shape/i)).toBeDefined()
    expect(screen.getByTitle(/Ruler/i)).toBeDefined()
    expect(screen.getByTitle(/Note/i)).toBeDefined()
    expect(screen.getByTitle(/Text/i)).toBeDefined()
  })

  it('filters tools when tools prop is provided', () => {
    render(<TestToolbar toolbarProps={{ tools: ['select', 'pen', 'note'] }} />)
    expect(screen.getByTitle(/Select/i)).toBeDefined()
    expect(screen.getByTitle(/Draw/i)).toBeDefined()
    expect(screen.getByTitle(/Note/i)).toBeDefined()
    expect(screen.queryByTitle(/Ruler/i)).toBeNull()
  })

  it('groups free draw and pen under one Draw dropdown triggered by chevron', () => {
    const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))
    render(<Toolbar controller={result.current} />)

    // Clicking the item button selects the tool without opening dropdown
    fireEvent.click(screen.getByTitle(/Draw/i))
    expect(result.current.tool).toBe('freedraw')
    expect(screen.queryByText('Free draw')).toBeNull()

    // Clicking the chevron opens the dropdown
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

  it('hides pages when pages: false', () => {
    render(<TestToolbar toolbarProps={{ pages: false }} />)
    expect(screen.queryByText('Page 1')).toBeNull()
  })

  it('keeps undo and redo out of the primary toolbar', () => {
    render(<TestToolbar />)
    expect(screen.queryByTitle(/Undo/i)).toBeNull()
    expect(screen.queryByTitle(/Redo/i)).toBeNull()
  })

  it('does not render adjacent separators', () => {
    const { container } = render(<TestToolbar />)
    const separators = Array.from(container.querySelectorAll('.tual-separator'))
    const adjacentSeparators = separators.filter(
      (separator, index) => index > 0 && separators[index - 1].nextElementSibling === separator,
    )
    expect(adjacentSeparators).toHaveLength(0)
  })

  it('does not render styles tool in primary toolbar (styles moved to contextual secondary tooltip)', () => {
    render(<TestToolbar />)
    expect(screen.queryByTitle(/Styles/i)).toBeNull()
  })

  it('opens shape variants when chevron is clicked and applies the selected kind', () => {
    const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))
    render(<Toolbar controller={result.current} />)

    // Clicking the item button selects shape tool without opening dropdown
    fireEvent.click(screen.getByTitle(/Shape/i))
    expect(result.current.tool).toBe('shape')
    expect(screen.queryByText('Shape Type')).toBeNull()

    // Clicking the chevron opens the shape variants popover
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

    // Select a shape variant: circle
    fireEvent.click(screen.getByLabelText(/Shape options/i))
    fireEvent.click(screen.getByText('Circle'))
    expect(result.current.tool).toBe('shape')
    expect(result.current.variant).toBe('circle')

    // The shape button now contains the circle svg, while the arrow button does not
    expect(shapeButton.querySelector('circle')).not.toBeNull()
    expect(arrowButton.querySelector('circle')).toBeNull()

    // Select an arrow variant: curved
    fireEvent.click(screen.getByLabelText(/Arrow options/i))
    fireEvent.click(screen.getByText('Curved'))
    expect(result.current.tool).toBe('arrow')
    expect(result.current.variant).toBe('curved')

    // Arrow button has curved arrow, shape button retains circle icon
    expect(arrowButton.querySelector('path[d*="Q3.1"]')).not.toBeNull()
    expect(shapeButton.querySelector('path[d*="Q3.1"]')).toBeNull()
    expect(shapeButton.querySelector('circle')).not.toBeNull()

    // Switching away to another tool (e.g. select) preserves both icons
    fireEvent.click(screen.getByTitle(/Select/i))
    expect(result.current.tool).toBe('select')
    expect(arrowButton.querySelector('path[d*="Q3.1"]')).not.toBeNull()
    expect(shapeButton.querySelector('circle')).not.toBeNull()
  })
})
