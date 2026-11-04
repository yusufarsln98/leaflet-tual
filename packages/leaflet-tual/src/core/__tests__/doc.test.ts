import { describe, it, expect } from 'vitest'
import { emptyDoc, parseDoc, DocError, getPageItems } from '../index.js'

describe('Doc data model & parseDoc', () => {
  it('creates valid empty document', () => {
    const doc = emptyDoc()
    expect(typeof doc.activePageId).toBe('string')
    expect(doc.pages.length).toBe(1)
    expect(doc.pages[0].id).toBe(doc.activePageId)
    expect(doc.pages[0].name).toBe('Page 1')
    expect(doc.pages[0].items).toEqual({})
    expect(doc.pages[0].order).toEqual([])
  })

  it('validates a valid document with parseDoc', () => {
    const doc = emptyDoc()
    const parsed = parseDoc(doc)
    expect(parsed).toEqual(doc)

    const json = JSON.stringify(doc)
    const parsedJson = parseDoc(json)
    expect(parsedJson.activePageId).toBe(doc.activePageId)
  })

  it('rejects array items and enforces Record with order in parseDoc', () => {
    const invalidArrayDoc = {
      activePageId: 'p1',
      pages: [
        {
          id: 'p1',
          name: 'Page 1',
          items: [
            { id: 'shape-1', type: 'shape', kind: 'circle', at: { lat: 41, lng: 28 }, width: 50, height: 50, createdAt: 1 },
          ],
        },
      ],
    }
    expect(() => parseDoc(invalidArrayDoc)).toThrow(DocError)

    const validDoc = {
      activePageId: 'p1',
      pages: [
        {
          id: 'p1',
          name: 'Page 1',
          items: {
            'shape-1': { id: 'shape-1', type: 'shape', kind: 'circle', at: { lat: 41, lng: 28 }, width: 50, height: 50, createdAt: 1 },
          },
          order: ['shape-1'],
        },
      ],
    }
    const parsed = parseDoc(validDoc)
    expect(parsed.pages[0].items['shape-1']).toBeDefined()
    expect(parsed.pages[0].order).toEqual(['shape-1'])
    expect(getPageItems(parsed.pages[0])).toHaveLength(1)
  })

  it('validates bezier pen items and rejects flat points on pen items', () => {
    const doc = emptyDoc()
    doc.pages[0].items['pen-1'] = {
      id: 'pen-1',
      type: 'pen',
      points: [
        { at: { lat: 41, lng: 28 } },
        {
          at: { lat: 41.1, lng: 28.1 },
          in: { lat: 41.05, lng: 28.02 },
          out: { lat: 41.2, lng: 28.15 },
        },
      ],
      closed: false,
      createdAt: 1,
    }
    doc.pages[0].order = ['pen-1']

    expect(() => parseDoc(doc)).not.toThrow()

    const invalidPen = {
      activePageId: 'p1',
      pages: [
        {
          id: 'p1',
          name: 'Page 1',
          items: [
            {
              id: 'invalid-pen',
              type: 'pen',
              points: [
                { lat: 41, lng: 28 },
                { lat: 41.1, lng: 28.1 },
              ],
              createdAt: 1,
            },
          ],
        },
      ],
    }

    expect(() => parseDoc(invalidPen)).toThrow(DocError)
  })

  it('throws DocError on invalid doc or missing active page', () => {
    expect(() => parseDoc(null)).toThrow(DocError)
    expect(() => parseDoc({})).toThrow(DocError)
    expect(() => parseDoc({ activePageId: 'p1', pages: [] })).toThrow(DocError)
    expect(() =>
      parseDoc({
        activePageId: 'p1',
        pages: [{ id: 'other', name: 'Page 1', items: {}, order: [] }],
      }),
    ).toThrow(DocError)
  })
})
