import { describe, it, expect } from 'vitest'
import { createController } from '../features/controller/index.js'
import { resolveItemStyle } from '../shared/theme/item-style.js'
import type { ArrowItem, NoteItem, ShapeItem, Style } from '../types/items.js'

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

  it('manages pages (add, rename, remove, select)', () => {
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
    expect(note.style?.fill).toBe('solid')
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

  it('unifies the style schema for shapes and notes across contexts', () => {
    const c = createController()

    const sharedStyle: Style = {
      color: 'blue',
      fill: 'solid',
      strokeColor: 'red',
      width: 'l',
      dash: 'dashed',
      radius: 12,
      opacity: 0.8,
      size: 'l',
      weight: 'bold',
      fontStyle: 'italic',
      align: 'center',
    }

    const shape = c.add({
      type: 'shape',
      kind: 'square',
      at: { lat: 41, lng: 28 },
      width: 100,
      height: 100,
      style: sharedStyle,
    }) as ShapeItem

    const note = c.add({
      type: 'note',
      at: { lat: 41, lng: 28 },
      text: 'Unified note',
      style: sharedStyle,
    }) as NoteItem

    const shapeVisual = resolveItemStyle(shape)
    const noteVisual = resolveItemStyle(note)

    // Both interpret the schema consistently:
    expect(shapeVisual.fill).toBe('solid')
    expect(noteVisual.fill).toBe('solid')
    expect(shapeVisual.strokeColor).toBe('#E5484D') // red
    expect(noteVisual.strokeColor).toBe('#E5484D') // red
    expect(shapeVisual.strokeWidth).toBe(4) // 'l'
    expect(noteVisual.strokeWidth).toBe(4) // 'l'
    expect(shapeVisual.dash).toBe('dashed')
    expect(noteVisual.dash).toBe('dashed')
    expect(shapeVisual.radius).toBe(12)
    expect(noteVisual.radius).toBe(12)
    expect(shapeVisual.opacity).toBe(0.8)
    expect(noteVisual.opacity).toBe(0.8)
    expect(shapeVisual.text.fontWeight).toBe('700')
    expect(noteVisual.text.fontWeight).toBe('700')
    expect(shapeVisual.text.fontStyle).toBe('italic')
    expect(noteVisual.text.fontStyle).toBe('italic')
    expect(shapeVisual.text.align).toBe('center')
    expect(noteVisual.text.align).toBe('center')

    // Context differences: shape uses standard drawing palette, note uses surface palette
    expect(shapeVisual.fillColor).toBe('#2F6FEB') // standard blue
    expect(noteVisual.fillColor).toBe('#DBEAFE') // soft note blue surface
    expect(noteVisual.text.color).toBe('#1E3A8A') // dark blue note text
  })

  it('batches uncommitted updates and supports updateMany, duplicate, and reorder', () => {
    const changes: Array<{ reason: string; ids: string[] }> = []
    const c = createController({
      onChange: (_doc, info) => changes.push({ reason: info.reason, ids: info.ids }),
    })

    const s1 = c.add({
      type: 'shape',
      kind: 'square',
      at: { lat: 41, lng: 28 },
      width: 50,
      height: 50,
    })
    const s2 = c.add({
      type: 'shape',
      kind: 'circle',
      at: { lat: 41.1, lng: 28.1 },
      width: 60,
      height: 60,
    })
    expect(changes.length).toBe(2)

    // Uncommitted drag frames should NOT fire onChange
    c.updateMany(
      [
        { id: s1.id, patch: { width: 70 } },
        { id: s2.id, patch: { width: 80 } },
      ],
      false,
    )
    c.updateMany(
      [
        { id: s1.id, patch: { width: 90 } },
        { id: s2.id, patch: { width: 100 } },
      ],
      false,
    )
    expect(changes.length).toBe(2)

    // Commit gesture on mouseup -> fires onChange once and records a single undo step
    c.updateMany(
      [
        { id: s1.id, patch: {} },
        { id: s2.id, patch: {} },
      ],
      true,
    )
    expect(changes.length).toBe(3)
    expect((c.items[0] as ShapeItem).width).toBe(90)
    expect((c.items[1] as ShapeItem).width).toBe(100)

    // Undo restores the state from before the uncommitted gesture started
    c.undo()
    expect((c.items[0] as ShapeItem).width).toBe(50)
    expect((c.items[1] as ShapeItem).width).toBe(60)

    // Duplicate creates offset copies and selects them
    const dupes = c.duplicate([s1.id])
    expect(dupes).toHaveLength(1)
    expect(c.items).toHaveLength(3)
    expect(c.selection).toEqual([dupes[0].id])

    // Reorder items in activePage.items
    c.reorder(s1.id, 'front')
    expect(c.items[c.items.length - 1].id).toBe(s1.id)
    c.reorder(s1.id, 'back')
    expect(c.items[0].id).toBe(s1.id)
  })

  it('supports z-order convenience methods and selectAll', () => {
    const c = createController()
    const s1 = c.add({
      type: 'shape',
      kind: 'square',
      at: { lat: 41, lng: 28 },
      width: 50,
      height: 50,
    })
    const s2 = c.add({
      type: 'shape',
      kind: 'circle',
      at: { lat: 41.05, lng: 28.05 },
      width: 60,
      height: 60,
    })
    const s3 = c.add({
      type: 'shape',
      kind: 'star',
      at: { lat: 41.1, lng: 28.1 },
      width: 70,
      height: 70,
    })

    // Bring to front / send to back / bring forward / send backward
    c.bringToFront(s1.id)
    expect(c.items.map((i) => i.id)).toEqual([s2.id, s3.id, s1.id])

    c.sendToBack(s1.id)
    expect(c.items.map((i) => i.id)).toEqual([s1.id, s2.id, s3.id])

    c.bringForward(s1.id)
    expect(c.items.map((i) => i.id)).toEqual([s2.id, s1.id, s3.id])

    c.sendBackward(s1.id)
    expect(c.items.map((i) => i.id)).toEqual([s1.id, s2.id, s3.id])

    // selectAll selects every item on the page
    c.selectAll()
    expect(c.selection).toHaveLength(3)
  })
})
