import type { Doc, Item } from '../types/items.js'
import { createId } from './geometry/geo.js'
import { createTranslator, type TranslationTokens } from './i18n/index.js'

export class DocError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DocError'
  }
}

export function cloneDoc(doc: Doc): Doc {
  return JSON.parse(JSON.stringify(doc))
}

export function emptyDoc(translations?: Partial<TranslationTokens>): Doc {
  const pageId = createId('page')
  const t = createTranslator(translations)
  return {
    version: 2,
    page: pageId,
    pages: [{ id: pageId, name: t('pageDefault', { n: 1 }), items: [] }],
  }
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null

const isFiniteNumber = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v)

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === 'string' && v.length > 0

function isValidGeo(g: unknown): boolean {
  return isRecord(g) && isFiniteNumber(g.lat) && isFiniteNumber(g.lng)
}

function isValidPenPoint(point: unknown): boolean {
  return (
    isRecord(point) &&
    isValidGeo(point.at) &&
    (point.in === undefined || isValidGeo(point.in)) &&
    (point.out === undefined || isValidGeo(point.out))
  )
}

const ARROW_KINDS = new Set(['linear', 'curved', 'elbow', 's-curve'])
const SHAPE_KINDS = new Set([
  'square',
  'circle',
  'star',
  'actor',
  'triangle',
  'diamond',
  'hexagon',
  'marker',
])
const LABEL_POSITIONS = new Set(['top', 'center', 'bottom'])

function isValidItem(item: unknown): item is Item {
  if (!isRecord(item) || !isNonEmptyString(item.id) || !isFiniteNumber(item.createdAt)) {
    return false
  }

  switch (item.type) {
    case 'arrow':
      return (
        typeof item.kind === 'string' &&
        ARROW_KINDS.has(item.kind) &&
        isValidGeo(item.from) &&
        isValidGeo(item.to) &&
        (item.via === undefined || isValidGeo(item.via))
      )
    case 'shape':
      return (
        typeof item.kind === 'string' &&
        SHAPE_KINDS.has(item.kind) &&
        isValidGeo(item.at) &&
        isFiniteNumber(item.width) &&
        isFiniteNumber(item.height) &&
        (item.labelPosition === undefined ||
          (typeof item.labelPosition === 'string' && LABEL_POSITIONS.has(item.labelPosition)))
      )
    case 'freedraw':
      return Array.isArray(item.points) && item.points.every(isValidGeo)
    case 'pen':
      return (
        Array.isArray(item.points) &&
        item.points.every(isValidPenPoint) &&
        (item.closed === undefined || typeof item.closed === 'boolean')
      )
    case 'ruler':
      return isValidGeo(item.from) && isValidGeo(item.to)
    case 'note':
    case 'text':
      return isValidGeo(item.at) && typeof item.text === 'string'
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

  if (!isRecord(docObj)) {
    throw new DocError('Doc must be a valid non-null object')
  }
  if (docObj.version !== 2) {
    throw new DocError(`Invalid Doc version: expected 2, got ${docObj.version}`)
  }
  if (!isNonEmptyString(docObj.page)) {
    throw new DocError('Doc must specify an active page string id')
  }
  if (!Array.isArray(docObj.pages) || docObj.pages.length === 0) {
    throw new DocError('Doc must contain a non-empty pages array')
  }

  const pageIds = new Set<string>()
  for (const page of docObj.pages) {
    if (!isRecord(page)) throw new DocError('Each page must be an object')
    if (!isNonEmptyString(page.id)) throw new DocError('Each page must have a valid string id')
    if (typeof page.name !== 'string') throw new DocError('Each page must have a name')
    if (!Array.isArray(page.items)) throw new DocError(`Page "${page.id}" items must be an array`)

    for (const item of page.items) {
      if (!isValidItem(item)) {
        throw new DocError(`Invalid item in page "${page.id}": ${JSON.stringify(item)}`)
      }
    }

    pageIds.add(page.id)
  }

  if (!pageIds.has(docObj.page)) {
    throw new DocError(`Active page id "${docObj.page}" does not exist in document pages`)
  }

  return docObj as unknown as Doc
}

