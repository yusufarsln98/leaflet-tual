import type React from 'react'
import type { LeafletTualStyles } from '../../types/index.js'

export function getHistoryBtnStyle(
  enabled: boolean,
  isVertical: boolean,
  showToolLabels: boolean,
  unstyled: boolean,
  styles?: LeafletTualStyles,
): React.CSSProperties {
  const base: React.CSSProperties = unstyled
    ? {}
    : isVertical && showToolLabels
      ? {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: '8px 10px',
          flexGrow: 1,
          flexShrink: 0,
          flexBasis: 0,
          width: 'auto',
          height: 'auto',
          minHeight: '28px',
          borderRadius: '2px',
          border: '1px solid #767676',
          boxSizing: 'border-box',
          backgroundColor: '#efefef',
          color: '#000000',
          opacity: enabled ? 1 : 0.45,
          cursor: enabled ? 'pointer' : 'not-allowed',
          boxShadow: 'none',
          fontSize: '12px',
          fontWeight: 'normal',
          whiteSpace: 'nowrap',
        }
      : {
          padding: isVertical ? '0' : showToolLabels ? '2px 6px' : '3px 6px',
          width: isVertical ? '30px' : 'auto',
          height: isVertical ? '30px' : 'auto',
          borderRadius: '2px',
          border: '1px solid #767676',
          boxSizing: 'border-box',
          backgroundColor: '#efefef',
          color: '#000000',
          opacity: enabled ? 1 : 0.45,
          cursor: enabled ? 'pointer' : 'not-allowed',
          boxShadow: 'none',
          fontSize: '12px',
          fontWeight: 'normal',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          flexShrink: 0,
        }
  return {
    ...base,
    ...styles?.actionButton,
    ...(isVertical && !showToolLabels
      ? {
          padding: '0',
          width: styles?.actionButton?.width ?? '30px',
          height: styles?.actionButton?.height ?? '30px',
        }
      : undefined),
    ...(enabled ? undefined : styles?.actionButtonDisabled),
  }
}

export function getActionRowStyle(
  color: string,
  isVertical: boolean,
  showToolLabels: boolean,
  unstyled: boolean,
  styles?: LeafletTualStyles,
  extraStyle?: React.CSSProperties,
): React.CSSProperties {
  const base: React.CSSProperties = unstyled
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
          color,
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 'normal',
          whiteSpace: 'nowrap',
          boxShadow: 'none',
          flexShrink: 0,
        }
      : {
          padding: isVertical ? '0' : showToolLabels ? '2px 6px' : '3px 6px',
          width: isVertical ? '30px' : 'auto',
          height: isVertical ? '30px' : 'auto',
          borderRadius: '2px',
          border: '1px solid #767676',
          boxSizing: 'border-box',
          backgroundColor: '#efefef',
          color,
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 'normal',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          boxShadow: 'none',
          flexShrink: 0,
        }
  return {
    ...base,
    ...extraStyle,
    ...styles?.actionButton,
    ...(isVertical && !showToolLabels
      ? {
          padding: '0',
          width: styles?.actionButton?.width ?? '30px',
          height: styles?.actionButton?.height ?? '30px',
        }
      : undefined),
  }
}

