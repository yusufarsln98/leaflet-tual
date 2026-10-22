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
import type { ArrowOption, ShapeOption } from './types.js'

export function buildArrowOptions(labels?: TualLabels, icons?: TualIcons): readonly ArrowOption[] {
  return [
    {
      id: 'arrow-linear',
      style: 'linear',
      label: labels?.arrowLinear ?? 'Linear Arrow',
      shortcut: 'A',
      icon: icons?.arrowLinear ?? DEFAULT_ICONS.arrowLinear,
    },
    {
      id: 'arrow-curved',
      style: 'curved',
      label: labels?.arrowCurved ?? 'Curved Arrow',
      shortcut: 'C',
      icon: icons?.arrowCurved ?? DEFAULT_ICONS.arrowCurved,
    },
    {
      id: 'arrow-bi',
      style: 'bi',
      label: labels?.arrowBi ?? 'Double-Headed',
      shortcut: 'B',
      icon: icons?.arrowBi ?? DEFAULT_ICONS.arrowBi,
    },
    {
      id: 'arrow-elbow',
      style: 'elbow',
      label: labels?.arrowElbow ?? 'Elbow / Step',
      shortcut: 'E',
      icon: icons?.arrowElbow ?? DEFAULT_ICONS.arrowElbow,
    },
    {
      id: 'arrow-s-curve',
      style: 's-curve',
      label: labels?.arrowSCurve ?? 'S-Curve Arrow',
      shortcut: 'S',
      icon: icons?.arrowSCurve ?? DEFAULT_ICONS.arrowSCurve,
    },
  ]
}

export function buildShapeOptions(labels?: TualLabels, icons?: TualIcons): readonly ShapeOption[] {
  return [
    { kind: 'square', label: labels?.shapeSquare ?? 'Square', icon: icons?.shapeSquare ?? DEFAULT_ICONS.shapeSquare },
    { kind: 'circle', label: labels?.shapeCircle ?? 'Circle', icon: icons?.shapeCircle ?? DEFAULT_ICONS.shapeCircle },
    { kind: 'star', label: labels?.shapeStar ?? 'Star', icon: icons?.shapeStar ?? DEFAULT_ICONS.shapeStar },
    { kind: 'actor', label: labels?.shapeActor ?? 'Actor', icon: icons?.shapeActor ?? DEFAULT_ICONS.shapeActor },
    { kind: 'triangle', label: labels?.shapeTriangle ?? 'Triangle', icon: icons?.shapeTriangle ?? DEFAULT_ICONS.shapeTriangle },
    { kind: 'diamond', label: labels?.shapeDiamond ?? 'Diamond', icon: icons?.shapeDiamond ?? DEFAULT_ICONS.shapeDiamond },
    { kind: 'hexagon', label: labels?.shapeHexagon ?? 'Hexagon', icon: icons?.shapeHexagon ?? DEFAULT_ICONS.shapeHexagon },
    { kind: 'marker', label: labels?.shapeMarker ?? 'Marker', icon: icons?.shapeMarker ?? DEFAULT_ICONS.shapeMarker },
  ]
}

export function getToolbarButtonStyle(
  isActive: boolean,
  isVertical: boolean,
  showToolLabels: boolean,
  readOnly: boolean,
  unstyled: boolean,
  styles?: LeafletTualStyles,
): React.CSSProperties {
  const baseStyle: React.CSSProperties = unstyled
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
          border: isActive ? '1px solid #4f4f4f' : '1px solid #767676',
          boxSizing: 'border-box',
          backgroundColor: isActive ? '#e0e0e0' : '#efefef',
          color: '#000000',
          fontWeight: 'normal',
          fontSize: '12px',
          lineHeight: '16px',
          cursor: 'pointer',
          boxShadow: isActive ? 'inset 1px 1px 2px rgba(0, 0, 0, 0.2)' : 'none',
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }
      : {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          gap: showToolLabels ? '6px' : '0px',
          padding: isVertical ? '0' : showToolLabels ? '2px 7px' : '3px 6px',
          width: isVertical ? '30px' : 'auto',
          height: isVertical ? '30px' : 'auto',
          minWidth: isVertical ? '30px' : undefined,
          minHeight: isVertical ? '30px' : undefined,
          borderRadius: '2px',
          border: isActive ? '1px solid #4f4f4f' : '1px solid #767676',
          boxSizing: 'border-box',
          backgroundColor: isActive ? '#e0e0e0' : '#efefef',
          color: '#000000',
          fontWeight: 'normal',
          fontSize: '12px',
          lineHeight: '16px',
          cursor: 'pointer',
          boxShadow: isActive ? 'inset 1px 1px 2px rgba(0, 0, 0, 0.2)' : 'none',
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }

  return {
    ...baseStyle,
    ...styles?.toolButton,
    ...(isActive ? styles?.toolButtonActive : undefined),
    ...(isVertical && !showToolLabels
      ? {
          padding: '0',
          width: styles?.toolButton?.width ?? '30px',
          height: styles?.toolButton?.height ?? '30px',
        }
      : undefined),
    ...(readOnly && !isActive ? { opacity: 0.45, cursor: 'not-allowed' } : undefined),
  }
}

