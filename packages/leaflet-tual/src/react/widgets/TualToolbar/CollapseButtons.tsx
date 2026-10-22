import type React from 'react'
import type {
  TualIcons,
  TualLabels,
  LeafletTualClassNames,
  LeafletTualStyles,
  ToolbarOrientation,
  ToolbarPosition,
} from '../../types/index.js'
import { DEFAULT_ICONS } from './icons.js'
import { getCollapseChevronRotation, getExpandChevronRotation } from './utils.js'

export interface CollapseTriggerButtonProps {
  position: ToolbarPosition
  orientation: ToolbarOrientation
  isVertical: boolean
  showToolLabels: boolean
  unstyled: boolean
  labels?: TualLabels
  icons?: TualIcons
  classNames?: LeafletTualClassNames
  styles?: LeafletTualStyles
  onCollapse: () => void
}

export function CollapseTriggerButton({
  position,
  orientation,
  isVertical,
  showToolLabels,
  unstyled,
  labels,
  icons,
  classNames,
  styles,
  onCollapse,
}: CollapseTriggerButtonProps) {
  const rotation = getCollapseChevronRotation(position, orientation)
  const icon = icons?.collapseToolbar ?? DEFAULT_ICONS.collapseToolbar

  return (
    <button
      type="button"
      aria-label={labels?.collapseToolbar ?? 'Collapse toolbar'}
      title={labels?.collapseToolbar ?? 'Collapse toolbar'}
      data-toolbar-collapse="true"
      className={['rlc-toolbar-collapse-btn', classNames?.toolbarCollapseButton].filter(Boolean).join(' ')}
      onClick={onCollapse}
      style={{
        ...(unstyled
          ? {}
          : isVertical && showToolLabels
            ? {
                display: 'grid',
                gridTemplateColumns: '20px 1fr auto',
                alignItems: 'center',
                columnGap: '10px',
                padding: '8px 12px',
                textAlign: 'left',
                width: '100%',
                height: 'auto',
                borderRadius: '2px',
                border: '1px solid #767676',
                boxSizing: 'border-box',
                backgroundColor: '#efefef',
                color: '#000000',
                cursor: 'pointer',
                boxShadow: 'none',
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }
            : {
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: isVertical ? '0' : showToolLabels ? '2px 6px' : '3px 6px',
                width: isVertical ? '30px' : 'auto',
                height: isVertical ? '30px' : 'auto',
                borderRadius: '2px',
                border: '1px solid #767676',
                boxSizing: 'border-box',
                backgroundColor: '#efefef',
                color: '#000000',
                cursor: 'pointer',
                boxShadow: 'none',
                flexShrink: 0,
              }),
        ...styles?.toolButton,
        ...styles?.toolbarCollapseButton,
      }}
    >
      {isVertical && showToolLabels ? (
        <>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transform: rotation, transition: 'transform 0.15s ease' }}>
              {icon}
            </span>
          </span>
          <span style={{ whiteSpace: 'nowrap' }}>{labels?.collapseToolbar ?? 'Collapse'}</span>
          <span />
        </>
      ) : (
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transform: rotation, transition: 'transform 0.15s ease' }}>
          {icon}
        </span>
      )}
    </button>
  )
}

export interface ExpandTriggerButtonProps {
  position: ToolbarPosition
  orientation: ToolbarOrientation
  showToolLabels: boolean
  unstyled: boolean
  activeToolInfo: { icon: React.ReactNode; label: string }
  labels?: TualLabels
  icons?: TualIcons
  classNames?: LeafletTualClassNames
  styles?: LeafletTualStyles
  onExpand: () => void
}

export function ExpandTriggerButton({
  position,
  orientation,
  showToolLabels,
  unstyled,
  activeToolInfo,
  labels,
  icons,
  classNames,
  styles,
  onExpand,
}: ExpandTriggerButtonProps) {
  return (
    <button
      type="button"
      aria-label={labels?.expandToolbar ?? 'Expand toolbar'}
      title={labels?.expandToolbar ?? 'Expand toolbar'}
      data-toolbar-expand="true"
      className={['rlc-toolbar-expand-btn', classNames?.toolbarCollapseButton].filter(Boolean).join(' ')}
      onClick={onExpand}
      style={{
        ...(unstyled
          ? {}
          : {
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '3px 7px',
              borderRadius: '2px',
              backgroundColor: '#efefef',
              border: '1px solid #767676',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.15)',
              color: '#000000',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'normal',
              boxSizing: 'border-box',
            }),
        ...styles?.toolbarCollapseButton,
      }}
    >
      {activeToolInfo.icon}
      {showToolLabels && <span>{activeToolInfo.label}</span>}
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.8,
          transform: getExpandChevronRotation(position, orientation),
          transition: 'transform 0.15s ease',
        }}
      >
        {icons?.expandToolbar ?? DEFAULT_ICONS.expandToolbar}
      </span>
    </button>
  )
}

