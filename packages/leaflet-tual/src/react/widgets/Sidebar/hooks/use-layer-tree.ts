import { useCallback, useState } from 'react'
import type React from 'react'
import type { Controller, Item } from '../../../../core/index.js'

export interface UseLayerTreeOptions {
  controller: Controller
  onItemContextMenu?: (item: Item, e: React.MouseEvent) => void
}

export function useLayerTree({ controller, onItemContextMenu }: UseLayerTreeOptions) {
  const [collapsedPages, setCollapsedPages] = useState<Record<string, boolean>>({})

  const togglePage = useCallback((pageId: string) => {
    setCollapsedPages((prev) => ({ ...prev, [pageId]: !prev[pageId] }))
  }, [])

  const handlePageClick = useCallback(
    (pageId: string, isPageActive: boolean) => {
      if (!isPageActive) {
        controller.pages.select(pageId)
      } else {
        togglePage(pageId)
      }
    },
    [controller.pages, togglePage],
  )

  const handleItemClick = useCallback(
    (pageId: string, itemId: string, isPageActive: boolean) => {
      if (!isPageActive) {
        controller.pages.select(pageId)
      }
      controller.select(itemId)
      controller.fit(itemId)
    },
    [controller],
  )

  const handleItemContextMenu = useCallback(
    (item: Item, pageId: string, isPageActive: boolean, e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!isPageActive) {
        controller.pages.select(pageId)
      }
      if (!controller.selection.includes(item.id)) {
        controller.select(item.id)
      }
      controller.edit(null)
      onItemContextMenu?.(item, e)
    },
    [controller, onItemContextMenu],
  )

  return {
    collapsedPages,
    togglePage,
    handlePageClick,
    handleItemClick,
    handleItemContextMenu,
  }
}
