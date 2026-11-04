'use client'

import type { ColorSwatchListProps } from './types.js'

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
  if (variant === 'border-flyout') {
    return (
      <div className="tual-border-palette-list">
        {items.map((item) => (
          <button
            key={item.name}
            type="button"
            className="tual-border-palette-item"
            data-selected={selectedColor === item.name || selectedColor === item.hex}
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
        const isSelected =
          (selectedColor === item.name || selectedColor === item.hex) && !noFillSelected
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

