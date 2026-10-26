'use client'

import type { ColorSwatchProps } from './types.js'

export function ColorSwatch({
  colorHex,
  noFill = false,
  title,
  ariaLabel,
  selected = false,
  variant = 'secondary-button',
  onClick,
}: ColorSwatchProps) {
  if (variant === 'palette-circle') {
    return (
      <button
        type="button"
        className="tual-swatch"
        data-selected={selected}
        style={{
          backgroundColor: colorHex,
          outline: selected ? '2px solid var(--tual-accent)' : undefined,
          outlineOffset: 2,
        }}
        title={title}
        aria-label={ariaLabel ?? title}
        onClick={onClick}
      />
    )
  }

  if (variant === 'border-circle') {
    return (
      <button
        type="button"
        className="tual-border-swatch"
        data-active={selected || undefined}
        style={{ backgroundColor: colorHex }}
        title={title}
        aria-label={ariaLabel ?? title}
        onClick={onClick}
      />
    )
  }

  return (
    <button
      type="button"
      className="tual-secondary-swatch-btn"
      title={title}
      aria-label={ariaLabel ?? title}
      onClick={onClick}
    >
      {noFill ? (
        <div className="tual-secondary-swatch-box tual-no-fill-swatch" />
      ) : (
        <div
          className="tual-secondary-swatch-box"
          style={{ backgroundColor: colorHex }}
        />
      )}
    </button>
  )
}

