'use client'

import type { SegmentedControlProps } from './types.js'

const GROUP_CLASS: Record<NonNullable<SegmentedControlProps<string>['variant']>, string> = {
  'color-tabs': 'tual-color-tabs',
  'typo-tabs': 'tual-typo-tabs',
  'pill-tabs': 'tual-pill-tabs',
  'border-dash': 'tual-border-dash-group',
  recessed: 'tual-segmented-recessed',
  'button-group': '',
}

const ITEM_CLASS: Record<NonNullable<SegmentedControlProps<string>['variant']>, string> = {
  'color-tabs': 'tual-color-tab',
  'typo-tabs': 'tual-typo-tab',
  'pill-tabs': 'tual-pill-tab',
  'border-dash': 'tual-border-dash-btn',
  recessed: 'tual-segmented-recessed-item',
  'button-group': 'tual-btn',
}

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  variant = 'button-group',
  title,
  marginTop = 4,
  className,
  stopPropagation = false,
}: SegmentedControlProps<T>) {
  const groupCls = [GROUP_CLASS[variant], className ?? ''].filter(Boolean).join(' ')
  const itemCls = ITEM_CLASS[variant]
  const isButtonGroup = variant === 'button-group'

  return (
    <>
      {title && (
        <div className="tual-popover-header" style={{ marginTop }}>
          {title}
        </div>
      )}
      <div
        className={groupCls || undefined}
        style={isButtonGroup ? { display: 'flex', gap: 3 } : undefined}
        onPointerDown={stopPropagation ? (e) => e.stopPropagation() : undefined}
      >
        {options.map((opt) => (
          <button
            key={String(opt.value)}
            type="button"
            className={itemCls}
            data-active={value === opt.value}
            title={opt.title}
            style={
              isButtonGroup
                ? { flex: 1, height: 24, minHeight: 24, fontSize: 11 }
                : undefined
            }
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </>
  )
}

