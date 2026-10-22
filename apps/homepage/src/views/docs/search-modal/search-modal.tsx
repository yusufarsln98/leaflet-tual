'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { searchDocs } from '../search-utils'
import { closeDialogWithAnimation, handleDialogLightDismiss } from '@/lib/top-layer'
import type { DocSection } from '@/config/docs-data'
import { QUICK_LINKS } from './constants'
import { SearchModalHeader } from './search-modal-header'
import { SearchQuickLinks } from './search-quick-links'
import { SearchResultsList } from './search-results-list'
import { SearchModalFooter } from './search-modal-footer'

export interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  sections: DocSection[]
  onSelectResult: (targetId: string) => void
}

export function SearchModal({ isOpen, onClose, sections, onSelectResult }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isRendered, setIsRendered] = useState(isOpen)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const results = useMemo(() => {
    return searchDocs(query, sections)
  }, [query, sections])

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Mount/unmount lifecycle synchronized with animation
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true)
    }
  }, [isOpen])

  // Sync native dialog open state
  useEffect(() => {
    if (!isRendered) return
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      if (!dialog.open) {
        try {
          dialog.showModal()
        } catch {
          // Fallback if showModal throws
        }
      }
      setTimeout(() => inputRef.current?.focus(), 50)
    } else if (dialog.open) {
      closeDialogWithAnimation(dialog).then(() => {
        setIsRendered(false)
      })
    }
  }, [isOpen, isRendered])

  const handleClose = useCallback(() => {
    const dialog = dialogRef.current
    if (dialog && dialog.open) {
      closeDialogWithAnimation(dialog).then(() => {
        setIsRendered(false)
        onClose()
      })
    } else {
      setIsRendered(false)
      onClose()
    }
  }, [onClose])

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector<HTMLElement>('[data-active="true"]')
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      handleClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const total = query ? results.length : QUICK_LINKS.length
      setSelectedIndex((prev) => (total > 0 ? (prev + 1) % total : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const total = query ? results.length : QUICK_LINKS.length
      setSelectedIndex((prev) => (total > 0 ? (prev - 1 + total) % total : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (query && results[selectedIndex]) {
        const item = results[selectedIndex]
        onSelectResult(item.subsectionId || item.sectionId)
        handleClose()
      } else if (!query && QUICK_LINKS[selectedIndex]) {
        onSelectResult(QUICK_LINKS[selectedIndex].id)
        handleClose()
      }
    }
  }

  // Never render in DOM if closed to avoid any hit testing or click interception
  if (!isRendered) {
    return null
  }

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-label="Documentation Command Palette"
      onClick={handleDialogLightDismiss}
      onCancel={(e) => {
        e.preventDefault()
        handleClose()
      }}
      className="ui-dialog palette-dialog"
    >
      <div className="flex flex-col max-h-[75vh] w-full bg-bg-pane text-text-primary rounded-2xl overflow-hidden border border-border-primary shadow-float">
        <SearchModalHeader
          inputRef={inputRef}
          query={query}
          onQueryChange={setQuery}
          onKeyDown={handleKeyDown}
        />

        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 space-y-1 overscroll-contain bg-bg-pane"
        >
          {!query ? (
            <SearchQuickLinks
              selectedIndex={selectedIndex}
              onHoverIndex={setSelectedIndex}
              onSelect={(id) => {
                onSelectResult(id)
                handleClose()
              }}
            />
          ) : (
            <SearchResultsList
              query={query}
              results={results}
              selectedIndex={selectedIndex}
              onHoverIndex={setSelectedIndex}
              onSelect={(targetId) => {
                onSelectResult(targetId)
                handleClose()
              }}
            />
          )}
        </div>

        <SearchModalFooter />
      </div>
    </dialog>
  )
}

