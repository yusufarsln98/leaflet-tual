'use client'

import { useEffect, useRef, useState } from 'react'
import type { Controller } from '../../../../core/index.js'
import { ICONS } from '../icons/index.js'

export interface PageSwitcherProps {
  controller: Controller
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
  className?: string
}

export function PageSwitcher({
  controller,
  isOpen,
  onToggle,
  onClose,
  className,
}: PageSwitcherProps) {
  const activePage = controller.pages.list.find(
    (p) => p.id === controller.pages.active,
  )
  const pageName = activePage?.name ?? 'Page 1'
  const pageCount = controller.pages.list.length

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) {
      setEditingId(null)
      setActionMenuId(null)
      return
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [isOpen, onClose])

  const commitRename = (pageId: string) => {
    const trimmed = editingName.trim()
    if (trimmed) {
      controller.pages.rename(pageId, trimmed)
    }
    setEditingId(null)
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="tual-page-pill"
        onClick={onToggle}
        title="Page Switcher"
      >
        <span className="tual-page-badge">{pageCount}</span>
        <span className="tual-page-name">{pageName}</span>
        <span className="tual-page-chevron">{ICONS.chevronDown()}</span>
      </button>

      {isOpen && (
        <div
          className={`tual-popover tual-page-popover ${className ?? ''}`}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="tual-page-list">
            {controller.pages.list.map((page) => {
              const isActive = page.id === controller.pages.active
              const isRenaming = editingId === page.id
              const isActionOpen = actionMenuId === page.id

              if (isRenaming) {
                return (
                  <div key={page.id} className="tual-page-row" data-active={isActive}>
                    <input
                      type="text"
                      className="tual-page-rename-input"
                      value={editingName}
                      autoFocus
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => commitRename(page.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          commitRename(page.id)
                        } else if (e.key === 'Escape') {
                          setEditingId(null)
                        }
                      }}
                    />
                  </div>
                )
              }

              return (
                <div
                  key={page.id}
                  className="tual-page-row"
                  data-active={isActive}
                  onClick={() => {
                    controller.pages.select(page.id)
                    onClose()
                  }}
                >
                  <span className="tual-page-title">{page.name}</span>

                  <div
                    className="tual-page-row-actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isActive && (
                      <span className="tual-page-check">{ICONS.check()}</span>
                    )}

                    <button
                      type="button"
                      className="tual-popover-action-btn"
                      title="Page options"
                      onClick={() =>
                        setActionMenuId((prev) => (prev === page.id ? null : page.id))
                      }
                    >
                      {ICONS.more()}
                    </button>

                    {isActionOpen && (
                      <div className="tual-page-action-menu">
                        <button
                          type="button"
                          className="tual-action-menu-item"
                          onClick={() => {
                            setEditingId(page.id)
                            setEditingName(page.name)
                            setActionMenuId(null)
                          }}
                        >
                          Rename
                        </button>
                        <button
                          type="button"
                          className="tual-action-menu-item"
                          onClick={() => {
                            controller.pages.duplicate(page.id)
                            setActionMenuId(null)
                          }}
                        >
                          Duplicate
                        </button>
                        {controller.pages.list.length > 1 && (
                          <button
                            type="button"
                            className="tual-action-menu-item tual-action-menu-item-danger"
                            onClick={() => {
                              controller.pages.remove(page.id)
                              setActionMenuId(null)
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="tual-popover-divider" />

          <button
            type="button"
            className="tual-page-add-btn"
            onClick={() => {
              controller.pages.add()
            }}
          >
            <span className="tual-page-add-icon">{ICONS.plus()}</span>
            <span>New page</span>
          </button>
        </div>
      )}
    </div>
  )
}
