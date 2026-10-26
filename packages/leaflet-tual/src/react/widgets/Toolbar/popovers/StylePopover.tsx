'use client'

import type { Controller, FontSizeName, Style } from '../../../../core/index.js'
import {
  ButtonGroupSection,
  ColorPaletteSection,
} from './StylePopoverSections.js'

export interface StylePopoverProps {
  controller: Controller
  className?: string
  onClose?: () => void
}

export function StylePopover({ controller, className }: StylePopoverProps) {
  const selectedItem = controller.selected[0]
  const targetType = selectedItem ? selectedItem.type : controller.tool

  const currentStyle: Style = selectedItem?.style ?? controller.style
  const currentColor = currentStyle.color ?? 'ink'
  const currentWidth =
    currentStyle.width === 's' || currentStyle.width === 'l' ? currentStyle.width : 'm'
  const currentDash = currentStyle.dash ?? 'solid'
  const currentFill = currentStyle.fill ?? 'solid'
  const currentSize: FontSizeName =
    currentStyle.size === 's' || currentStyle.size === 'l' || currentStyle.size === 'xl'
      ? currentStyle.size
      : 'm'
  const currentWeight: 'regular' | 'bold' =
    currentStyle.weight === 'bold' ? 'bold' : 'regular'
  const currentAlign = currentStyle.align ?? 'left'

  const showWidth =
    targetType === 'shape' ||
    targetType === 'arrow' ||
    targetType === 'freedraw' ||
    targetType === 'pen' ||
    targetType === 'ruler' ||
    (!selectedItem && (controller.tool === 'select' || controller.tool === 'freedraw' || controller.tool === 'pen'))

  const showDash =
    targetType === 'shape' ||
    targetType === 'arrow' ||
    targetType === 'freedraw' ||
    targetType === 'pen' ||
    (!selectedItem && (controller.tool === 'select' || controller.tool === 'freedraw' || controller.tool === 'pen'))

  const showFill =
    targetType === 'shape' ||
    (!selectedItem && (controller.tool === 'shape' || controller.tool === 'select'))

  const showSize =
    targetType === 'note' ||
    targetType === 'text' ||
    (!selectedItem && (controller.tool === 'note' || controller.tool === 'text' || controller.tool === 'select'))

  const showWeight =
    targetType === 'text' ||
    (!selectedItem && (controller.tool === 'text' || controller.tool === 'select'))

  const showAlign =
    targetType === 'text' ||
    (!selectedItem && (controller.tool === 'text' || controller.tool === 'select'))

  return (
    <div
      className={`tual-popover ${className ?? ''}`}
      style={{
        position: 'absolute',
        top: 'calc(100% + 6px)',
        left: 0,
        minWidth: 190,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <ColorPaletteSection
        selectedColor={currentColor}
        scheme={controller.scheme}
        onSelectColor={(color) => controller.setStyle({ color })}
      />

      {showWidth && (
        <>
          <div className="tual-popover-divider" />
          <ButtonGroupSection
            title="Stroke Width"
            options={['s', 'm', 'l'] as const}
            currentValue={currentWidth}
            formatLabel={(w) => w.toUpperCase()}
            onSelect={(width) => controller.setStyle({ width })}
          />
        </>
      )}

      {showDash && (
        <ButtonGroupSection
          title="Stroke Dash"
          options={['solid', 'dashed', 'dotted'] as const}
          currentValue={currentDash}
          onSelect={(dash) => controller.setStyle({ dash })}
        />
      )}

      {showFill && (
        <ButtonGroupSection
          title="Fill"
          options={['none', 'tint', 'solid'] as const}
          currentValue={currentFill}
          onSelect={(fill) => controller.setStyle({ fill })}
        />
      )}

      {showSize && (
        <ButtonGroupSection
          title="Font Size"
          options={['s', 'm', 'l', 'xl'] as const}
          currentValue={currentSize}
          formatLabel={(s) => s.toUpperCase()}
          onSelect={(size) => controller.setStyle({ size })}
        />
      )}

      {showWeight && (
        <ButtonGroupSection
          title="Weight"
          options={['regular', 'bold'] as const}
          currentValue={currentWeight}
          formatLabel={(w) => w.charAt(0).toUpperCase() + w.slice(1)}
          onSelect={(weight) => controller.setStyle({ weight })}
        />
      )}

      {showAlign && (
        <ButtonGroupSection
          title="Align"
          options={['left', 'center', 'right'] as const}
          currentValue={currentAlign}
          formatLabel={(a) => a.charAt(0).toUpperCase() + a.slice(1)}
          onSelect={(align) => controller.setStyle({ align })}
        />
      )}
    </div>
  )
}
