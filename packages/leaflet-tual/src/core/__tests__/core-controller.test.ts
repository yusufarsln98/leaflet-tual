import { describe, it, expect } from 'vitest'
import { createController } from '../features/controller/index.js'
import type { ArrowItem } from '../types/items.js'

describe('v2 Controller state machine', () => {
  it('initializes with default doc, selection and tool', () => {
    const c = createController()
    expect(c.doc.version).toBe(2)
    expect(c.items).toEqual([])
    expect(c.tool).toBe('select')
    expect(c.selection).toEqual([])
    expect(c.canUndo).toBe(false)
    expect(c.canRedo).toBe(false)
  })

  it('adds items, updates, and supports undo/redo', () => {
    const c = createController()
    const arrow = c.add({
      type: 'arrow',
      kind: 'curved',
      from: { lat: 41, lng: 28 },
      to: { lat: 41.1, lng: 28.1 },
      label: 'Route',
    })

    expect(c.items.length).toBe(1)
    expect(c.items[0].id).toBe(arrow.id)
    expect(c.canUndo).toBe(true)

    // Update item label
    c.update(arrow.id, { label: 'Updated Route' })
    expect((c.items[0] as ArrowItem).label).toBe('Updated Route')

    // Undo update
    c.undo()
    expect((c.items[0] as ArrowItem).label).toBe('Route')

    // Undo add
    c.undo()
    expect(c.items.length).toBe(0)

    // Redo add
    c.redo()
    expect(c.items.length).toBe(1)
    expect((c.items[0] as ArrowItem).label).toBe('Route')
  })

  it('manages pages (add, rename, duplicate, remove, select)', () => {
    const c = createController()
    const initialPageId = c.pages.active
    expect(c.pages.list.length).toBe(1)

    // Add page
    const page2Id = c.pages.add('Phase 2')
    expect(c.pages.list.length).toBe(2)
    expect(c.pages.active).toBe(page2Id)

    // Rename
    c.pages.rename(page2Id, 'Phase 2 · Routes')
    expect(c.pages.list.find((p) => p.id === page2Id)?.name).toBe('Phase 2 · Routes')

    // Select page 1
    c.pages.select(initialPageId)
    expect(c.pages.active).toBe(initialPageId)

    // Remove page 2
    c.pages.remove(page2Id)
    expect(c.pages.list.length).toBe(1)

    // Cannot remove last remaining page
    c.pages.remove(initialPageId)
    expect(c.pages.list.length).toBe(1)
  })

  it('uses proper initial default colors for newly created shapes and notes', () => {
    const c = createController()
    expect(c.style.color).toBe('blue')

    const shape = c.add({
      type: 'shape',
      kind: 'square',
      at: { lat: 41.05, lng: 28.05 },
      width: 100,
      height: 100,
    })
    expect(shape.style?.color).toBe('blue')
    expect(shape.style?.fill).toBe('tint')

    const note = c.add({
      type: 'note',
      at: { lat: 41, lng: 28 },
      text: 'Default note',
    })
    expect(note.style?.color).toBe('yellow')
    expect(note.style?.fillColor).toBe('yellow')
  })

  it('selection-aware setStyle modifies selected items', () => {
    const c = createController()
    const item = c.add({
      type: 'freedraw',
      points: [
        { lat: 41, lng: 28 },
        { lat: 41.1, lng: 28.1 },
      ],
    })

    c.select(item.id)
    expect(c.selection).toEqual([item.id])

    c.setStyle({ color: 'blue', width: 'l' })
    expect(c.items[0].style?.color).toBe('blue')
    expect(c.items[0].style?.width).toBe('l')
  })

  it('honors the initial shape color without pinning fill and stroke overrides', () => {
    const c = createController({ style: { color: 'green' } })
    const shape = c.add({
      type: 'shape',
      kind: 'square',
      at: { lat: 41.05, lng: 28.05 },
      width: 100,
      height: 100,
    })

    expect(shape.style?.color).toBe('green')
    expect(shape.style?.fillColor).toBeUndefined()
    expect(shape.style?.strokeColor).toBeUndefined()
  })

  it('propagates a shape\'s primary color to its fill and stroke', () => {
    const c = createController()
    const shape = c.add({
      type: 'shape',
      kind: 'square',
      at: { lat: 41.05, lng: 28.05 },
      width: 100,
      height: 100,
    })

    c.select(shape.id)
    c.setStyle({ color: 'red' })

    expect(c.selected[0].style).toMatchObject({
      color: 'red',
      fillColor: 'red',
      strokeColor: 'red',
    })

    // The next shape drawn inherits the updated primary color too.
    c.select(null)
    const nextShape = c.add({
      type: 'shape',
      kind: 'circle',
      at: { lat: 41, lng: 28 },
      width: 100,
      height: 100,
    })
    expect(nextShape.style).toMatchObject({
      color: 'red',
      fillColor: 'red',
      strokeColor: 'red',
    })
  })

  it('remembers the last-used variant for shape and arrow tools', () => {
    const c = createController()

    c.setTool('shape', 'circle')
    c.setTool('select')
    c.setTool('shape')
    expect(c.variant).toBe('circle')

    c.setTool('arrow', 'curved')
    c.setTool('shape')
    expect(c.variant).toBe('circle')

    c.setTool('arrow')
    expect(c.variant).toBe('curved')

    // Other tools never carry a variant.
    c.setTool('pen')
    expect(c.variant).toBeNull()
  })
})
