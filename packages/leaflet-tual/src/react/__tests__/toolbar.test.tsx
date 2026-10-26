import { describe, it, expect, vi } from 'vitest'
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

  it('groups free draw and pen under one Draw dropdown', () => {
    const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))
    render(<Toolbar controller={result.current} />)

    fireEvent.click(screen.getByTitle(/Draw/i))
    expect(screen.getByText('Draw')).toBeDefined()
    expect(screen.getByText('Free draw')).toBeDefined()
    expect(screen.getByText('Pen')).toBeDefined()

    fireEvent.click(screen.getByText('Pen'))
    expect(result.current.tool).toBe('pen')
    expect(result.current.variant).toBeNull()

    fireEvent.click(screen.getByTitle(/Draw/i))
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

  it('renders custom actions', () => {
    const handleSnapshot = vi.fn()
    render(
      <TestToolbar
        toolbarProps={{
          actions: [
            {
              id: 'snap',
              label: 'Snapshot',
              icon: <span>📸</span>,
              onClick: handleSnapshot,
            },
          ],
        }}
      />,
    )
    const snapBtn = screen.getByTitle('Snapshot')
    expect(snapBtn).toBeDefined()
    fireEvent.click(snapBtn)
    expect(handleSnapshot).toHaveBeenCalled()
  })

  it('opens shape variants on first click and applies the selected kind', () => {
    const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))
    render(<Toolbar controller={result.current} />)

    fireEvent.click(screen.getByTitle(/Shape/i))
    expect(screen.getByText('Shape Type')).toBeDefined()

    fireEvent.click(screen.getByText('Circle'))
    expect(result.current.tool).toBe('shape')
    expect(result.current.variant).toBe('circle')
  })
})
