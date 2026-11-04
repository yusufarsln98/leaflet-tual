'use client'

import { useTranslation } from '../../features/i18n/index.js'
import { Divider, DropdownItem, DropdownMenu, Popover } from '../../ui/index.js'
import type { ZoomMenuPopoverProps } from './types.js'
import { ZOOM_PRESETS } from './zoom-utils.js'

export function ZoomMenuPopover({
  controller,
  map,
  zoomPercent,
  onSelectPreset,
  onClose,
}: ZoomMenuPopoverProps) {
  const { t } = useTranslation(controller)

  return (
    <Popover
      className="tual-zoom-menu-popover"
      role="menu"
      style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0 }}
    >
      <DropdownMenu layout="list">
        <DropdownItem
          label={t('zoomIn')}
          meta="+"
          disabled={!map}
          onClick={() => {
            map?.zoomIn()
            onClose()
          }}
        />
        <DropdownItem
          label={t('zoomOut')}
          meta="-"
          disabled={!map}
          onClick={() => {
            map?.zoomOut()
            onClose()
          }}
        />
        <DropdownItem
          label={t('fitInView')}
          disabled={!map || controller.items.length === 0}
          onClick={() => {
            controller.fit('all')
            onClose()
          }}
        />
        <DropdownItem
          label={t('fitSelection')}
          disabled={!map || controller.selected.length === 0}
          onClick={() => {
            controller.fit('selection')
            onClose()
          }}
        />
      </DropdownMenu>

      <Divider variant="popover" />

      <DropdownMenu layout="list">
        {ZOOM_PRESETS.map((preset) => (
          <DropdownItem
            key={preset}
            label={`${preset}%`}
            selected={Math.abs(zoomPercent - preset) < 1}
            disabled={!map}
            onClick={() => onSelectPreset(preset)}
          />
        ))}
      </DropdownMenu>

      <Divider variant="popover" />

      <DropdownMenu layout="list">
        <DropdownItem
          label={t('undo')}
          meta="Ctrl+Z"
          disabled={!controller.canUndo}
          onClick={() => {
            controller.undo()
            onClose()
          }}
        />
        <DropdownItem
          label={t('redo')}
          meta="Ctrl+Shift+Z"
          disabled={!controller.canRedo}
          onClick={() => {
            controller.redo()
            onClose()
          }}
        />
      </DropdownMenu>
    </Popover>
  )
}

