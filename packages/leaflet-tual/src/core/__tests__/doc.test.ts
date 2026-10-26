import { describe, it, expect } from 'vitest'
import { emptyDoc, parseDoc, DocError } from '../index.js'

describe('v2 Doc data model & parseDoc', () => {
  it('creates valid empty document', () => {
    const doc = emptyDoc()
    expect(doc.version).toBe(2)
    expect(typeof doc.page).toBe('string')
    expect(doc.pages.length).toBe(1)
    expect(doc.pages[0].id).toBe(doc.page)
    expect(doc.pages[0].name).toBe('Page 1')
    expect(doc.pages[0].items).toEqual([])
  })

  it('validates a valid document with parseDoc', () => {
    const doc = emptyDoc()
    const parsed = parseDoc(doc)
    expect(parsed).toEqual(doc)

    const json = JSON.stringify(doc)
    const parsedJson = parseDoc(json)
    expect(parsedJson.version).toBe(2)
  })

  it('validates bezier pen items and migrates legacy freehand pen items', () => {
    const doc = emptyDoc()
    doc.pages[0].items.push({
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
    })

    expect(() => parseDoc(doc)).not.toThrow()

    const legacy = {
      version: 2,
      page: 'p1',
      pages: [
        {
          id: 'p1',
          name: 'Page 1',
          items: [
            {
              id: 'legacy-pen',
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

    const migrated = parseDoc(legacy)
    expect(migrated.pages[0].items[0].type).toBe('freedraw')
  })

  it('throws DocError on invalid doc or wrong version', () => {
    expect(() => parseDoc(null)).toThrow(DocError)
    expect(() => parseDoc({})).toThrow(DocError)
    expect(() => parseDoc({ version: 1, page: 'p1', pages: [] })).toThrow(DocError)
    expect(() =>
      parseDoc({
        version: 2,
        page: 'p1',
        pages: [{ id: 'other', name: 'Page 1', items: [] }],
      }),
    ).toThrow(DocError)
  })
})

