import { describe, it, expect } from 'vitest'
import type {
  ArrowItem,
  FreedrawItem,
  NoteItem,
  PenItem,
  ShapeItem,
} from '../types/items.js'
import { toWorld } from '../shared/geometry/coordinates.js'
import { translateItem, worldDelta } from '../shared/geometry/translate.js'

describe('world-space item translation', () => {
  const start = { lat: 41.0082, lng: 28.9784 }
  const end = { lat: 41.0317, lng: 29.0121 }
  const delta = worldDelta(start, end)

  it('moves a shape by exactly the world-space pointer delta', () => {
    const shape: ShapeItem = {
      id: 'shape',
      type: 'shape',
      kind: 'square',
      at: { lat: 41.01, lng: 28.98 },
      width: 100,
      height: 100,
      createdAt: 0,
    }

    const patch = translateItem(shape, delta) as Partial<ShapeItem>
    const originalAt = toWorld(shape.at)
    const movedAt = toWorld(patch.at!)

    expect(movedAt.x - originalAt.x).toBeCloseTo(delta.x, 6)
    expect(movedAt.y - originalAt.y).toBeCloseTo(delta.y, 6)
  })

  it('keeps a shape size intact when the drag spans different latitudes', () => {
    const shape: ShapeItem = {
      id: 'shape',
      type: 'shape',
      kind: 'circle',
      at: { lat: 41.025, lng: 29.005 },
      width: 120,
      height: 120,
      createdAt: 0,
    }

    const patch = translateItem(shape, delta) as Partial<ShapeItem>
    const originalAt = toWorld(shape.at)
    const movedAt = toWorld(patch.at!)

    expect(movedAt.x - originalAt.x).toBeCloseTo(delta.x, 6)
    expect(movedAt.y - originalAt.y).toBeCloseTo(delta.y, 6)
    expect(shape.width).toBe(120)
    expect(shape.height).toBe(120)
  })

  it('moves the control point of a curved arrow with the item', () => {
    const arrow: ArrowItem = {
      id: 'arrow',
      type: 'arrow',
      kind: 'curved',
      from: { lat: 41.0, lng: 28.97 },
      to: { lat: 41.02, lng: 28.99 },
      via: { lat: 41.03, lng: 28.96 },
      createdAt: 0,
    }

    const patch = translateItem(arrow, delta) as Partial<ArrowItem>
    const originalVia = toWorld(arrow.via!)
    const movedVia = toWorld(patch.via!)

    expect(movedVia.x - originalVia.x).toBeCloseTo(delta.x, 6)
    expect(movedVia.y - originalVia.y).toBeCloseTo(delta.y, 6)
  })

  it('moves every freedraw point and note position', () => {
    const freedraw: FreedrawItem = {
      id: 'freedraw',
      type: 'freedraw',
      points: [
        { lat: 41.0, lng: 28.97 },
        { lat: 41.01, lng: 28.98 },
        { lat: 41.02, lng: 28.99 },
      ],
      createdAt: 0,
    }
    const note: NoteItem = {
      id: 'note',
      type: 'note',
      at: { lat: 41.015, lng: 28.985 },
      text: 'Meet here',
      createdAt: 0,
    }

    const freedrawPatch = translateItem(freedraw, delta) as Partial<FreedrawItem>
    const notePatch = translateItem(note, delta) as Partial<NoteItem>

    freedraw.points.forEach((point, index) => {
      const original = toWorld(point)
      const moved = toWorld(freedrawPatch.points![index])
      expect(moved.x - original.x).toBeCloseTo(delta.x, 6)
      expect(moved.y - original.y).toBeCloseTo(delta.y, 6)
    })

    const originalAt = toWorld(note.at!)
    const movedAt = toWorld(notePatch.at!)
    expect(movedAt.x - originalAt.x).toBeCloseTo(delta.x, 6)
    expect(movedAt.y - originalAt.y).toBeCloseTo(delta.y, 6)
  })

  it('moves pen anchors and their bezier handles', () => {
    const pen: PenItem = {
      id: 'pen',
      type: 'pen',
      points: [
        { at: { lat: 41.0, lng: 28.97 } },
        {
          at: { lat: 41.02, lng: 28.99 },
          in: { lat: 41.01, lng: 28.98 },
          out: { lat: 41.03, lng: 29.0 },
        },
      ],
      createdAt: 0,
    }

    const patch = translateItem(pen, delta) as Partial<PenItem>
    const patchPoint = patch.points![1]

    for (const [original, moved] of [
      [pen.points[1].at, patchPoint.at],
      [pen.points[1].in!, patchPoint.in!],
      [pen.points[1].out!, patchPoint.out!],
    ] as const) {
      const originalWorld = toWorld(original)
      const movedWorld = toWorld(moved)
      expect(movedWorld.x - originalWorld.x).toBeCloseTo(delta.x, 6)
      expect(movedWorld.y - originalWorld.y).toBeCloseTo(delta.y, 6)
    }
  })
})
