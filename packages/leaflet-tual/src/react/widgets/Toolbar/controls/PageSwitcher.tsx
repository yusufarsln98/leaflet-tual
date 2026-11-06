'use client'

import { useEffect, useRef, useState } from 'react'
import type { Controller } from '../../../../core/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import {
  Divider,
  DropdownItem,
  DropdownMenu,
  IconButton,
  ICONS,
  Popover,
  TextField,
  useOutsideDismiss,
} from '../../../ui/index.js'

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
  const { t } = useTranslation(controller)
  const activePage = controller.pages.list.find((p) => p.id === controller.pages.active)
  const pageName = activePage?.name ?? t('pageDefault', { n: 1 })
  const pageCount = controller.pages.list.length

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)
  const [isEditingCurrent, setIsEditingCurrent] = useState(false)
  const [currentNameDraft, setCurrentNameDraft] = useState('')

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) {
      setEditingId(null)
      setActionMenuId(null)
    }
  }, [isOpen])

  useEffect(() => {
    setIsEditingCurrent(false)
  }, [controller.pages.active])

  useOutsideDismiss(containerRef, isOpen, onClose)

  const commitRename = (pageId: string) => {
    const trimmed = editingName.trim()
    if (trimmed) {
      controller.pages.rename(pageId, trimmed)
    }
    setEditingId(null)
  }

  const startCurrentRename = () => {
    setCurrentNameDraft(pageName)
    setIsEditingCurrent(true)
    onClose()
  }

  const commitCurrentRename = () => {
    const trimmed = currentNameDraft.trim()
    if (trimmed) {
      controller.pages.rename(controller.pages.active, trimmed)
    }
    setIsEditingCurrent(false)
  }

  return (
    <div ref={containerRef} className="tual-page-switcher">
      {isEditingCurrent ? (
        <div className="tual-page-pill tual-page-pill--editing">
          {ICONS.page()}
          <input
            className="tual-page-name-input"
            aria-label={t('pageName')}
            value={currentNameDraft}
            autoFocus
            onChange={(e) => setCurrentNameDraft(e.target.value)}
            onBlur={commitCurrentRename}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              e.stopPropagation()
              if (e.key === 'Enter') {
                commitCurrentRename()
              } else if (e.key === 'Escape') {
                setIsEditingCurrent(false)
              }
            }}
          />
        </div>
      ) : (
        <button
          type="button"
          className="tual-page-pill"
          data-active={isOpen || undefined}
          onClick={(e) => {
            if (e.detail >= 2) {
              e.preventDefault()
              e.stopPropagation()
              startCurrentRename()
              return
            }
            onToggle()
          }}
          title={`${t('pageSwitcher')} — ${pageName} · ${t('rename')}`}
          aria-label={`${t('pageSwitcher')} — ${pageName}`}
          aria-haspopup="menu"
          aria-expanded={isOpen}
        >
          {ICONS.page()}
          <span className="tual-page-name">{pageName}</span>
          {pageCount > 1 && <span className="tual-page-badge">{pageCount}</span>}
          <span className="tual-page-chevron">{ICONS['chevron-down-sm']()}</span>
        </button>
      )}

      {isOpen && (
        <Popover
          variant="page"
          className={`tual-toolbar-popover tual-page-popover ${className ?? ''}`}
        >
          <div className="tual-page-list">
            {controller.pages.list.map((page) => {
              const isActive = page.id === controller.pages.active
              const isRenaming = editingId === page.id
              const isActionOpen = actionMenuId === page.id

              if (isRenaming) {
                return (
                  <div key={page.id} className="tual-page-row" data-active={isActive}>
                    <TextField
                      className="tual-page-rename-input"
                      value={editingName}
                      autoFocus
                      onChange={setEditingName}
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

                  <div className="tual-page-row-actions" onClick={(e) => e.stopPropagation()}>
                    {isActive && <span className="tual-page-check">{ICONS.check()}</span>}

                    <IconButton
                      variant="popover-action"
                      title={t('pageOptions')}
                      icon={ICONS.more()}
                      onClick={() =>
                        setActionMenuId((prev) => (prev === page.id ? null : page.id))
                      }
                    />

                    {isActionOpen && (
                      <DropdownMenu layout="action-menu">
                        <DropdownItem
                          variant="action-menu"
                          label={t('rename')}
                          onClick={() => {
                            setEditingId(page.id)
                            setEditingName(page.name)
                            setActionMenuId(null)
                          }}
                        />
                        {controller.pages.list.length > 1 && (
                          <DropdownItem
                            variant="action-menu"
                            danger
                            label={t('delete')}
                            onClick={() => {
                              controller.pages.remove(page.id)
                              setActionMenuId(null)
                            }}
                          />
                        )}
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <Divider variant="popover" />

          <button
            type="button"
            className="tual-page-add-btn"
            onClick={() => {
              controller.pages.add()
            }}
          >
            <span className="tual-page-add-icon">{ICONS.plus()}</span>
            <span>{t('newPage')}</span>
          </button>
        </Popover>
      )}
    </div>
  )
}
