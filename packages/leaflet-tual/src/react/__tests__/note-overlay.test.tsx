import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { NoteItem } from '../../core/index.js'
import { NoteOverlayView } from '../widgets/LeafletTual/overlays/index.js'
import { createController } from '../../core/features/controller/index.js'
import { createMockMap } from './test-utils.js'

describe('v2 Note Overlay Component', () => {
  it('renders note text without title or collapse button and scales with zoom', () => {
    const map = createMockMap()
    const controller = createController()
    const note = controller.add({
      type: 'note',
      at: { lat: 41.0, lng: 28.0 },
      width: 180,
      height: 180,
      text: 'Meeting at 10 AM',
      style: { color: 'ink', fillColor: 'yellow' },
    }) as NoteItem

    const { container } = render(
      <NoteOverlayView
        map={map}
        note={note}
        controller={controller}
      />,
    )

    // No title input exists
    expect(container.querySelector('.tual-note-title')).toBeNull()
    // Textarea contains note text
    expect(screen.getByDisplayValue('Meeting at 10 AM')).toBeDefined()

    const card = container.querySelector('.tual-note-card') as HTMLElement
    expect(card).toBeDefined()
    expect(card.style.position).toBe('absolute')
    // Has width and height determined by geographic bounds
    expect(card.style.width).toBeDefined()
    expect(card.style.height).toBeDefined()
  })

  it('renders 8 resize handles (4 corners + 4 edges) when selected', () => {
    const map = createMockMap()
    const controller = createController()
    const note = controller.add({
      type: 'note',
      at: { lat: 41.0, lng: 28.0 },
      width: 180,
      height: 180,
      text: 'Resizable note',
    }) as NoteItem

    controller.select(note.id)

    const { container } = render(
      <NoteOverlayView
        map={map}
        note={note}
        controller={controller}
      />,
    )

    const handles = container.querySelectorAll('.tual-note-handle')
    expect(handles.length).toBe(8)
    expect(container.querySelector('.tual-note-handle-nw')).toBeDefined()
    expect(container.querySelector('.tual-note-handle-ne')).toBeDefined()
    expect(container.querySelector('.tual-note-handle-se')).toBeDefined()
    expect(container.querySelector('.tual-note-handle-sw')).toBeDefined()
    expect(container.querySelector('.tual-note-handle-n')).toBeDefined()
    expect(container.querySelector('.tual-note-handle-s')).toBeDefined()
    expect(container.querySelector('.tual-note-handle-w')).toBeDefined()
    expect(container.querySelector('.tual-note-handle-e')).toBeDefined()
  })

  it('applies border color, width and dash from the note style', () => {
    const map = createMockMap()
    const controller = createController()
    const note = controller.add({
      type: 'note',
      at: { lat: 41.0, lng: 28.0 },
      width: 180,
      height: 180,
      text: 'Bordered note',
      style: { strokeColor: 'purple', width: 'l', dash: 'dashed' },
    }) as NoteItem

    const { container } = render(
      <NoteOverlayView
        map={map}
        note={note}
        controller={controller}
      />,
    )

    const card = container.querySelector('.tual-note-card') as HTMLElement
    expect(card.style.borderWidth).toBe('4px')
    expect(card.style.borderStyle).toBe('dashed')
    expect(card.style.borderColor).toBe('rgb(142, 78, 198)')
  })

  it('applies matching harmonious border color instead of black by default', () => {
    const map = createMockMap()
    const controller = createController()
    const note = controller.add({
      type: 'note',
      at: { lat: 41.0, lng: 28.0 },
      text: 'Default note without custom stroke',
    }) as NoteItem

    const { container } = render(
      <NoteOverlayView
        map={map}
        note={note}
        controller={controller}
      />,
    )

    const card = container.querySelector('.tual-note-card') as HTMLElement
    // Harmonious yellow border #EAD67A (rgb(234, 214, 122)), NOT black (rgb(29, 29, 27))
    expect(card.style.borderColor).toBe('rgb(234, 214, 122)')
  })

  it('renders note anchored at "at" with width and height scaling with zoom', () => {
    const map = createMockMap()
    const controller = createController()
    const note = controller.add({
      type: 'note',
      at: { lat: 41.0, lng: 28.0 },
      width: 240,
      height: 160,
      text: 'Rectangular note',
    }) as NoteItem

    const { container } = render(
      <NoteOverlayView
        map={map}
        note={note}
        controller={controller}
      />,
    )

    const card = container.querySelector('.tual-note-card') as HTMLElement
    // At zoom 14 with baseZoom 13, scale is 2x: transform scales the card by 2x
    expect(card.style.width).toBe('240px')
    expect(card.style.height).toBe('160px')
    expect(card.style.transform).toContain('scale(2)')
  })

  it('allows growing and shrinking horizontally, vertically and diagonally', () => {
    const map = createMockMap()
    const controller = createController()
    const note = controller.add({
      type: 'note',
      at: { lat: 41.0, lng: 28.0 },
      width: 180,
      height: 180,
      baseZoom: 14,
      text: 'Resize directions note',
    }) as NoteItem

    controller.select(note.id)

    const { container } = render(
      <NoteOverlayView
        map={map}
        note={note}
        controller={controller}
      />,
    )

    // 1. Horizontal resize handle 'e'
    const eastHandle = container.querySelector('.tual-note-handle-e') as HTMLElement
    expect(eastHandle).toBeDefined()
    fireEvent.pointerDown(eastHandle, { clientX: 190, clientY: 100 })
    window.dispatchEvent(new MouseEvent('pointermove', { clientX: 250, clientY: 100 } as any))
    window.dispatchEvent(new MouseEvent('pointerup', { clientX: 250, clientY: 100 } as any))

    let updated = controller.items.find((i) => i.id === note.id) as NoteItem
    expect(updated.width).toBeGreaterThan(180)
    expect(updated.height).toBe(180) // Height unchanged!

    // 2. Vertical resize handle 's'
    const southHandle = container.querySelector('.tual-note-handle-s') as HTMLElement
    expect(southHandle).toBeDefined()
    fireEvent.pointerDown(southHandle, { clientX: 100, clientY: 190 })
    window.dispatchEvent(new MouseEvent('pointermove', { clientX: 100, clientY: 260 } as any))
    window.dispatchEvent(new MouseEvent('pointerup', { clientX: 100, clientY: 260 } as any))

    updated = controller.items.find((i) => i.id === note.id) as NoteItem
    expect(updated.height).toBeGreaterThan(180)

    // 3. Diagonal resize handle 'se' can change both width and height independently
    const seHandle = container.querySelector('.tual-note-handle-se') as HTMLElement
    expect(seHandle).toBeDefined()
    fireEvent.pointerDown(seHandle, { clientX: 190, clientY: 190 })
    window.dispatchEvent(new MouseEvent('pointermove', { clientX: 300, clientY: 220 } as any))
    window.dispatchEvent(new MouseEvent('pointerup', { clientX: 300, clientY: 220 } as any))

    updated = controller.items.find((i) => i.id === note.id) as NoteItem
    expect(updated.width).toBeDefined()
    expect(updated.height).toBeDefined()
  })

  it('hides vertical scrollbar while note is not focused, and shows on focus', () => {
    const map = createMockMap()
    const controller = createController()
    const note = controller.add({
      type: 'note',
      at: { lat: 41.0, lng: 28.0 },
      width: 180,
      text: 'Long note content...',
    }) as NoteItem

    const { container } = render(
      <NoteOverlayView
        map={map}
        note={note}
        controller={controller}
      />,
    )

    const textarea = container.querySelector('.tual-note-textarea') as HTMLTextAreaElement
    expect(textarea).not.toBeNull()
    // When not focused: overflow-y is hidden
    expect(textarea.style.overflowY).toBe('hidden')
    expect(textarea.getAttribute('data-focused')).toBe('false')

    // On focus: overflow-y becomes auto
    fireEvent.focus(textarea)
    expect(textarea.style.overflowY).toBe('auto')
    expect(textarea.getAttribute('data-focused')).toBe('true')

    // On blur: overflow-y returns to hidden
    fireEvent.blur(textarea)
    expect(textarea.style.overflowY).toBe('hidden')
    expect(textarea.getAttribute('data-focused')).toBe('false')
  })
})