export function getToolbarButtonClassName(
  isActive: boolean,
  classNames?: LeafletTualClassNames,
): string {
  return ['rlc-tool-btn', classNames?.toolButton, isActive ? classNames?.toolButtonActive : undefined]
    .filter(Boolean)
    .join(' ')
}

export function getPopupPlacementStyle(
  position: ToolbarPosition,
  orientation: ToolbarOrientation,
  centerHorizontally = false,
): React.CSSProperties {
  const isVertical = orientation === 'vertical'
  const isRight = position.includes('right')
  const isLeft = position.includes('left')
  const isBottom = position.includes('bottom')

  if (isVertical) {
    return {
      ...(isBottom ? { bottom: 0 } : { top: 0 }),
      ...(isRight ? { right: 'calc(100% + 8px)' } : { left: 'calc(100% + 8px)' }),
    }
  }

  return {
    ...(isRight
      ? { right: 0 }
      : isLeft || !centerHorizontally
        ? { left: 0 }
        : { left: '50%', transform: 'translateX(-50%)' }),
    ...(isBottom ? { bottom: 'calc(100% + 8px)' } : { top: 'calc(100% + 8px)' }),
  }
}

export function getToolbarContainerStyle(
  position: ToolbarPosition,
  isVertical: boolean,
  unstyled: boolean,
): React.CSSProperties {
  if (unstyled) return {}
  return isVertical
    ? {
        display: 'flex',
        flexDirection: position === 'right' || position === 'right-center' ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        gap: '8px',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }
    : {
        display: 'flex',
        flexDirection: position === 'bottom' || position === 'bottom-center' ? 'column-reverse' : 'column',
        alignItems: 'center',
        gap: '8px',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }
}

export function getActiveToolInfo(
  activeTool: string,
  isArrowToolActive: boolean,
  currentArrowIcon: React.ReactNode,
  arrowGroupLabel: string,
  currentShapeIcon: React.ReactNode,
  shapesGroupLabel: string,
  icons?: TualIcons,
  labels?: TualLabels,
): { icon: React.ReactNode; label: string } {
  if (activeTool === 'select') return { icon: icons?.select ?? DEFAULT_ICONS.select, label: labels?.select ?? 'Select' }
  if (activeTool === 'freedraw') return { icon: icons?.freedraw ?? DEFAULT_ICONS.freedraw, label: labels?.freedraw ?? 'Free Draw' }
  if (activeTool === 'ruler') return { icon: icons?.ruler ?? DEFAULT_ICONS.ruler, label: labels?.ruler ?? 'Ruler' }
  if (isArrowToolActive) return { icon: currentArrowIcon, label: arrowGroupLabel }
  if (activeTool === 'shape') return { icon: currentShapeIcon, label: shapesGroupLabel }
  if (activeTool === 'note') return { icon: icons?.note ?? DEFAULT_ICONS.note, label: labels?.note ?? 'Note Card' }
  if (activeTool === 'text') return { icon: icons?.text ?? DEFAULT_ICONS.text, label: labels?.text ?? 'Normal Text' }
  return { icon: icons?.shapesGroup ?? DEFAULT_ICONS.shapesGroup, label: 'Tools' }
}

