import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react'
import { LeafletTual, useLeafletTual } from '../index.js'
import { emptyDoc } from '../../core/index.js'
import { createMockMap } from './test-utils.js'

describe('v2 ReadOnly mode', () => {
  it('initializes controller in readOnly mode', () => {
    const { result } = renderHook(() =>
      useLeafletTual({
        readOnly: true,
        defaultValue: emptyDoc(),
      }),
    )

    expect(result.current.readOnly).toBe(true)

    act(() => {
      result.current.setReadOnly(false)
    })
    expect(result.current.readOnly).toBe(false)
  })

  it('hides toolbar by default when readOnly is true', () => {
    const map = createMockMap()
    render(<LeafletTual map={map} readOnly={true} defaultValue={emptyDoc()} />)
    expect(screen.queryByTitle(/Pen/i)).toBeNull()
  })

  it('shows toolbar in readOnly if toolbar prop is explicitly configured', () => {
    const map = createMockMap()
    render(
      <LeafletTual
        map={map}
        readOnly={true}
        toolbar={{ tools: ['select'] }}
        defaultValue={emptyDoc()}
      />,
    )
    expect(screen.getByTitle(/Select/i)).toBeDefined()
  })
})
