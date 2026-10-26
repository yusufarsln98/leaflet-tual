import type L from 'leaflet'
import type { Doc, Item, NewItem, Page, Style } from '../types/index.js'
import { createId } from '../shared/geo.js'
import { cloneDoc } from '../shared/doc.js'
import { DEFAULT_TOOL_STYLES } from '../shared/theme.js'

export interface ItemCrudContext {
  getDoc: () => Doc
  getActivePage: () => Page
  getCurrentStyle: () => Style
  getSelection: () => string[]
  setSelection: (sel: string[]) => void
  clearEditing: () => void
  getMap?: () => L.Map | null
  commitChange: (reason: 'create' | 'update' | 'delete', ids: string[], committed: boolean, prev?: Doc) => void
}

export function createItemOperations(ctx: ItemCrudContext) {
  return {
    add(newItem: NewItem): Item {
      const prev = cloneDoc(ctx.getDoc())
      const activePage = ctx.getActivePage()
      const map = ctx.getMap?.()
      const currentZoom = map && typeof map.getZoom === 'function' ? map.getZoom() : (activePage.view?.zoom ?? 13)
      const baseZoom = newItem.baseZoom ?? currentZoom
      const typeDefault = DEFAULT_TOOL_STYLES[newItem.type] ?? {}
      const itemStyle =
        newItem.type === 'note' || newItem.type === 'text'
          ? { ...typeDefault, ...newItem.style }
          : { ...typeDefault, ...ctx.getCurrentStyle(), ...newItem.style }
      const item = {
        ...newItem,
        id: newItem.id ?? createId(newItem.type),
        baseZoom,
        createdAt: Date.now(),
        style: itemStyle,
      } as Item
      activePage.items.push(item)
      ctx.commitChange('create', [item.id], true, prev)
      return item
    },

    update(id: string, patch: Partial<Item>, committed = true) {
      const activePage = ctx.getActivePage()
      const idx = activePage.items.findIndex((i) => i.id === id)
      if (idx === -1) return

      const prev = cloneDoc(ctx.getDoc())
      const existing = activePage.items[idx]
      const mergedStyle = patch.style ? { ...existing.style, ...patch.style } : existing.style
      activePage.items[idx] = { ...existing, ...patch, style: mergedStyle } as Item
      ctx.commitChange('update', [id], committed, committed ? prev : undefined)
    },

    remove(ids?: string | string[]) {
      const targetIds = ids ? (Array.isArray(ids) ? ids : [ids]) : ctx.getSelection()
      if (targetIds.length === 0) return
      const prev = cloneDoc(ctx.getDoc())
      const activePage = ctx.getActivePage()
      const set = new Set(targetIds)
      activePage.items = activePage.items.filter((i) => !set.has(i.id))
      ctx.setSelection(ctx.getSelection().filter((id) => !set.has(id)))
      ctx.clearEditing()
      ctx.commitChange('delete', targetIds, true, prev)
    },

    clear() {
      const prev = cloneDoc(ctx.getDoc())
      const activePage = ctx.getActivePage()
      const ids = activePage.items.map((i) => i.id)
      activePage.items = []
      ctx.setSelection([])
      ctx.clearEditing()
      ctx.commitChange('delete', ids, true, prev)
    },
  }
}

