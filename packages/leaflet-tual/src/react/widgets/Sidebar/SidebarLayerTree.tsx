'use client'

import { useState } from 'react'
import type { Controller, Item } from '../../../core/index.js'
import { useTranslation } from '../../features/i18n/index.js'
import { ConfirmPopover, ICONS } from '../../ui/index.js'

export interface SidebarLayerTreeProps {
  controller: Controller
}

function getItemIcon(item: Item) {
  switch (item.type) {
    case 'shape':
      return (ICONS[item.kind] ?? ICONS.square)()
    case 'arrow':
      return (ICONS[item.kind] ?? ICONS.linear)()
    case 'freedraw':
      return ICONS.freedraw()
    case 'pen':
      return ICONS.pen()
    case 'text':
      return ICONS.text()
    case 'note':
      return ICONS.note()
    case 'ruler':
      return ICONS.ruler()
  }
}

function getItemPreview(item: Item): string | null {
  switch (item.type) {
    case 'text':
      return item.text?.trim() || null
    case 'note':
      return (item.title?.trim() || item.text?.trim()) ?? null
    case 'shape':
    case 'arrow':
    case 'ruler':
      return item.label?.trim() || null
    default:
      return null
  }
}

export function SidebarLayerTree({ controller }: SidebarLayerTreeProps) {
  const { t } = useTranslation(controller)
  const [collapsedPages, setCollapsedPages] = useState<Record<string, boolean>>({})

  const togglePage = (pageId: string) => {
    setCollapsedPages((prev) => ({ ...prev, [pageId]: !prev[pageId] }))
  }

  const getItemTypeName = (item: Item): string => {
    if (item.type === 'shape') {
      return t(item.kind, undefined, item.kind)
    }
    return t(item.type, undefined, item.type)
  }

  const pages = controller.doc.pages

  return (
    <div className="tual-sidebar-tree" role="tree" aria-label={t('properties')}>
      {pages.map((page) => {
        const isPageActive = page.id === controller.pages.active
        const isExpanded = !collapsedPages[page.id]
        const items = [...page.items].reverse()

        return (
          <div key={page.id} className="tual-sidebar-tree-group">
            <button
              type="button"
              className="tual-sidebar-tree-group-header"
              data-active={isPageActive}
              onClick={() => {
                if (!isPageActive) {
                  controller.pages.select(page.id)
                } else {
                  togglePage(page.id)
                }
              }}
            >
              <span
                className="tual-sidebar-tree-chevron"
                onClick={(e) => {
                  e.stopPropagation()
                  togglePage(page.id)
                }}
              >
                {isExpanded ? ICONS.chevronDown() : ICONS.chevronRight()}
              </span>
              <span className="tual-sidebar-tree-hash">#</span>
              <span className="tual-sidebar-tree-group-name">{page.name}</span>
            </button>

            {isExpanded && (
              <div className="tual-sidebar-tree-items">
                {items.map((item) => {
                  const isSelected = isPageActive && controller.selection.includes(item.id)
                  const typeName = getItemTypeName(item)
                  const preview = getItemPreview(item)

                  return (
                    <div
                      key={item.id}
                      role="treeitem"
                      aria-selected={isSelected}
                      className="tual-sidebar-tree-item"
                      data-selected={isSelected}
                      onClick={() => {
                        if (!isPageActive) {
                          controller.pages.select(page.id)
                        }
                        controller.select(item.id)
                        controller.fit(item.id)
                      }}
                    >
                      <span className="tual-sidebar-tree-icon">{getItemIcon(item)}</span>
                      <span className="tual-sidebar-tree-label">{typeName}</span>
                      {preview && (
                        <span className="tual-sidebar-tree-preview">“{preview}”</span>
                      )}

                      <ConfirmPopover
                        triggerTitle={t('delete')}
                        message={t('confirmDelete')}
                        confirmLabel={t('delete')}
                        cancelLabel={t('cancel')}
                        onConfirm={() => controller.remove(item.id)}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
