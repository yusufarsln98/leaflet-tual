import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react'
import { useLeafletTual } from '../features/use-leaflet-tual.js'
import { InlineShapeLabelEditor } from '../widgets/LeafletTual/InlineShapeLabelEditor.js'
import { useKeyboardShortcuts } from '../widgets/LeafletTual/use-keyboard-shortcuts.js'
import { emptyDoc } from '../../core/index.js'
import { createMockMap } from './test-utils.js'

describe('v2 Shape label editing & edit(id) action', () => {
  it('toggles editingId via controller.edit', () => {
    const { result } = renderHook(() =>
      useLeafletTual({
        defaultValue: emptyDoc(),
      }),
    )

    let shapeId = ''
    act(() => {
      const s = result.current.add({
        type: 'shape',
        kind: 'square',
        from: { lat: 41, lng: 28 },
        to: { lat: 41.1, lng: 28.1 },
      })
      shapeId = s.id
    })

    expect(result.current.editingId).toBeNull()

    act(() => {
      result.current.edit(shapeId)
    })
    expect(result.current.editingId).toBe(shapeId)

    act(() => {
      result.current.update(shapeId, { label: 'Zone 1' })
      result.current.edit(null)
    })
    expect(result.current.editingId).toBeNull()
    expect((result.current.items[0] as any).label).toBe('Zone 1')
  })

  it('activates shape label editing on Enter key', () => {
    const { result } = renderHook(() => {
      const c = useLeafletTual({ defaultValue: emptyDoc() })
      useKeyboardShortcuts(c, () => {})
      return c
    })

    let shapeId = ''
    act(() => {
      const s = result.current.add({
        type: 'shape',
        kind: 'circle',
        from: { lat: 41, lng: 28 },
        to: { lat: 41.1, lng: 28.1 },
      })
      shapeId = s.id
      result.current.select(shapeId)
    })

    expect(result.current.editingId).toBeNull()

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    })

    expect(result.current.editingId).toBe(shapeId)
  })

  it('renders inline shape label editor and updates shape label', () => {
    const { result } = renderHook(() =>
      useLeafletTual({
        defaultValue: emptyDoc(),
      }),
    )

    let shape: any
    act(() => {
      shape = result.current.add({
        type: 'shape',
        kind: 'circle',
        from: { lat: 41, lng: 28 },
        to: { lat: 41.1, lng: 28.1 },
        label: 'Initial Label',
      })
      result.current.select(shape.id)
    })

    const map = createMockMap()
    render(
      <InlineShapeLabelEditor
        map={map}
        shape={shape}
        controller={result.current}
      />,
    )

    const input = screen.getByPlaceholderText('Add label...') as HTMLInputElement
    expect(input.value).toBe('Initial Label')

    fireEvent.change(input, { target: { value: 'Updated Label' } })
    expect((result.current.items[0] as any).label).toBe('Updated Label')
  })
})
