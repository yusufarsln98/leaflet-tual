import type {
  TualIcons,
  LeafletTualClassNames,
  LeafletTualStyles,
} from '../../types/index.js'
import { DEFAULT_ICONS } from './icons.js'

export interface PixelSelectProps {
  /** Visible label and accessible name. */
  label: string
  /** Currently applied value in pixels. */
  value: number
  /** Preset pixel values. The current value is merged in if missing. */
  options: readonly number[]
  onChange: (value: number) => void
  /** Optional data attribute to distinguish multiple selects. */
  control?: string
  unstyled?: boolean
  classNames?: LeafletTualClassNames
  styles?: LeafletTualStyles
  icons?: TualIcons
}

/**
 * Labeled `<select>` listing pixel values (e.g. `1px`, `2px`, ...).
 * Styled via the `toolbarSelect` slot and `rlc-toolbar-select` class.
 */
export function PixelSelect({
  label,
  value,
  options,
  onChange,
  control,
  unstyled,
  classNames,
  styles,
  icons,
}: PixelSelectProps) {
  const merged = Array.from(new Set([...options, value])).sort((a, b) => a - b)
  const chevronIcon = icons?.dropdownChevron ?? DEFAULT_ICONS.dropdownChevron

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <span style={{ fontSize: '12px', color: 'inherit' }}>{label}</span>
      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
        <select
          aria-label={label}
          data-control={control}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={['rlc-toolbar-select', classNames?.toolbarSelect]
            .filter(Boolean)
            .join(' ')}
          style={{
            ...(unstyled
              ? {}
              : {
                  padding: '1px 16px 1px 4px',
                  borderRadius: '2px',
                  border: '1px solid #767676',
                  backgroundColor: '#efefef',
                  color: '#000000',
                  fontSize: '12px',
                  cursor: 'pointer',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                }),
            ...styles?.toolbarSelect,
          }}
        >
          {merged.map((v) => (
            <option
              key={v}
              value={v}
            >
              {v}px
            </option>
          ))}
        </select>
        {!unstyled && (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              right: '3px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.7,
              color: 'currentColor',
            }}
          >
            {chevronIcon}
          </span>
        )}
      </div>
    </div>
  )
}
