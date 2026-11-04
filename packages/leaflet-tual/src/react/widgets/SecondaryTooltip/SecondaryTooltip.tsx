'use client'

import { memo, useRef, useState } from 'react'
import L from 'leaflet'
import type { Controller, Item, ShapeItem, Style } from '../../../core/index.js'
import {
  DEFAULT_PALETTE,
  getSecondaryTooltipAnchor,
  resolveColor,
  resolveItemStyle,
  resolveTypographyLabel,
} from '../../../core/index.js'
import { useControllerState, useOverlayMapSync } from '../../features/index.js'
import { TranslationProvider, useTranslation } from '../../features/i18n/index.js'
import { PillButton } from '../../ui/index.js'
import { useTooltipEvents } from './utils/index.js'
import { TypographyDropdown, TextFormattingControls } from './typography/index.js'
import { ColorSwatchControls } from './color/index.js'
import { SecondaryTooltipExtras } from './popovers/index.js'

export interface SecondaryTooltipProps {
  map: L.Map
  controller: Controller
  sidebarOpen?: boolean
  onOpenSidebar?: () => void
  className?: string
}

export const SecondaryTooltip = memo(function SecondaryTooltip({
  map,
  controller,
  sidebarOpen = false,
  onOpenSidebar,
  className,
}: SecondaryTooltipProps) {
  const { t } = useTranslation(controller)
  const [activePopover, setActivePopover] = useState<string | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const selectedItem = controller.selected[0] as Item | undefined

  useControllerState(controller)

  useTooltipEvents({
    tooltipRef,
    map,
    controller,
    selectedItemId: selectedItem?.id,
    activePopover,
    onClosePopover: () => setActivePopover(null),
  })

  useOverlayMapSync(map, () => {
    const el = tooltipRef.current
    if (!el || !selectedItem) return
    const pos = getSecondaryTooltipAnchor(map, selectedItem)
    el.style.left = `${pos.x}px`
    el.style.top = `${pos.y}px`
  })

  if (controller.selected.length !== 1 || !selectedItem || controller.readOnly || sidebarOpen) {
    return null
  }

  const { x: leftPos, y: topPos } = getSecondaryTooltipAnchor(map, selectedItem)
  const style = selectedItem.style ?? {}

  const updateStyle = (patch: Partial<Style>) =>
    controller.update(selectedItem.id, { style: { ...style, ...patch } })
  const toggle = (name: string) => setActivePopover((p) => (p === name ? null : name))

  const isShape = selectedItem.type === 'shape'
  const isArrow = selectedItem.type === 'arrow'
  const isSquareShape = isShape && (selectedItem as ShapeItem).kind === 'square'
  const isNote = selectedItem.type === 'note'
  const isTextOrNote = isNote || selectedItem.type === 'text'
  const resolvedStyle = isShape || isNote ? resolveItemStyle(selectedItem) : undefined
  const colorHex =
    resolvedStyle?.strokeColor ??
    resolveColor(
      style.color ??
        (isShape || isArrow ? DEFAULT_PALETTE.blue : DEFAULT_PALETTE.ink),
    )
  const hasTypography = isTextOrNote || isShape || isArrow
  const hasBorder = selectedItem.type !== 'text'

  const currentText =
    selectedItem.type === 'note' || selectedItem.type === 'text'
      ? selectedItem.text ?? ''
      : selectedItem.type === 'shape' || selectedItem.type === 'arrow'
      ? selectedItem.label ?? ''
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
    <TranslationProvider translations={controller.translations}>
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
        onPointerDown={(e) => {
          if (e.button === 0) {
            e.stopPropagation()
            map?.dragging?.disable()
          }
        }}
        onMouseDown={(e) => {
          if (e.button === 0) {
            e.stopPropagation()
            map?.dragging?.disable()
          }
        }}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        {hasTypography && (
          <div style={{ position: 'relative' }}>
            <PillButton
              variant="secondary"
              title={t('textSizeAndStyle', undefined, 'Text style')}
              onClick={() => toggle('typography')}
              leading={
                <span
                  style={{
                    color: 'var(--tual-text-secondary)',
                    fontWeight: 500,
                    fontSize: 13,
                    marginRight: 4,
                    letterSpacing: -0.2,
                  }}
                >
                  Aa
                </span>
              }
              label={<span style={{ fontWeight: 500, margin: '0 2px' }}>{typographyLabel}</span>}
              trailing={
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{ opacity: 0.6, marginLeft: 2 }}
                >
                  <path
                    d="M4 6L8 10L12 6"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
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
          isArrow={isArrow}
          style={style}
          colorHex={colorHex}
          resolvedStyle={resolvedStyle}
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
          activePopover={activePopover}
          sidebarOpen={sidebarOpen}
          onOpenSidebar={onOpenSidebar}
          onToggle={toggle}
          onClose={() => setActivePopover(null)}
          onUpdateStyle={updateStyle}
        />
      </div>
    </TranslationProvider>
  )
})
