'use client'

import type { ColorSwatchListProps } from './types.js'
import { parseColorString, rgbToHex } from '../../../core/index.js'

export function ColorSwatchList({
  items,
  selectedColor,
  showNoFill = false,
  noFillSelected = false,
  noFillLabel = 'No fill',
  onSelectNoFill,
  onSelectColor,
}: ColorSwatchListProps) {
  const parsedSelected = selectedColor ? parseColorString(selectedColor) : null
  const selectedHex = parsedSelected
    ? rgbToHex(parsedSelected.r, parsedSelected.g, parsedSelected.b).toLowerCase()
    : null

  const isItemActive = (item: { hex: string }) => {
    if (noFillSelected) return false
    return selectedHex === item.hex.toLowerCase()
  }

  return (
    <div className="tual-color-list" onPointerDown={(e) => e.stopPropagation()}>
      {showNoFill && onSelectNoFill && (
        <button
          type="button"
          className="tual-color-row"
          data-active={noFillSelected}
          onClick={onSelectNoFill}
        >
          <div className="tual-no-fill-swatch" />
          <span className="tual-color-label">{noFillLabel}</span>
          {noFillSelected && <span className="tual-check">✓</span>}
        </button>
      )}

      {items.map((item) => {
        const isSelected = isItemActive(item)
        return (
          <button
            key={item.hex}
            type="button"
            className="tual-color-row"
            title={item.title ?? item.hex}
            data-active={isSelected}
            onClick={() => onSelectColor(item.hex)}
          >
            <div className="tual-color-swatch-box" style={{ backgroundColor: item.hex }} />
            <span className="tual-color-label">{item.hex.toUpperCase()}</span>
            {isSelected && <span className="tual-check">✓</span>}
          </button>
        )
      })}
    </div>
  )
}
