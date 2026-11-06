import type { Doc, Page } from './types.js'
import type { Item } from '../item/types.js'
import { createTranslator, type TranslationTokens } from '../../shared/i18n/index.js'
import { ARROW_KINDS } from '../item/arrow/model.js'
import { SHAPE_KINDS, LABEL_POSITIONS } from '../item/shape/model.js'
import { isValidPenPoint } from '../item/pen/model.js'
import { createId } from '../../shared/geometry/coordinates.js'

export { createId }

export class DocError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DocError'
  }
}

export function getPageItems(page: Page): Item[] {
  if (!page || !page.items || !page.order) return []
  const result: Item[] = []
  for (const id of page.order) {
    const item = page.items[id]
    if (item) result.push(item)
  }
  return result
}

export function cloneDoc(doc: Doc): Doc {
  return JSON.parse(JSON.stringify(doc))
}

export function emptyDoc(translations?: Partial<TranslationTokens>): Doc {
  const pageId = createId('page')
  const t = createTranslator(translations)
  return {
    activePageId: pageId,
    pages: [{ id: pageId, name: t('pageDefault', { n: 1 }), items: {}, order: [] }],
  }
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null

const isFiniteNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v.length > 0

function isValidGeo(g: unknown): boolean {
  return isRecord(g) && isFiniteNumber(g.lat) && isFiniteNumber(g.lng)
}

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
    case 'area':
      return Array.isArray(item.points) && item.points.length >= 3 && item.points.every(isValidGeo)
    case 'note':
    case 'text':
      return isValidGeo(item.at) && typeof item.text === 'string'
    default:
      return false
  }
}

export function getItemPreview(item: Item): string | null {
  switch (item.type) {
    case 'text':
      return item.text?.trim() || null
    case 'note':
      return (item.title?.trim() || item.text?.trim()) ?? null
    case 'shape':
    case 'arrow':
    case 'ruler':
    case 'area':
      return item.label?.trim() || null
    default:
      return null
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
  if (!isNonEmptyString(docObj.activePageId)) {
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

    if (!isRecord(page.items) || Array.isArray(page.items)) {
      throw new DocError(`Page "${page.id}" items must be a Record<string, Item> object`)
    }
    if (!Array.isArray(page.order)) {
      throw new DocError(`Page "${page.id}" order must be an array of item IDs`)
    }

    const itemsMap = page.items as Record<string, unknown>
    for (const [, item] of Object.entries(itemsMap)) {
      if (!isValidItem(item)) {
        throw new DocError(`Invalid item in page "${page.id}": ${JSON.stringify(item)}`)
      }
    }

    pageIds.add(page.id)
  }

  if (!pageIds.has(docObj.activePageId)) {
    throw new DocError(`Active page id "${docObj.activePageId}" does not exist in document pages`)
  }

  return {
    activePageId: docObj.activePageId as string,
    pages: docObj.pages as Page[],
  }
}
