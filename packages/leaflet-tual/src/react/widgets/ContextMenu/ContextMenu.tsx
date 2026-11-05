'use client'

import { useRef } from 'react'
import { clampPositionToContainer } from '../../../core/index.js'
import { useControllerState } from '../../features/index.js'
import { TranslationProvider, useTranslation } from '../../features/i18n/index.js'
import {
  Divider,
  DropdownItem,
  DropdownMenu,
  ICONS,
  useLeafletDomGuard,
  useOutsideDismiss,
} from '../../ui/index.js'
import type { ContextMenuProps } from './types.js'

const MENU_WIDTH = 216
const MENU_ESTIMATED_HEIGHT = 280
const EDGE_MARGIN = 12

export function ContextMenu({
  map,
  controller,
  position,
  onClose,
  className,
}: ContextMenuProps) {
  const { t } = useTranslation(controller)
  const menuRef = useRef<HTMLDivElement>(null)

  useControllerState(controller)
  useOutsideDismiss(menuRef, Boolean(position), onClose)
  useLeafletDomGuard(menuRef)

  if (!position || controller.readOnly || controller.selected.length === 0) {
    return null
  }

  const selected = controller.selected
  const isSingle = selected.length === 1
  const singleItem = selected[0]

  const anyLocked = selected.some((item) => Boolean(item.locked))

  const canEditLabel =
    isSingle &&
    (singleItem.type === 'shape' || singleItem.type === 'arrow' || singleItem.type === 'text')

  const mapSize = typeof map?.getSize === 'function' ? map.getSize() : { x: 800, y: 600 }
  const { x: left, y: top } = clampPositionToContainer(
    position,
    mapSize,
    { width: MENU_WIDTH, height: MENU_ESTIMATED_HEIGHT },
    EDGE_MARGIN,
  )

  return (
    <TranslationProvider translations={controller.translations}>
      <div
        ref={menuRef}
        role="menu"
        aria-label={t('moreOptions')}
        className={`tual-popover tual-context-menu ${className ?? ''}`}
        style={{
          position: 'absolute',
          left,
          top,
          marginTop: 0,
          minWidth: MENU_WIDTH,
          zIndex: 850,
        }}
        onMouseEnter={() => map?.dragging?.disable()}
        onMouseLeave={() => {
          if (controller.tool === 'select') map?.dragging?.enable()
        }}
        onPointerDown={(e) => {
          e.stopPropagation()
          map?.dragging?.disable()
        }}
        onMouseDown={(e) => {
          e.stopPropagation()
          map?.dragging?.disable()
        }}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        {/* Single-item & selection actions */}
        <DropdownMenu layout="list">
          {canEditLabel && (
            <DropdownItem
              leading={<span className="tual-option-icon">{ICONS.edit()}</span>}
              label={t('editLabel')}
              onClick={() => {
                controller.edit(singleItem.id)
                onClose()
              }}
            />
          )}

          <DropdownItem
            leading={<span className="tual-option-icon">{ICONS.duplicate()}</span>}
            label={t('duplicate')}
            meta="Ctrl+D"
            onClick={() => {
              controller.duplicate()
              onClose()
            }}
          />
        </DropdownMenu>

        <Divider variant="popover" />

        {/* Z-Order / Layer actions */}
        <DropdownMenu layout="list">
          <DropdownItem
            leading={<span className="tual-option-icon">{ICONS.bringToFront()}</span>}
            label={t('bringToFront')}
            meta="]"
            onClick={() => {
              controller.bringToFront()
              onClose()
            }}
          />
          <DropdownItem
            leading={<span className="tual-option-icon">{ICONS.bringForward()}</span>}
            label={t('bringForward')}
            meta="Alt+]"
            onClick={() => {
              controller.bringForward()
              onClose()
            }}
          />
          <DropdownItem
            leading={<span className="tual-option-icon">{ICONS.sendBackward()}</span>}
            label={t('sendBackward')}
            meta="Alt+["
            onClick={() => {
              controller.sendBackward()
              onClose()
            }}
          />
          <DropdownItem
            leading={<span className="tual-option-icon">{ICONS.sendToBack()}</span>}
            label={t('sendToBack')}
            meta="["
            onClick={() => {
              controller.sendToBack()
              onClose()
            }}
          />
        </DropdownMenu>

        <Divider variant="popover" />

        {/* Lock & Fit Selection */}
        <DropdownMenu layout="list">
          <DropdownItem
            leading={
              <span className="tual-option-icon">{anyLocked ? ICONS.unlock() : ICONS.lock()}</span>
            }
            label={anyLocked ? t('unlock') : t('lock')}
            onClick={() => {
              if (isSingle) {
                controller.update(singleItem.id, { locked: !anyLocked })
              } else {
                controller.updateMany(
                  selected.map((item) => ({ id: item.id, patch: { locked: !anyLocked } })),
                )
              }
              onClose()
            }}
          />
          <DropdownItem
            leading={<span className="tual-option-icon">{ICONS.fitSelection()}</span>}
            label={t('fitSelection')}
            disabled={!map}
            onClick={() => {
              controller.fit('selection')
              onClose()
            }}
          />
        </DropdownMenu>

        <Divider variant="popover" />

        {/* Delete */}
        <DropdownMenu layout="list">
          <DropdownItem
            leading={<span className="tual-option-icon">{ICONS.trash()}</span>}
            label={t('delete')}
            meta="Del"
            danger
            onClick={() => {
              controller.remove()
              onClose()
            }}
          />
        </DropdownMenu>
      </div>
    </TranslationProvider>
  )
}
