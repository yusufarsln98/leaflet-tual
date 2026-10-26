'use client'

import type { Controller, Item, ShapeItem, Style } from '../../../../core/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import { ICONS, LABEL_POSITION_ICONS } from '../../Toolbar/icons/index.js'
import { BorderPopover } from './BorderPopover.js'
import { LabelPositionDropdown } from './LabelPositionDropdown.js'
import { MoreOptionsDropdown } from './MoreOptionsDropdown.js'
import { RadiusDropdown } from './RadiusDropdown.js'

export interface SecondaryTooltipExtrasProps {
  isNote: boolean
  isShape: boolean
  hasBorder: boolean
  isSquareShape: boolean
  style: Style
  selectedItem: Item
  controller: Controller
  scheme: 'light' | 'dark'
  activePopover: string | null
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
  scheme,
  activePopover,
  onToggle,
  onClose,
  onUpdateStyle,
}: SecondaryTooltipExtrasProps) {
  const { t } = useTranslation()

  return (
    <>
      {isNote && (
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="tual-secondary-icon-btn"
            title={t('cornerRadius')}
            data-active={activePopover === 'radius'}
            onClick={() => onToggle('radius')}
          >
            {ICONS.radius()}
          </button>
          {activePopover === 'radius' && (
            <RadiusDropdown
              currentRadius={style.radius}
              onSelectRadius={(r) => onUpdateStyle({ radius: r })}
              onClose={onClose}
            />
          )}
        </div>
      )}

      {hasBorder && (
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="tual-secondary-icon-btn"
            title={t('borderAndStroke')}
            data-active={activePopover === 'border'}
            onClick={() => onToggle('border')}
          >
            {ICONS.strokeWidth()}
          </button>
          {activePopover === 'border' && (
            <BorderPopover
              currentDash={style.dash}
              currentColor={style.color}
              currentStrokeColor={style.strokeColor}
              currentWidth={isNote ? (style.width ?? 's') : style.width}
              currentRadius={style.radius}
              scheme={scheme}
              isSquareShape={isSquareShape}
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
          <button
            type="button"
            className="tual-secondary-icon-btn"
            title={t('labelPosition')}
            data-active={activePopover === 'labelPosition'}
            onClick={() => onToggle('labelPosition')}
          >
            {LABEL_POSITION_ICONS.center()}
          </button>
          {activePopover === 'labelPosition' && (
            <LabelPositionDropdown
              currentPosition={(selectedItem as ShapeItem).labelPosition}
              onSelectPosition={(p) => controller.update(selectedItem.id, { labelPosition: p })}
              onClose={onClose}
            />
          )}
        </div>
      )}

      <div className="tual-secondary-separator" />

      <div style={{ position: 'relative' }}>
        <button
          type="button"
          className="tual-secondary-icon-btn"
          title={t('moreOptions')}
          data-active={activePopover === 'more'}
          onClick={() => onToggle('more')}
        >
          {ICONS.moreVertical()}
        </button>
        {activePopover === 'more' && (
          <MoreOptionsDropdown
            onDuplicate={() => {
              const { id: _id, createdAt: _created, ...rest } = selectedItem
              controller.select(controller.add(rest).id)
              onClose()
            }}
            onDelete={() => {
              controller.remove(selectedItem.id)
              onClose()
            }}
            onClose={onClose}
          />
        )}
      </div>
    </>
  )
}
