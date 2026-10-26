import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react'
import { TextOverlayView } from '../widgets/LeafletTual/overlays/index.js'
import { useKeyboardShortcuts } from '../widgets/LeafletTual/hooks/index.js'
import { useLeafletTual } from '../features/use-leaflet-tual.js'
import { createController } from '../../core/features/controller/index.js'
import type { TextItem } from '../../core/index.js'
import { emptyDoc } from '../../core/index.js'
import { createMockMap } from './test-utils.js'

describe('v2 Text Overlay Component', () => {
  it('renders text annotation on map', () => {
    const map = createMockMap()
    const controller = createController()
    const text = controller.add({
      type: 'text',
      at: { lat: 41, lng: 28 },
      text: 'Bosphorus Strait',
    }) as TextItem

    render(
      <TextOverlayView
        map={map}
        textItem={text}
        controller={controller}
        currentZoom={14}
      />,
    )

    expect(screen.getByText('Bosphorus Strait')).toBeDefined()
  })

  it('switches to inline textarea editor on double click', () => {
    const map = createMockMap()
    const controller = createController()
    const text = controller.add({
      type: 'text',
      at: { lat: 41, lng: 28 },
      text: 'Editable text',
    }) as TextItem

    const { container } = render(
      <TextOverlayView
        map={map}
        textItem={text}
        controller={controller}
        currentZoom={14}
      />,
    )

    const onParentDoubleClick = vi.fn()
    container.addEventListener('dblclick', onParentDoubleClick)

    const textEl = screen.getByText('Editable text')
    fireEvent.doubleClick(textEl)

    expect(screen.getByDisplayValue('Editable text')).toBeDefined()
    expect(onParentDoubleClick).not.toHaveBeenCalled()

    container.removeEventListener('dblclick', onParentDoubleClick)
  })

  it('starts editing selected text on Enter', () => {
    const { result } = renderHook(() => {
      const controller = useLeafletTual({ defaultValue: emptyDoc() })
      useKeyboardShortcuts(controller, () => {})
      return controller
    })

    let textId = ''
    act(() => {
      const text = result.current.add({
        type: 'text',
        at: { lat: 41, lng: 28 },
        text: 'Enter to edit',
      })
      textId = text.id
      result.current.select(textId)
    })

    expect(result.current.editingId).toBeNull()

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    })

    expect(result.current.editingId).toBe(textId)
  })

  it('renders underline text decoration and supports shortcuts and bullets in textarea', () => {
    const map = createMockMap()
    const controller = createController()
    const text = controller.add({
      type: 'text',
      at: { lat: 41, lng: 28 },
      text: '• First line',
      style: {
        weight: 'bold',
        fontStyle: 'italic',
        underline: true,
      },
    }) as TextItem

    const { container } = render(
      <TextOverlayView
        map={map}
        textItem={text}
        controller={controller}
        currentZoom={14}
      />,
    )

    const textEl = screen.getByText('• First line')
    expect(textEl.style.textDecoration).toBe('underline')
    expect(textEl.style.fontWeight).toBe('700')
    expect(textEl.style.fontStyle).toBe('italic')

    // Double click to open editor
    fireEvent.doubleClick(textEl)
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement
    expect(textarea).toBeDefined()
    expect(textarea.style.textDecoration).toBe('underline')

    // Toggle bold via Ctrl+B shortcut
    fireEvent.keyDown(textarea, { key: 'b', ctrlKey: true })
    const updated1 = controller.items.find((it): it is TextItem => it.id === text.id)
    expect(updated1?.style?.weight).toBe('regular')

    // Toggle italic via Ctrl+I shortcut
    fireEvent.keyDown(textarea, { key: 'i', ctrlKey: true })
    const updated2 = controller.items.find((it): it is TextItem => it.id === text.id)
    expect(updated2?.style?.fontStyle).toBe('normal')

    // Toggle underline via Ctrl+U shortcut
    fireEvent.keyDown(textarea, { key: 'u', ctrlKey: true })
    const updated3 = controller.items.find((it): it is TextItem => it.id === text.id)
    expect(updated3?.style?.underline).toBe(false)
  })
})
