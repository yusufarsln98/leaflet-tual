import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useLeafletSync } from '../features/use-leaflet-sync.js'
import { createMockMap } from './test-utils.js'

describe('v2 useLeafletSync map event bindings', () => {
  it('subscribes to map move, zoom, viewreset, resize events and calls onRedraw', () => {
    const onRedraw = vi.fn()
    const map = createMockMap()

    const { unmount } = renderHook(() => useLeafletSync(map, onRedraw))

    expect(map.on).toHaveBeenCalledWith('move', expect.any(Function))
    expect(map.on).toHaveBeenCalledWith('zoom', expect.any(Function))
    expect(map.on).toHaveBeenCalledWith('viewreset', expect.any(Function))
    expect(map.on).toHaveBeenCalledWith('resize', expect.any(Function))

    unmount()

    expect(map.off).toHaveBeenCalledWith('move', expect.any(Function))
    expect(map.off).toHaveBeenCalledWith('zoom', expect.any(Function))
    expect(map.off).toHaveBeenCalledWith('viewreset', expect.any(Function))
    expect(map.off).toHaveBeenCalledWith('resize', expect.any(Function))
  })
})
