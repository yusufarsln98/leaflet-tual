import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLeafletTual } from '../features/use-leaflet-tual.js'
import { useControllerStore } from '../features/use-controller-store.js'
import { emptyDoc } from '../../core/index.js'

describe('v2 Lifecycle callbacks and real-time streaming', () => {
  it('calls onChange with Doc and ChangeInfo including patches when items are committed', () => {
    const handleChange = vi.fn()
    const handleGesture = vi.fn()
    const { result } = renderHook(() =>
      useLeafletTual({
        defaultValue: emptyDoc(),
        onChange: handleChange,
        onGesture: handleGesture,
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
      expect.objectContaining({ activePageId: expect.any(String) }),
      expect.objectContaining({
        reason: 'create',
        committed: true,
        ids: [arrowId],
        patches: expect.objectContaining({ [arrowId]: expect.anything() }),
      }),
    )

    // Uncommitted gesture updates trigger onGesture with patches, but NOT onChange
    act(() => {
      result.current.update(arrowId, { label: 'Draft 1' }, false)
      result.current.update(arrowId, { label: 'Draft 2' }, false)
    })
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleGesture).toHaveBeenCalledTimes(2)
    expect(handleGesture).toHaveBeenLastCalledWith(
      expect.objectContaining({ activePageId: expect.any(String) }),
      expect.objectContaining({
        reason: 'update',
        committed: false,
        ids: [arrowId],
        patches: { [arrowId]: { label: 'Draft 2' } },
      }),
    )

    // Committing the update triggers onChange with patches
    act(() => {
      result.current.update(arrowId, { label: 'Final' }, true)
    })
    expect(handleChange).toHaveBeenCalledTimes(2)
    expect(handleChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ activePageId: expect.any(String) }),
      expect.objectContaining({
        reason: 'update',
        committed: true,
        ids: [arrowId],
        patches: { [arrowId]: { label: 'Final' } },
      }),
    )
  })

  it('provides atomic Zustand store with useControllerStore selector hook', () => {
    const { result } = renderHook(() =>
      useLeafletTual({
        defaultValue: emptyDoc(),
      }),
    )

    const controller = result.current

    const { result: toolResult } = renderHook(() =>
      useControllerStore(controller, (s) => s.tool),
    )
    expect(toolResult.current).toBe('select')

    act(() => {
      controller.setTool('arrow')
    })
    expect(toolResult.current).toBe('arrow')

    // Fast O(1) item lookup via getItem and itemMap
    act(() => {
      controller.add({
        id: 'box-1',
        type: 'shape',
        kind: 'square',
        at: { lat: 41, lng: 28 },
        width: 100,
        height: 100,
      })
    })

    expect(controller.getItem('box-1')).toBeDefined()
    expect(controller.itemMap['box-1']).toBeDefined()
    expect(controller.store.getState().itemMap['box-1']).toBeDefined()
  })
})
