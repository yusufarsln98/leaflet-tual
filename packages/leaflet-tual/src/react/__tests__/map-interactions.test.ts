import type L from 'leaflet'
import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useBlockMapDblClick } from '../widgets/LeafletTual/use-block-map-dblclick.js'

describe('double-click map zoom blocking', () => {
  it('blocks double-click zoom and tags target when double clicking inside canvas overlay or inputs', async () => {
    const mapContainer = document.createElement('div')
    document.body.appendChild(mapContainer)

    let zoomEnabled = true
    const mockMap = {
      getContainer: () => mapContainer,
      doubleClickZoom: {
        enabled: vi.fn(() => zoomEnabled),
        enable: vi.fn(() => {
          zoomEnabled = true
        }),
        disable: vi.fn(() => {
          zoomEnabled = false
        }),
      },
    } as unknown as L.Map

    const { unmount } = renderHook(() => useBlockMapDblClick(mockMap))

    const overlay = document.createElement('div')
    overlay.setAttribute('data-rlc-overlay', '')
    const textWrapper = document.createElement('div')
    textWrapper.className = 'rlc-text-wrapper'
    const input = document.createElement('input')
    textWrapper.appendChild(input)
    overlay.appendChild(textWrapper)
    mapContainer.appendChild(overlay)

    // Double-click on input inside overlay
    input.dispatchEvent(
      new MouseEvent('dblclick', { bubbles: true, cancelable: true }),
    )

    // doubleClickZoom was disabled and target flagged
    expect(mockMap.doubleClickZoom.disable).toHaveBeenCalled()
    expect((input as HTMLElement & { _leaflet_disable_events?: boolean })._leaflet_disable_events).toBe(true)

    // After tick, flag is removed and zoom is re-enabled
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect((input as HTMLElement & { _leaflet_disable_events?: boolean })._leaflet_disable_events).toBeUndefined()
    expect(mockMap.doubleClickZoom.enable).toHaveBeenCalled()

    // Double-click on empty map container directly (not in overlay)
    vi.clearAllMocks()
    mapContainer.dispatchEvent(
      new MouseEvent('dblclick', { bubbles: true, cancelable: true }),
    )
    expect(mockMap.doubleClickZoom.disable).not.toHaveBeenCalled()

    unmount()
    document.body.removeChild(mapContainer)
  })

  it('temporarily disables map.dragging when mousedown or touchstart originates on textarea or note resize handle', async () => {
    const mapContainer = document.createElement('div')
    document.body.appendChild(mapContainer)

    let draggingEnabled = true
    const mockMap = {
      getContainer: () => mapContainer,
      dragging: {
        enabled: vi.fn(() => draggingEnabled),
        enable: vi.fn(() => {
          draggingEnabled = true
        }),
        disable: vi.fn(() => {
          draggingEnabled = false
        }),
      },
      doubleClickZoom: {
        enabled: () => true,
        enable: vi.fn(),
        disable: vi.fn(),
      },
    } as unknown as L.Map

    const { unmount } = renderHook(() => useBlockMapDblClick(mockMap))

    const textarea = document.createElement('textarea')
    mapContainer.appendChild(textarea)

    // User mouse-downs on textarea to resize it
    textarea.dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true, cancelable: true }),
    )
    expect(mockMap.dragging.disable).toHaveBeenCalled()

    // User releases mouse
    window.dispatchEvent(new MouseEvent('mouseup'))
    expect(mockMap.dragging.enable).toHaveBeenCalled()

    unmount()
    document.body.removeChild(mapContainer)
  })
})
