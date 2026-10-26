import type L from 'leaflet'
import type { ControllerPages, Doc, Page, TranslationTokens } from '../../types/index.js'
import { createId } from '../../shared/geometry/geo.js'
import { cloneDoc } from '../../shared/doc.js'
import { getDefaultTranslations, translate } from '../../shared/i18n/index.js'

export interface PageManagerContext {
  getDoc: () => Doc
  setDoc: (doc: Doc) => void
  getActivePage: () => Page
  clearSelection: () => void
  getMap: () => L.Map | null
  commitChange: (reason: 'page' | 'reorder', ids: string[], committed: boolean, prev: Doc) => void
  emit: (event: string, ...args: unknown[]) => void
  getTranslations?: () => TranslationTokens
}

export function createPageManager(ctx: PageManagerContext): ControllerPages {
  return {
    get active(): string {
      return ctx.getDoc().page
    },
    get list(): Page[] {
      return ctx.getDoc().pages
    },
    add(name?: string): string {
      const doc = ctx.getDoc()
      const prev = cloneDoc(doc)
      const id = createId('page')
      const tokens = ctx.getTranslations?.() ?? getDefaultTranslations()
      const pageName =
        name ??
        translate(tokens, 'pageDefault', { n: doc.pages.length + 1 }, `Page ${doc.pages.length + 1}`)
      const map = ctx.getMap?.()
      const center = map && typeof map.getCenter === 'function' ? map.getCenter() : undefined
      const zoom = map && typeof map.getZoom === 'function' ? map.getZoom() : undefined
      const view = center && zoom !== undefined ? { center: { lat: center.lat, lng: center.lng }, zoom } : undefined
      const newPage: Page = { id, name: pageName, items: [], ...(view ? { view } : {}) }
      doc.pages.push(newPage)
      doc.page = id
      ctx.clearSelection()

      ctx.emit('page', id)
      ctx.commitChange('page', [], true, prev)
      return id
    },
    rename(id: string, name: string): void {
      const doc = ctx.getDoc()
      const target = doc.pages.find((p) => p.id === id)
      if (!target || target.name === name) return
      const prev = cloneDoc(doc)
      target.name = name
      ctx.commitChange('page', [], true, prev)
    },
    remove(id: string): void {
      const doc = ctx.getDoc()
      if (doc.pages.length <= 1) return
      const idx = doc.pages.findIndex((p) => p.id === id)
      if (idx === -1) return
      const prev = cloneDoc(doc)
      doc.pages.splice(idx, 1)
      if (doc.page === id) {
        doc.page = doc.pages[0].id
      }
      ctx.clearSelection()

      ctx.emit('page', doc.page)
      ctx.commitChange('page', [], true, prev)
    },
    move(id: string, toIndex: number): void {
      const doc = ctx.getDoc()
      const idx = doc.pages.findIndex((p) => p.id === id)
      if (idx === -1 || toIndex < 0 || toIndex >= doc.pages.length) return
      const prev = cloneDoc(doc)
      const [removed] = doc.pages.splice(idx, 1)
      doc.pages.splice(toIndex, 0, removed)
      ctx.commitChange('reorder', [], true, prev)
    },
    select(id: string): void {
      const doc = ctx.getDoc()
      if (doc.page === id) return
      const target = doc.pages.find((p) => p.id === id)
      if (!target) return

      const map = ctx.getMap()
      const currentPage = ctx.getActivePage()
      if (map) {
        const center = map.getCenter()
        currentPage.view = {
          center: { lat: center.lat, lng: center.lng },
          zoom: map.getZoom(),
        }
      }

      doc.page = id
      ctx.clearSelection()

      if (map && target.view) {
        map.setView(
          [target.view.center.lat, target.view.center.lng],
          target.view.zoom,
        )
      }

      ctx.emit('page', id)
      ctx.emit('state')
    },
  }
}

