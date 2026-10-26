'use client'

import type { ColorName } from '../../../core/index.js'
import { DEFAULT_PALETTE, resolveColor } from '../../../core/index.js'
import { useTranslation } from '../../features/i18n/index.js'
import { ColorSwatch } from './ColorSwatch.js'
import type { ColorPaletteGridProps } from './types.js'

export const DEFAULT_COLOR_NAMES: ColorName[] = [
  'ink',
  'gray',
  'taupe',
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple',
  'pink',
]

export function ColorPaletteGrid({
  colors = DEFAULT_COLOR_NAMES,
  selectedColor,
  scheme = 'light',
  variant = 'palette',
  header,
  onSelectColor,
}: ColorPaletteGridProps) {
  const { t } = useTranslation()

  return (
    <>
      {header !== undefined && <div className="tual-popover-header">{header}</div>}
      <div className={variant === 'border' ? 'tual-border-color-row' : 'tual-palette'}>
        {colors.map((name) => {
          const hex =
            variant === 'border'
              ? resolveColor(name, scheme)
              : DEFAULT_PALETTE[name].light
          const fallbackLabel =
            variant === 'border'
              ? name.charAt(0).toUpperCase() + name.slice(1)
              : name
          return (
            <ColorSwatch
              key={name}
              variant={variant === 'border' ? 'border-circle' : 'palette-circle'}
              colorHex={hex}
              selected={selectedColor === name}
              title={t(name, undefined, fallbackLabel)}
              ariaLabel={t(name, undefined, name)}
              onClick={() => onSelectColor(name)}
            />
          )
        })}
      </div>
    </>
  )
}

