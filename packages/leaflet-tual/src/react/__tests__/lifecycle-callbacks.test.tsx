import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLeafletTual } from '../features/use-leaflet-tual.js'
import { emptyDoc } from '../../core/index.js'

describe('v2 Lifecycle callbacks', () => {
  it('calls onChange with Doc and ChangeInfo when items are added', () => {
    const handleChange = vi.fn()
    const { result } = renderHook(() =>
      useLeafletTual({
        defaultValue: emptyDoc(),
        onChange: handleChange,
      }),
    )

    act(() => {
      result.current.add({
        type: 'arrow',
        kind: 'linear',
        from: { lat: 41, lng: 28 },
        to: { lat: 41.1, lng: 28.1 },
      })
    })

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ version: 2 }),
      expect.objectContaining({
        reason: 'create',
        committed: true,
        ids: expect.any(Array),
      }),
    )
  })

  it('calls onSelect when selection changes', () => {
    const handleSelect = vi.fn()
    const { result } = renderHook(() =>
      useLeafletTual({
        defaultValue: emptyDoc(),
        onSelect: handleSelect,
      }),
    )

    let createdId = ''
    act(() => {
      const item = result.current.add({
        type: 'note',
        at: { lat: 41, lng: 28 },
        text: 'Test note',
      })
      createdId = item.id
    })

    act(() => {
      result.current.select(createdId)
    })

    expect(handleSelect).toHaveBeenCalledWith([
      expect.objectContaining({ id: createdId }),
    ])
  })

  it('calls onToolChange when tool changes', () => {
    const handleToolChange = vi.fn()
    const { result } = renderHook(() =>
      useLeafletTual({
        defaultValue: emptyDoc(),
        onToolChange: handleToolChange,
      }),
    )

    act(() => {
      result.current.setTool('shape', 'star')
    })

    expect(handleToolChange).toHaveBeenCalledWith('shape', 'star')
  })
})
