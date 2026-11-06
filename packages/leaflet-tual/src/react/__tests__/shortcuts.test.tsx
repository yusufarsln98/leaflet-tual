import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, renderHook, screen } from '@testing-library/react'
import { LeafletTual } from '../widgets/LeafletTual/LeafletTual.js'
import { Toolbar } from '../widgets/Toolbar/Toolbar.js'
import { useLeafletTual } from '../features/use-leaflet-tual.js'
import { emptyDoc } from '../../core/index.js'
import { createMockCanvasContext } from '../../core/__tests__/test-utils.js'
import { createMockMap } from './test-utils.js'

function pressNote() {
  document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'n', bubbles: true }))
}

describe('shortcuts prop', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      createMockCanvasContext() as never,
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('keeps shortcuts enabled by default', () => {
    const map = createMockMap()
    const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))
    render(<LeafletTual map={map} controller={result.current} />)

    pressNote()
    expect(result.current.tool).toBe('note')
  })

  it('does not install keyboard shortcuts when disabled', () => {
    const map = createMockMap()
    const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))
    render(<LeafletTual map={map} controller={result.current} shortcuts={false} />)

    pressNote()
    expect(result.current.tool).toBe('select')
  })

  it('hides shortcut hints from toolbar labels when disabled', () => {
    const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))
    render(<Toolbar controller={result.current} shortcuts={false} />)

    expect(screen.getByTitle('Select')).toBeDefined()
    expect(screen.queryByTitle('Select (V)')).toBeNull()
  })
})
