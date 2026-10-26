import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, renderHook, act } from '@testing-library/react'
import { LeafletTual, useLeafletTual } from '../index.js'
import { emptyDoc } from '../../core/index.js'
import { createMockMap } from './test-utils.js'

vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)

describe('v2 map zoom interactions', () => {
  it('does not disable scroll wheel zoom on hover, only while an item is selected', () => {
    const { result } = renderHook(() =>
      useLeafletTual({
        defaultValue: emptyDoc(),
      }),
    )

    let noteId = ''
    act(() => {
      const note = result.current.add({
        type: 'note',
        at: { lat: 41, lng: 28 },
        text: 'Hover me',
      })
      noteId = note.id
    })

    const map = createMockMap()
    const { container } = render(
      <LeafletTual map={map} controller={result.current} toolbar={false} />,
    )

    const card = container.querySelector('.tual-note-card') as HTMLElement
    expect(card).not.toBeNull()

    // Hovering must not block map zoom.
    expect(map.scrollWheelZoom?.enabled()).toBe(true)
    fireEvent.mouseEnter(card)
    expect(map.scrollWheelZoom?.enabled()).toBe(true)
    fireEvent.mouseLeave(card)
    expect(map.scrollWheelZoom?.enabled()).toBe(true)

    // Focusing (selecting) an item keeps the map from zooming underneath it.
    act(() => {
      result.current.select(noteId)
    })
    expect(map.scrollWheelZoom?.enabled()).toBe(false)

    // Deselecting restores normal map zoom.
    act(() => {
      result.current.select(null)
    })
    expect(map.scrollWheelZoom?.enabled()).toBe(true)
  })
})
