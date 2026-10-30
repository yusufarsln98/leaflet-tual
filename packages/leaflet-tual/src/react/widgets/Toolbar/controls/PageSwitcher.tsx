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
  PillButton,
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
  const activePage = controller.pages.list.find(
    (p) => p.id === controller.pages.active,
  )
  const pageName = activePage?.name ?? t('pageDefault', { n: 1 })
  const pageCount = controller.pages.list.length

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) {
      setEditingId(null)
      setActionMenuId(null)
    }
  }, [isOpen])

  useOutsideDismiss(containerRef, isOpen, onClose)


  const commitRename = (pageId: string) => {
    const trimmed = editingName.trim()
    if (trimmed) {
      controller.pages.rename(pageId, trimmed)
    }
    setEditingId(null)
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <PillButton
        variant="page"
        onClick={onToggle}
        title={t('pageSwitcher')}
        leading={<span className="tual-page-badge">{pageCount}</span>}
        label={<span className="tual-page-name">{pageName}</span>}
        trailing={<span className="tual-page-chevron">{ICONS.chevronDown()}</span>}
      />

      {isOpen && (
        <Popover
          variant="page"
          className={className}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
          }}
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

                  <div
                    className="tual-page-row-actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isActive && (
                      <span className="tual-page-check">{ICONS.check()}</span>
                    )}

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
