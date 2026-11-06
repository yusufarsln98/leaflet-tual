import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, renderHook, screen } from '@testing-library/react'
import { LeafletTual } from '../widgets/LeafletTual/LeafletTual.js'
import { Toolbar } from '../widgets/Toolbar/Toolbar.js'
import { useLeafletTual } from '../features/use-leaflet-tual.js'
import { emptyDoc, type KeyboardShortcutsOptions } from '../../core/index.js'
import { createMockCanvasContext } from '../../core/__tests__/test-utils.js'
import { createMockMap } from './test-utils.js'

function renderToolbar(shortcuts?: boolean | KeyboardShortcutsOptions) {
  const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))
  const view = render(<Toolbar controller={result.current} shortcuts={shortcuts} />)
  return { ...view, controller: result.current }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('configurable keyboard shortcuts', () => {
  it('uses custom tool bindings in toolbar labels', () => {
    renderToolbar({ select: 'Q', freedraw: 'G', pen: 'H' })

    expect(screen.getByTitle('Select (Q)')).toBeDefined()
    expect(screen.getByTitle('Draw (G)')).toBeDefined()

    fireEvent.click(screen.getByLabelText('Draw options'))
    expect(screen.getByText('G')).toBeDefined()
    expect(screen.getByText('H')).toBeDefined()
  })

  it('omits shortcut hints when shortcuts are disabled', () => {
    renderToolbar(false)

    expect(screen.getByTitle('Select')).toBeDefined()
    expect(screen.queryByTitle('Select (V)')).toBeNull()
  })
})

describe('LeafletTual shortcut prop', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      createMockCanvasContext() as never,
    )
  })

  it('applies custom bindings to the keyboard handler and toolbar labels', () => {
    const map = createMockMap()
    const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))
    render(<LeafletTual map={map} controller={result.current} shortcuts={{ note: 'Q' }} />)

    expect(screen.getByTitle('Note (Q)')).toBeDefined()

    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'q', bubbles: true }))
    expect(result.current.tool).toBe('note')

    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'n', bubbles: true }))
    expect(result.current.tool).toBe('note')
  })

  it('disables shortcuts with false', () => {
    const map = createMockMap()
    const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))
    render(<LeafletTual map={map} controller={result.current} shortcuts={false} />)

    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'n', bubbles: true }))
    expect(result.current.tool).toBe('select')
  })
})
