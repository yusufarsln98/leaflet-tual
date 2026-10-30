'use client'

import type L from 'leaflet'
import type { Controller, Item, Style } from '../../../core/index.js'
import { useTranslation } from '../../features/i18n/index.js'
import { FillStrokeSection } from './sections/FillStrokeSection.js'
import { TypographySection } from './sections/TypographySection.js'

export interface SidebarPropertiesProps {
  controller: Controller
  map?: L.Map
}

export function SidebarProperties({ controller, map }: SidebarPropertiesProps) {
  const { t } = useTranslation(controller)
  const selectedItem = controller.selected[0] as Item | undefined

  if (!selectedItem) {
    return (
      <div className="tual-sidebar-empty">
        <div className="tual-sidebar-empty-title">{t('nothingSelected')}</div>
        <div className="tual-sidebar-empty-subtitle">{t('clickElementToEdit')}</div>
      </div>
    )
  }

  const style = selectedItem.style ?? {}
  const updateStyle = (patch: Partial<Style>) =>
    controller.update(selectedItem.id, { style: { ...style, ...patch } })

  return (
    <div className="tual-sidebar-properties">
      <FillStrokeSection
        map={map}
        selectedItem={selectedItem}
        style={style}
        onUpdateStyle={updateStyle}
      />
      <TypographySection
        selectedItem={selectedItem}
        style={style}
        controller={controller}
        onUpdateStyle={updateStyle}
      />
    </div>
  )
}
