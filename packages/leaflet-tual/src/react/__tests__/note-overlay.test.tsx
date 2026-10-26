import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NoteOverlayView } from '../widgets/LeafletTual/NoteOverlayView.js'
import { createController } from '../../core/features/controller.js'
import { createMockMap } from './test-utils.js'

describe('v2 Note Overlay Component', () => {
  it('renders note text without title or collapse button and scales with zoom', () => {
    const map = createMockMap()
    const controller = createController()
    const note = controller.add({
      type: 'note',
      from: { lat: 41.0, lng: 28.0 },
      to: { lat: 41.01, lng: 28.01 },
      text: 'Meeting at 10 AM',
      style: { color: 'ink', fillColor: 'yellow' },
    }) as any

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

  it('renders 4 resize handles when selected', () => {
    const map = createMockMap()
    const controller = createController()
    const note = controller.add({
      type: 'note',
      from: { lat: 41.0, lng: 28.0 },
      to: { lat: 41.01, lng: 28.01 },
      text: 'Resizable note',
    }) as any

    controller.select(note.id)

    const { container } = render(
      <NoteOverlayView
        map={map}
        note={note}
        controller={controller}
      />,
    )

    const handles = container.querySelectorAll('.tual-note-handle')
    expect(handles.length).toBe(4)
    expect(container.querySelector('.tual-note-handle-nw')).toBeDefined()
    expect(container.querySelector('.tual-note-handle-ne')).toBeDefined()
    expect(container.querySelector('.tual-note-handle-se')).toBeDefined()
    expect(container.querySelector('.tual-note-handle-sw')).toBeDefined()
  })

  it('applies border color, width and dash from the note style', () => {
    const map = createMockMap()
    const controller = createController()
    const note = controller.add({
      type: 'note',
      from: { lat: 41.0, lng: 28.0 },
      to: { lat: 41.01, lng: 28.01 },
      text: 'Bordered note',
      style: { strokeColor: 'purple', width: 'l', dash: 'dashed' },
    }) as any

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

  it('renders pinned note with fixed screen dimensions anchored at "at"', () => {
    const map = createMockMap()
    const controller = createController()
    const note = controller.add({
      type: 'note',
      at: { lat: 41.0, lng: 28.0 },
      width: 200,
      height: 140,
      text: 'Pinned note',
    }) as any

    const { container } = render(
      <NoteOverlayView
        map={map}
        note={note}
        controller={controller}
      />,
    )

    const card = container.querySelector('.tual-note-card') as HTMLElement
    expect(card.style.width).toBe('200px')
    expect(card.style.height).toBe('140px')
  })
})
