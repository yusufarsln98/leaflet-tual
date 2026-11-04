import type L from 'leaflet'
import type { ReorderAction } from '../../core/types.js'
import type { Doc, Item, NewItem, Page, Style } from '../../entities/index.js'
import { cloneDoc, createId } from '../../entities/document/index.js'
import { translateItem } from '../../shared/geometry/translate.js'
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
    patches?: Record<string, Partial<Item>>,
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

      activePage.items[item.id] = item
      activePage.order.push(item.id)
      ctx.commitChange('create', [item.id], true, prev, { [item.id]: item })
      return item
    },

    update(id: string, patch: Partial<Item>, committed = true) {
      const activePage = ctx.getActivePage()
      if (!activePage.items[id]) return

      const prev = resolveSnapshot(committed)
      activePage.items[id] = applyItemPatch(activePage.items[id], patch)
      ctx.commitChange('update', [id], committed, prev, { [id]: patch })
    },

    updateMany(patches: Array<{ id: string; patch: Partial<Item> }>, committed = true) {
      if (patches.length === 0) return
      const activePage = ctx.getActivePage()
      const updatedIds: string[] = []
      const patchRecord: Record<string, Partial<Item>> = {}

      const prev = resolveSnapshot(committed)
      for (const { id, patch } of patches) {
        if (activePage.items[id]) {
          activePage.items[id] = applyItemPatch(activePage.items[id], patch)
          updatedIds.push(id)
          patchRecord[id] = patch
        }
      }
      if (updatedIds.length > 0) {
        ctx.commitChange('update', updatedIds, committed, prev, patchRecord)
      }
    },

    duplicate(ids?: string | string[]): Item[] {
      const targetIds = ids ? (Array.isArray(ids) ? ids : [ids]) : ctx.getSelection()
      if (targetIds.length === 0) return []
      const activePage = ctx.getActivePage()
      const targets = targetIds.map((id) => activePage.items[id]).filter(Boolean)
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

      const patchRecord: Record<string, Partial<Item>> = {}
      for (const it of created) {
        activePage.items[it.id] = it
        activePage.order.push(it.id)
        patchRecord[it.id] = it
      }
      const createdIds = created.map((i) => i.id)
      ctx.setSelection(createdIds)
      ctx.clearEditing()
      ctx.commitChange('create', createdIds, true, prev, patchRecord)
      return created
    },

    reorder(ids: string | string[], action: ReorderAction) {
      const targetIds = Array.isArray(ids) ? ids : [ids]
      if (targetIds.length === 0) return
      const activePage = ctx.getActivePage()
      const order = [...activePage.order]
      const set = new Set(targetIds)
      if (!order.some((id) => set.has(id))) return

      pendingSnapshot = null
      const prev = cloneDoc(ctx.getDoc())

      if (action === 'front') {
        const rest = order.filter((id) => !set.has(id))
        const moved = order.filter((id) => set.has(id))
        activePage.order = [...rest, ...moved]
      } else if (action === 'back') {
        const moved = order.filter((id) => set.has(id))
        const rest = order.filter((id) => !set.has(id))
        activePage.order = [...moved, ...rest]
      } else if (action === 'forward') {
        const next = [...order]
        for (let i = next.length - 2; i >= 0; i--) {
          if (set.has(next[i]) && !set.has(next[i + 1])) {
            const tmp = next[i]
            next[i] = next[i + 1]
            next[i + 1] = tmp
          }
        }
        activePage.order = next
      } else if (action === 'backward') {
        const next = [...order]
        for (let i = 1; i < next.length; i++) {
          if (set.has(next[i]) && !set.has(next[i - 1])) {
            const tmp = next[i]
            next[i] = next[i - 1]
            next[i - 1] = tmp
          }
        }
        activePage.order = next
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
      for (const id of targetIds) {
        delete activePage.items[id]
      }
      activePage.order = activePage.order.filter((id) => !set.has(id))
      ctx.setSelection(ctx.getSelection().filter((id) => !set.has(id)))
      ctx.clearEditing()
      ctx.commitChange('delete', targetIds, true, prev)
    },

    clear() {
      pendingSnapshot = null
      const prev = cloneDoc(ctx.getDoc())
      const activePage = ctx.getActivePage()
      const ids = Object.keys(activePage.items)
      activePage.items = {}
      activePage.order = []
      ctx.setSelection([])
      ctx.clearEditing()
      ctx.commitChange('delete', ids, true, prev)
    },
  }
}
