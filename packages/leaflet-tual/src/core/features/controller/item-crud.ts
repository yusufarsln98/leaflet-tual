import type L from 'leaflet'
import type { Doc, Item, NewItem, Page, ReorderAction, Style } from '../../types/index.js'
import { createId } from '../../shared/geometry/geo.js'
import { translateItem } from '../../shared/geometry/translate.js'
import { cloneDoc } from '../../shared/doc.js'
import { DEFAULT_TOOL_STYLES } from '../../shared/theme/theme.js'

export interface ItemCrudContext {
  getDoc: () => Doc
  getActivePage: () => Page
  getCurrentStyle: () => Style
  getSelection: () => string[]
  setSelection: (sel: string[]) => void
  clearEditing: () => void
  getMap?: () => L.Map | null
  commitChange: (
    reason: 'create' | 'update' | 'delete' | 'reorder',
    ids: string[],
    committed: boolean,
    prev?: Doc,
  ) => void
}

function applyItemPatch(existing: Item, patch: Partial<Item>): Item {
  const mergedStyle = patch.style ? { ...existing.style, ...patch.style } : existing.style
  return { ...existing, ...patch, style: mergedStyle } as Item
}

export function createItemOperations(ctx: ItemCrudContext) {
  let pendingSnapshot: Doc | null = null

  function resolveSnapshot(committed: boolean): Doc | undefined {
    if (!committed) {
      if (!pendingSnapshot) {
        pendingSnapshot = cloneDoc(ctx.getDoc())
      }
      return undefined
    }
    const prev = pendingSnapshot ?? cloneDoc(ctx.getDoc())
    pendingSnapshot = null
    return prev
  }

  return {
    add(newItem: NewItem): Item {
      pendingSnapshot = null
      const prev = cloneDoc(ctx.getDoc())
      const activePage = ctx.getActivePage()
      const map = ctx.getMap?.()
      const currentZoom =
        map && typeof map.getZoom === 'function' ? map.getZoom() : (activePage.view?.zoom ?? 13)
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

      const prev = resolveSnapshot(committed)
      activePage.items[idx] = applyItemPatch(activePage.items[idx], patch)
      ctx.commitChange('update', [id], committed, prev)
    },

    updateMany(patches: Array<{ id: string; patch: Partial<Item> }>, committed = true) {
      if (patches.length === 0) return
      const activePage = ctx.getActivePage()
      const patchMap = new Map(patches.map((p) => [p.id, p.patch]))
      const updatedIds: string[] = []

      const prev = resolveSnapshot(committed)
      for (let i = 0; i < activePage.items.length; i++) {
        const item = activePage.items[i]
        const patch = patchMap.get(item.id)
        if (patch) {
          activePage.items[i] = applyItemPatch(item, patch)
          updatedIds.push(item.id)
        }
      }
      if (updatedIds.length > 0) {
        ctx.commitChange('update', updatedIds, committed, prev)
      }
    },

    duplicate(ids?: string | string[]): Item[] {
      const targetIds = ids ? (Array.isArray(ids) ? ids : [ids]) : ctx.getSelection()
      if (targetIds.length === 0) return []
      const activePage = ctx.getActivePage()
      const set = new Set(targetIds)
      const targets = activePage.items.filter((i) => set.has(i.id))
      if (targets.length === 0) return []

      pendingSnapshot = null
      const prev = cloneDoc(ctx.getDoc())
      const map = ctx.getMap?.()
      const currentZoom =
        map && typeof map.getZoom === 'function' ? map.getZoom() : (activePage.view?.zoom ?? 13)
      const worldStep = 16 / Math.pow(2, currentZoom - 13)

      const created: Item[] = targets.map((item) => {
        const cloned = JSON.parse(JSON.stringify(item)) as Item
        const moved = translateItem(cloned, { x: worldStep, y: worldStep })
        return {
          ...cloned,
          ...moved,
          id: createId(item.type),
          createdAt: Date.now(),
        } as Item
      })

      activePage.items.push(...created)
      const createdIds = created.map((i) => i.id)
      ctx.setSelection(createdIds)
      ctx.clearEditing()
      ctx.commitChange('create', createdIds, true, prev)
      return created
    },

    reorder(ids: string | string[], action: ReorderAction) {
      const targetIds = Array.isArray(ids) ? ids : [ids]
      if (targetIds.length === 0) return
      const activePage = ctx.getActivePage()
      const items = activePage.items
      const set = new Set(targetIds)
      if (!items.some((i) => set.has(i.id))) return

      pendingSnapshot = null
      const prev = cloneDoc(ctx.getDoc())

      if (action === 'front') {
        const rest = items.filter((i) => !set.has(i.id))
        const moved = items.filter((i) => set.has(i.id))
        activePage.items = [...rest, ...moved]
      } else if (action === 'back') {
        const moved = items.filter((i) => set.has(i.id))
        const rest = items.filter((i) => !set.has(i.id))
        activePage.items = [...moved, ...rest]
      } else if (action === 'forward') {
        const next = [...items]
        for (let i = next.length - 2; i >= 0; i--) {
          if (set.has(next[i].id) && !set.has(next[i + 1].id)) {
            const tmp = next[i]
            next[i] = next[i + 1]
            next[i + 1] = tmp
          }
        }
        activePage.items = next
      } else if (action === 'backward') {
        const next = [...items]
        for (let i = 1; i < next.length; i++) {
          if (set.has(next[i].id) && !set.has(next[i - 1].id)) {
            const tmp = next[i]
            next[i] = next[i - 1]
            next[i - 1] = tmp
          }
        }
        activePage.items = next
      }

      ctx.commitChange('reorder', targetIds, true, prev)
    },

    remove(ids?: string | string[]) {
      const targetIds = ids ? (Array.isArray(ids) ? ids : [ids]) : ctx.getSelection()
      if (targetIds.length === 0) return
      pendingSnapshot = null
      const prev = cloneDoc(ctx.getDoc())
      const activePage = ctx.getActivePage()
      const set = new Set(targetIds)
      activePage.items = activePage.items.filter((i) => !set.has(i.id))
      ctx.setSelection(ctx.getSelection().filter((id) => !set.has(id)))
      ctx.clearEditing()
      ctx.commitChange('delete', targetIds, true, prev)
    },

    clear() {
      pendingSnapshot = null
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

