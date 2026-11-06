'use client'

import type L from 'leaflet'
import type { Controller } from '../../../../core/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import { Divider, DropdownItem, ICONS, Popover } from '../../../ui/index.js'
import { ToolbarToolButton } from './ToolbarToolButton.js'

export interface ToolbarMoreMenuProps {
  controller: Controller
  map?: L.Map
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
  showHistory?: boolean
  sidebarOpen?: boolean
  onToggleSidebar?: () => void
}

export function ToolbarMoreMenu({
  controller,
  map,
  isOpen,
  onToggle,
  onClose,
  showHistory = true,
  sidebarOpen = false,
  onToggleSidebar,
}: ToolbarMoreMenuProps) {
  const { t } = useTranslation(controller)
  const hasItems = controller.items.length > 0

  return (
    <ToolbarToolButton
      label={t('moreOptions')}
      icon={ICONS.more()}
      isActive={isOpen}
      isPopoverOpen={isOpen}
      onSelect={onToggle}
    >
      {isOpen && (
        <Popover variant="options" className="tual-toolbar-popover tual-more-popover">
          {showHistory && (
            <>
              <DropdownItem
                leading={<span className="tual-option-icon">{ICONS.undo()}</span>}
                label={t('undo')}
                meta="Ctrl+Z"
                disabled={!controller.canUndo}
                onClick={() => {
                  controller.undo()
                  onClose()
                }}
              />
              <DropdownItem
                leading={<span className="tual-option-icon">{ICONS.redo()}</span>}
                label={t('redo')}
                meta="Ctrl+Shift+Z"
                disabled={!controller.canRedo}
                onClick={() => {
                  controller.redo()
                  onClose()
                }}
              />
              <DropdownItem
                leading={<span className="tual-option-icon">{ICONS.fitAll()}</span>}
                label={t('fitInView')}
                disabled={!map || !hasItems}
                onClick={() => {
                  controller.fit('all')
                  onClose()
                }}
              />
            </>
          )}

          {showHistory && onToggleSidebar && <Divider variant="popover" />}

          {onToggleSidebar && (
            <DropdownItem
              leading={<span className="tual-option-icon">{ICONS.sidebar()}</span>}
              label={sidebarOpen ? t('hideSidebar') : t('showSidebar')}
              disabled={controller.readOnly}
              onClick={() => {
                onToggleSidebar()
                onClose()
              }}
            />
          )}
        </Popover>
      )}
    </ToolbarToolButton>
  )
}
