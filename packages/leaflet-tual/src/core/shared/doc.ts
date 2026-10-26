import type { Doc, Item } from '../types/items.js'
import { createId } from './geo.js'

export class DocError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DocError'
  }
}

export function cloneDoc(doc: Doc): Doc {
  return JSON.parse(JSON.stringify(doc))
}

export function emptyDoc(): Doc {
  const pageId = createId('page')
  return {
    version: 2,
    page: pageId,
    pages: [
      {
        id: pageId,
        name: 'Page 1',
        items: [],
      },
    ],
  }
}

function isValidGeo(g: unknown): boolean {
  return (
    typeof g === 'object' &&
    g !== null &&
    typeof (g as any).lat === 'number' &&
    Number.isFinite((g as any).lat) &&
    typeof (g as any).lng === 'number' &&
    Number.isFinite((g as any).lng)
  )
}

function isValidPenPoint(point: unknown): boolean {
  if (typeof point !== 'object' || point === null) return false
  const p = point as any
  return (
    isValidGeo(p.at) &&
    (p.in === undefined || isValidGeo(p.in)) &&
    (p.out === undefined || isValidGeo(p.out))
  )
}

/**
 * Older documents used `type: 'pen'` for freehand strokes. Their points are
 * plain GeoPoints, while a real pen path stores `{ at, in, out }` anchors.
 */
function migrateLegacyFreehand(item: unknown): unknown {
  if (typeof item !== 'object' || item === null) return item
  const it = item as any
  if (it.type !== 'pen' || !Array.isArray(it.points)) return item
  if (!it.points.every(isValidGeo)) return item

  return { ...it, type: 'freedraw' }
}

function isValidItem(item: unknown): item is Item {
  if (typeof item !== 'object' || item === null) return false
  const it = item as any
  if (typeof it.id !== 'string' || !it.id) return false
  if (typeof it.createdAt !== 'number' || !Number.isFinite(it.createdAt)) return false

  switch (it.type) {
    case 'arrow':
      return (
        ['linear', 'curved', 'elbow', 's-curve'].includes(it.kind) &&
        isValidGeo(it.from) &&
        isValidGeo(it.to) &&
        (it.via === undefined || isValidGeo(it.via))
      )
    case 'shape':
      return (
        [
          'square',
          'circle',
          'star',
          'actor',
          'triangle',
          'diamond',
          'hexagon',
          'marker',
        ].includes(it.kind) &&
        isValidGeo(it.from) &&
        isValidGeo(it.to) &&
        (it.labelPosition === undefined ||
          ['top', 'center', 'bottom'].includes(it.labelPosition))
      )
    case 'freedraw':
      return Array.isArray(it.points) && it.points.every(isValidGeo)
    case 'pen':
      return (
        Array.isArray(it.points) &&
        it.points.every(isValidPenPoint) &&
        (it.closed === undefined || typeof it.closed === 'boolean')
      )
    case 'ruler':
      return isValidGeo(it.from) && isValidGeo(it.to)
    case 'note':
      return (
        ((isValidGeo(it.from) && isValidGeo(it.to)) || isValidGeo(it.at)) &&
        typeof it.text === 'string'
      )
    case 'text':
      return isValidGeo(it.at) && typeof it.text === 'string'
    default:
      return false
  }
}

export function parseDoc(input: unknown): Doc {
  let docObj = input
  if (typeof input === 'string') {
    try {
      docObj = JSON.parse(input)
    } catch (e) {
      throw new DocError(`Failed to parse JSON: ${(e as Error).message}`)
    }
  }

  if (typeof docObj !== 'object' || docObj === null) {
    throw new DocError('Doc must be a valid non-null object')
  }

  const d = docObj as any

  if (d.version !== 2) {
    throw new DocError(`Invalid Doc version: expected 2, got ${d.version}`)
  }

  if (typeof d.page !== 'string' || !d.page) {
    throw new DocError('Doc must specify an active page string id')
  }

  if (!Array.isArray(d.pages) || d.pages.length === 0) {
    throw new DocError('Doc must contain a non-empty pages array')
  }

  const pageIds = new Set<string>()
  for (const page of d.pages) {
    if (typeof page !== 'object' || page === null) {
      throw new DocError('Each page must be an object')
    }
    if (typeof page.id !== 'string' || !page.id) {
      throw new DocError('Each page must have a valid string id')
    }
    if (typeof page.name !== 'string') {
      throw new DocError('Each page must have a name')
    }
    if (!Array.isArray(page.items)) {
      throw new DocError(`Page "${page.id}" items must be an array`)
    }
    page.items = page.items.map(migrateLegacyFreehand)
    for (const item of page.items) {
      if (!isValidItem(item)) {
        throw new DocError(
          `Invalid item in page "${page.id}": ${JSON.stringify(item)}`,
        )
      }
    }
    pageIds.add(page.id)
  }

  if (!pageIds.has(d.page)) {
    throw new DocError(
      `Active page id "${d.page}" does not exist in document pages`,
    )
  }

  return d as Doc
}
