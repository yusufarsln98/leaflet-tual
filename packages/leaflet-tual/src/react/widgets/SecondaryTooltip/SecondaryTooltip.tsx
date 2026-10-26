'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import type { Controller, Item, ShapeItem, Style } from '../../../core/index.js'
import { getItemBounds, resolveColor, resolveTypographyLabel } from '../../../core/index.js'
import { useTranslation } from '../../features/i18n/index.js'
import { PillButton } from '../../ui/index.js'
import { useTooltipEvents } from './utils/index.js'
import {
  TypographyDropdown,
  TextFormattingControls,
} from './typography/index.js'
import { ColorSwatchControls } from './color/index.js'
import { SecondaryTooltipExtras } from './popovers/index.js'

export interface SecondaryTooltipProps {
  map: L.Map
  controller: Controller
  className?: string
}

export function SecondaryTooltip({ map, controller, className }: SecondaryTooltipProps) {
  const { t } = useTranslation(controller)
  const [activePopover, setActivePopover] = useState<string | null>(null)
  const [, setTick] = useState(0)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const selectedItem = controller.selected[0] as Item | undefined

  useEffect(() => {
    return controller.on('state', () => setTick((t) => t + 1))
  }, [controller])

  useTooltipEvents({
    tooltipRef,
    map,
    controller,
    selectedItemId: selectedItem?.id,
    activePopover,
    onClosePopover: () => setActivePopover(null),
  })

  if (!selectedItem || controller.readOnly) return null

  const bounds = getItemBounds(map, selectedItem)
  const leftPos = Math.round(bounds.cx)
  const topPos = Math.round(Math.max(16, bounds.minY - 44))
  const scheme = controller.scheme
  const style = selectedItem.style ?? {}
  const colorHex = resolveColor(style.color ?? 'ink', 'light')

  const updateStyle = (patch: Partial<Style>) =>
    controller.update(selectedItem.id, { style: { ...style, ...patch } })
  const toggle = (name: string) => setActivePopover((p) => (p === name ? null : name))

  const isShape = selectedItem.type === 'shape'
  const isArrow = selectedItem.type === 'arrow'
  const isSquareShape = isShape && (selectedItem as ShapeItem).kind === 'square'
  const isNote = selectedItem.type === 'note'
  const isTextOrNote = isNote || selectedItem.type === 'text'
  const hasTypography = isTextOrNote || isShape || isArrow
  const hasBorder =
    isShape ||
    isNote ||
    selectedItem.type === 'arrow' ||
    selectedItem.type === 'ruler' ||
    selectedItem.type === 'freedraw' ||
    selectedItem.type === 'pen'

  const currentText =
    selectedItem.type === 'note' || selectedItem.type === 'text'
      ? (selectedItem.text ?? '')
      : selectedItem.type === 'shape' || selectedItem.type === 'arrow'
        ? (selectedItem.label ?? '')
        : ''

  const handleUpdateText = (newText: string, newStyle: Partial<Style>) => {
    if (selectedItem.type === 'note' || selectedItem.type === 'text') {
      controller.update(selectedItem.id, { text: newText, style: { ...style, ...newStyle } })
    } else if (selectedItem.type === 'shape' || selectedItem.type === 'arrow') {
      controller.update(selectedItem.id, { label: newText, style: { ...style, ...newStyle } })
    }
  }

  const typographyLabel = resolveTypographyLabel(style, t)

  return (
    <div
      ref={tooltipRef}
      className={`tual-secondary-tooltip ${className ?? ''}`}
      style={{
        position: 'absolute',
        left: leftPos,
        top: topPos,
        transform: 'translateX(-50%)',
        zIndex: 500,
      }}
      onMouseEnter={() => map?.dragging?.disable()}
      onMouseLeave={() => {
        if (!activePopover && controller.tool === 'select') map?.dragging?.enable()
      }}
      onPointerDown={(e) => {
        e.stopPropagation()
        map?.dragging?.disable()
      }}
      onMouseDown={(e) => {
        e.stopPropagation()
        map?.dragging?.disable()
      }}
      onTouchStart={(e) => {
        e.stopPropagation()
        map?.dragging?.disable()
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {hasTypography && (
        <div style={{ position: 'relative' }}>
          <PillButton
            variant="secondary"
            title={t('textSizeAndStyle')}
            onClick={() => toggle('typography')}
            leading={
              <span
                style={{
                  opacity: 0.7,
                  fontWeight: 700,
                  fontSize: 11,
                  marginRight: 3,
                  letterSpacing: -0.5,
                }}
              >
                TT
              </span>
            }
            label={<span style={{ fontWeight: 500, margin: '0 4px' }}>{typographyLabel}</span>}
            trailing={<span style={{ fontSize: 9, opacity: 0.6 }}>⌄</span>}
          />
          {activePopover === 'typography' && (
            <TypographyDropdown
              currentSize={style.size}
              currentFontSize={style.fontSize}
              currentWeight={style.weight}
              currentFontStyle={style.fontStyle}
              currentUnderline={Boolean(style.underline || style.textDecoration === 'underline')}
              currentAlign={style.align}
              onUpdateStyle={updateStyle}
              onClose={() => setActivePopover(null)}
            />
          )}
        </div>
      )}

      <ColorSwatchControls
        map={map}
        isNote={isNote}
        isShape={isShape}
        style={style}
        scheme={scheme as 'light' | 'dark'}
        colorHex={colorHex}
        activePopover={activePopover}
        onToggle={toggle}
        onClose={() => setActivePopover(null)}
        onUpdateStyle={updateStyle}
      />

      {isTextOrNote && (
        <TextFormattingControls
          style={style}
          currentText={currentText}
          onUpdateStyle={updateStyle}
          onUpdateText={handleUpdateText}
        />
      )}

      <SecondaryTooltipExtras
        isNote={isNote}
        isShape={isShape}
        hasBorder={hasBorder}
        isSquareShape={isSquareShape}
        style={style}
        selectedItem={selectedItem}
        controller={controller}
        scheme={scheme as 'light' | 'dark'}
        activePopover={activePopover}
        onToggle={toggle}
        onClose={() => setActivePopover(null)}
        onUpdateStyle={updateStyle}
      />
    </div>
  )
}
