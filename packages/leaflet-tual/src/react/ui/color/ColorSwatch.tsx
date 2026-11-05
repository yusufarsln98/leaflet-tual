'use client'

import type { ColorSwatchProps } from './types.js'

export function ColorSwatch({
  colorHex,
  noFill = false,
  title,
  ariaLabel,
  selected = false,
  onClick,
}: ColorSwatchProps) {
  return (
    <button
      type="button"
      className="tual-secondary-swatch-btn"
      data-active={selected}
      title={title}
      aria-label={ariaLabel ?? title}
      onClick={onClick}
    >
      {noFill ? (
        <div className="tual-secondary-swatch-box tual-no-fill-swatch" />
      ) : (
        <div className="tual-secondary-swatch-box" style={{ backgroundColor: colorHex }} />
      )}
    </button>
  )
}
