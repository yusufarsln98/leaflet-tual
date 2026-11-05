'use client'

import { getItemPreview, getPageItems } from '../../../../core/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import { ConfirmPopover, ICONS } from '../../../ui/index.js'
import type { SidebarLayerTreeProps } from '../types.js'
import { useLayerTree } from '../hooks/use-layer-tree.js'
import { getItemIcon, getItemTypeName } from '../utils/layer-tree-utils.js'

export function SidebarLayerTree({ controller, onItemContextMenu }: SidebarLayerTreeProps) {
  const { t } = useTranslation(controller)
  const {
    collapsedPages,
    togglePage,
    handlePageClick,
    handleItemClick,
    handleItemContextMenu,
  } = useLayerTree({ controller, onItemContextMenu })

  const pages = controller.doc.pages

  return (
    <div className="tual-sidebar-tree" role="tree" aria-label={t('properties')}>
      {pages.map((page) => {
        const isPageActive = page.id === controller.pages.active
        const isExpanded = !collapsedPages[page.id]
        const items = [...getPageItems(page)].reverse()

        return (
          <div key={page.id} className="tual-sidebar-tree-group">
            <button
              type="button"
              className="tual-sidebar-tree-group-header"
              data-active={isPageActive}
              onClick={() => handlePageClick(page.id, isPageActive)}
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
                  const typeName = getItemTypeName(item, t)
                  const preview = getItemPreview(item)

                  return (
                    <div
                      key={item.id}
                      role="treeitem"
                      aria-selected={isSelected}
                      className="tual-sidebar-tree-item"
                      data-selected={isSelected}
                      onClick={() => handleItemClick(page.id, item.id, isPageActive)}
                      onContextMenuCapture={(e) =>
                        handleItemContextMenu(item, page.id, isPageActive, e)
                      }
                    >
                      <span className="tual-sidebar-tree-icon">{getItemIcon(item)}</span>
                      <span className="tual-sidebar-tree-label">{typeName}</span>
                      {preview && <span className="tual-sidebar-tree-preview">“{preview}”</span>}

                      <ConfirmPopover
                        triggerIcon={ICONS.close()}
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
