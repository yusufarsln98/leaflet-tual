import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLeafletTual } from '../features/use-leaflet-tual.js'
import { emptyDoc } from '../../core/index.js'

describe('v2 Lifecycle callbacks', () => {
  it('calls onChange with Doc and ChangeInfo when items are committed', () => {
    const handleChange = vi.fn()
    const { result } = renderHook(() =>
      useLeafletTual({
        defaultValue: emptyDoc(),
        onChange: handleChange,
      }),
    )

    let arrowId = ''
    act(() => {
      const arrow = result.current.add({
        type: 'arrow',
        kind: 'linear',
        from: { lat: 41, lng: 28 },
        to: { lat: 41.1, lng: 28.1 },
      })
      arrowId = arrow.id
    })

    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ version: 2 }),
      expect.objectContaining({
        reason: 'create',
        committed: true,
        ids: [arrowId],
      }),
    )

    // Uncommitted gesture updates do not spam onChange
    act(() => {
      result.current.update(arrowId, { label: 'Draft 1' }, false)
      result.current.update(arrowId, { label: 'Draft 2' }, false)
    })
    expect(handleChange).toHaveBeenCalledTimes(1)

    // Committing the update triggers onChange once
    act(() => {
      result.current.update(arrowId, { label: 'Final' }, true)
    })
    expect(handleChange).toHaveBeenCalledTimes(2)
  })
})
