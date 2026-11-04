import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react'
import { SecondaryTooltip } from '../widgets/SecondaryTooltip/SecondaryTooltip.js'
import { useLeafletTual } from '../features/use-leaflet-tual.js'
import { emptyDoc } from '../../core/index.js'
import { createMockMap } from './test-utils.js'

describe('secondary tooltip color dropdown active state', () => {
  it('marks the color swatch active while its dropdown is open', () => {
    const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))

    act(() => {
      const shape = result.current.add({
        type: 'shape',
        kind: 'square',
        at: { lat: 41.05, lng: 28.05 },
        width: 100,
        height: 100,
        style: { color: '#2F6FEB' },
      })
      result.current.select(shape.id)
    })

    render(<SecondaryTooltip map={createMockMap()} controller={result.current} />)
    const colorButton = screen.getByTitle('Color')

    expect(colorButton.getAttribute('data-active')).toBe('false')

    fireEvent.click(colorButton)
    expect(colorButton.getAttribute('data-active')).toBe('true')

    fireEvent.click(colorButton)
    expect(colorButton.getAttribute('data-active')).toBe('false')
  })

  it('only marks the dropdown that is currently open', () => {
    const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))

    act(() => {
      const note = result.current.add({
        type: 'note',
        at: { lat: 41.05, lng: 28.05 },
        text: 'Note',
      })
      result.current.select(note.id)
    })

    render(<SecondaryTooltip map={createMockMap()} controller={result.current} />)
    const backgroundButton = screen.getByTitle('Color')
    const textButton = screen.getByTitle('Text Color')

    fireEvent.click(backgroundButton)
    expect(backgroundButton.getAttribute('data-active')).toBe('true')
    expect(textButton.getAttribute('data-active')).toBe('false')

    fireEvent.click(textButton)
    expect(backgroundButton.getAttribute('data-active')).toBe('false')
    expect(textButton.getAttribute('data-active')).toBe('true')
  })
})
