'use client'

import type { ColorSwatchListProps } from './types.js'
import { parseColorString, rgbToHex } from '../../../core/index.js'

export function ColorSwatchList({
  items,
  selectedColor,
  variant = 'color-dropdown',
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

  const isItemActive = (item: { name: string; hex: string }) => {
    if (noFillSelected) return false
    return (
      selectedColor === item.name ||
      selectedColor?.toLowerCase() === item.hex.toLowerCase() ||
      selectedHex === item.hex.toLowerCase()
    )
  }

  if (variant === 'border-flyout') {
    return (
      <div className="tual-border-palette-list">
        {items.map((item) => (
          <button
            key={item.name}
            type="button"
            className="tual-border-palette-item"
            data-selected={isItemActive(item)}
            title={item.title ?? item.name}
            onClick={() => onSelectColor(item.name, item.hex)}
          >
            <div
              className="tual-border-palette-swatch"
              style={{ backgroundColor: item.hex }}
            />
            <span className="tual-border-palette-hex">{item.hex.toUpperCase()}</span>
          </button>
        ))}
      </div>
    )
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
            key={item.name}
            type="button"
            className="tual-color-row"
            title={item.title ?? item.name}
            data-active={isSelected}
            onClick={() => onSelectColor(item.name, item.hex)}
          >
            <div
              className="tual-color-swatch-box"
              style={{ backgroundColor: item.hex }}
            />
            <span className="tual-color-label">{item.hex.toUpperCase()}</span>
            {isSelected && <span className="tual-check">✓</span>}
          </button>
        )
      })}
    </div>
  )
}

