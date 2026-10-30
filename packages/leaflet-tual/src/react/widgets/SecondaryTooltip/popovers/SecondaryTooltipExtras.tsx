'use client'

import type { Controller, Item, ShapeItem, Style } from '../../../../core/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import { Divider, IconButton, ICONS } from '../../../ui/index.js'
import { BorderPopover } from './BorderPopover.js'
import { LabelPositionDropdown } from './LabelPositionDropdown.js'

export interface SecondaryTooltipExtrasProps {
  isNote: boolean
  isShape: boolean
  hasBorder: boolean
  isSquareShape: boolean
  style: Style
  selectedItem: Item
  controller: Controller
  activePopover: string | null
  sidebarOpen?: boolean
  onOpenSidebar?: () => void
  onToggle: (name: string) => void
  onClose: () => void
  onUpdateStyle: (patch: Partial<Style>) => void
}

export function SecondaryTooltipExtras({
  isNote,
  isShape,
  hasBorder,
  isSquareShape,
  style,
  selectedItem,
  controller,
  activePopover,
  sidebarOpen = false,
  onOpenSidebar,
  onToggle,
  onClose,
  onUpdateStyle,
}: SecondaryTooltipExtrasProps) {
  const { t } = useTranslation()

  return (
    <>
      {hasBorder && (
        <div style={{ position: 'relative' }}>
          <IconButton
            variant="secondary-icon"
            label={t('borderAndStroke')}
            active={activePopover === 'border'}
            icon={ICONS.strokeWidth()}
            onClick={() => onToggle('border')}
          />
          {activePopover === 'border' && (
            <BorderPopover
              currentDash={style.dash}
              currentColor={style.color}
              currentStrokeColor={style.strokeColor}
              currentWidth={isNote ? (style.width ?? 's') : style.width}
              currentRadius={style.radius}
              isSquareShape={isSquareShape}
              showRadius={isNote || isSquareShape}
              onSelectDash={(d) => onUpdateStyle({ dash: d })}
              onSelectStrokeColor={(c) => onUpdateStyle({ strokeColor: c })}
              onSelectWidth={(w) => onUpdateStyle({ width: w })}
              onSelectRadius={(r) => onUpdateStyle({ radius: r })}
              onClose={onClose}
            />
          )}
        </div>
      )}

      {isShape && (
        <div style={{ position: 'relative' }}>
          <IconButton
            variant="secondary-icon"
            label={t('labelPosition')}
            active={activePopover === 'labelPosition'}
            icon={ICONS.center()}
            onClick={() => onToggle('labelPosition')}
          />
          {activePopover === 'labelPosition' && (
            <LabelPositionDropdown
              currentPosition={(selectedItem as ShapeItem).labelPosition}
              onSelectPosition={(p) =>
                controller.update(selectedItem.id, { labelPosition: p })
              }
              onClose={onClose}
            />
          )}
        </div>
      )}

      <Divider variant="secondary" />
      <IconButton
        variant="secondary-icon"
        label={selectedItem.locked ? t('unlock') : t('lock')}
        active={Boolean(selectedItem.locked)}
        icon={selectedItem.locked ? ICONS.lock() : ICONS.unlock()}
        onClick={() => {
          onClose()
          controller.update(selectedItem.id, { locked: !selectedItem.locked })
        }}
      />

      {!sidebarOpen && (
        <>
          <IconButton
            variant="secondary-icon"
            label={t('moreOptions')}
            icon={ICONS.moreVertical()}
            onClick={() => {
              onClose()
              onOpenSidebar?.()
            }}
          />
        </>
      )}
    </>
  )
}
