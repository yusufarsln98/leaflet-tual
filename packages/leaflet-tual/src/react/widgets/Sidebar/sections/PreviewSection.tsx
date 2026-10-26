'use client'

import type { Controller, Item, ShapeItem, Style } from '../../../../core/index.js'
import {
  resolveColor,
  resolveDash,
  resolveNoteColors,
  resolveSize,
  resolveWeight,
  resolveWidth,
} from '../../../../core/index.js'
import { useTranslation } from '../../../features/i18n/index.js'
import { Collapsible } from '../../../ui/index.js'

export interface PreviewSectionProps {
  selectedItem: Item
  style: Style
  controller: Controller
}

function renderShapeSvgElement(
  item: ShapeItem,
  w: number,
  h: number,
  cx: number,
  cy: number,
  radius: number,
  fillAttr: string,
  fillOpacity: number,
  strokeAttr: string,
  strokeWidth: number,
  dashArray?: string,
) {
  const minX = cx - w / 2
  const maxX = cx + w / 2
  const minY = cy - h / 2
  const maxY = cy + h / 2
  const common = {
    fill: fillAttr,
    fillOpacity,
    stroke: strokeAttr,
    strokeWidth,
    strokeDasharray: dashArray,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (item.kind) {
    case 'square': {
      const r = Math.min(radius, w / 2, h / 2)
      return <rect x={minX} y={minY} width={w} height={h} rx={r} ry={r} {...common} />
    }
    case 'circle':
      return <ellipse cx={cx} cy={cy} rx={w / 2} ry={h / 2} {...common} />
    case 'triangle':
      return <polygon points={`${cx},${minY} ${maxX},${maxY} ${minX},${maxY}`} {...common} />
    case 'diamond':
      return (
        <polygon
          points={`${cx},${minY} ${maxX},${cy} ${cx},${maxY} ${minX},${cy}`}
          {...common}
        />
      )
    case 'hexagon': {
      const rx = w / 2
      const ry = h / 2
      const pts = Array.from({ length: 6 }, (_, i) => {
        const angle = (Math.PI / 3) * i - Math.PI / 6
        return `${cx + rx * Math.cos(angle)},${cy + ry * Math.sin(angle)}`
      }).join(' ')
      return <polygon points={pts} {...common} />
    }
    case 'star': {
      const spikes = 5
      const outerRx = w / 2
      const outerRy = h / 2
      const innerRx = outerRx * 0.42
      const innerRy = outerRy * 0.42
      const pts = Array.from({ length: spikes * 2 }, (_, i) => {
        const rx = i % 2 === 0 ? outerRx : innerRx
        const ry = i % 2 === 0 ? outerRy : innerRy
        const angle = (i * Math.PI) / spikes - Math.PI / 2
        return `${cx + rx * Math.cos(angle)},${cy + ry * Math.sin(angle)}`
      }).join(' ')
      return <polygon points={pts} {...common} />
    }
    case 'marker': {
      const rx = w / 2
      const ry = h * 0.36
      const headCy = minY + ry
      const d = [
        `M ${cx} ${maxY}`,
        `C ${minX + w * 0.05} ${minY + h * 0.7}, ${minX} ${minY + h * 0.5}, ${minX} ${headCy}`,
        `A ${rx} ${ry} 0 1 1 ${maxX} ${headCy}`,
        `C ${maxX} ${minY + h * 0.5}, ${maxX - w * 0.05} ${minY + h * 0.7}, ${cx} ${maxY}`,
        'Z',
      ].join(' ')
      return <path d={d} {...common} />
    }
    case 'actor': {
      const headR = Math.min(w, h) * 0.16
      const headCy = minY + headR + h * 0.04
      const neckY = headCy + headR
      const hipY = minY + h * 0.64
      const armY = minY + h * 0.42
      const armSpan = w * 0.36
      const legSpan = w * 0.32
      return (
        <g {...common}>
          <circle cx={cx} cy={headCy} r={headR} />
          <line x1={cx} y1={neckY} x2={cx} y2={hipY} />
          <line x1={cx - armSpan} y1={armY} x2={cx + armSpan} y2={armY} />
          <line x1={cx} y1={hipY} x2={cx - legSpan} y2={maxY} />
          <line x1={cx} y1={hipY} x2={cx + legSpan} y2={maxY} />
        </g>
      )
    }
  }
}

export function PreviewSection({ selectedItem, style, controller }: PreviewSectionProps) {
  const { t } = useTranslation(controller)
  const opacity = style.opacity ?? 1
  const dashValues = resolveDash(style.dash ?? 'solid')
  const dashArray = dashValues.length > 0 ? dashValues.join(' ') : undefined
  const baseWidth = resolveWidth(
    selectedItem.type === 'note' ? (style.width ?? 's') : (style.width ?? 'm'),
  )
  const strokeWidth = style.dash === 'none' || style.width === 0 ? 0 : Math.min(baseWidth, 12)
  const fontWeight = resolveWeight(style.weight)
  const fontSize = Math.min(22, Math.max(10, resolveSize(style.size ?? 'm', style.fontSize)))

  const renderPreviewContent = () => {
    if (selectedItem.type === 'shape') {
      const strokeHex = resolveColor(style.strokeColor ?? style.color ?? 'blue', 'light')
      const fillHex = resolveColor(style.fillColor ?? style.color ?? 'blue', 'light')
      const fillMode = style.fill ?? 'solid'
      const fillAttr = fillMode === 'none' ? 'none' : fillHex
      const fillOpacity = fillMode === 'tint' ? 0.25 : fillMode === 'none' ? 0 : 1
      const strokeAttr = strokeWidth > 0 ? strokeHex : 'none'

      const rawW = Math.max(24, selectedItem.width ?? 96)
      const rawH = Math.max(24, selectedItem.height ?? 96)
      const maxBoxW = 140
      const maxBoxH = 74
      const scale = Math.min(maxBoxW / rawW, maxBoxH / rawH, 1)
      const w = Math.max(28, rawW * scale)
      const h = Math.max(28, rawH * scale)
      const radius = (style.radius ?? 8) * scale

      return (
        <div className="tual-sidebar-preview-stage" style={{ opacity }}>
          <svg
            className="tual-sidebar-preview-svg"
            viewBox="0 0 200 100"
            aria-label={t('preview')}
          >
            {renderShapeSvgElement(
              selectedItem,
              w,
              h,
              100,
              50,
              radius,
              fillAttr,
              fillOpacity,
              strokeAttr,
              strokeWidth,
              dashArray,
            )}
          </svg>
          {selectedItem.label && (
            <span
              className="tual-sidebar-preview-label-pill"
              data-position={selectedItem.labelPosition ?? 'center'}
              style={{
                fontWeight,
                fontStyle: style.fontStyle ?? 'normal',
                textDecoration:
                  style.underline || style.textDecoration === 'underline'
                    ? 'underline'
                    : 'none',
              }}
            >
              {selectedItem.label}
            </span>
          )}
        </div>
      )
    }

    if (selectedItem.type === 'note') {
      const noteColors = resolveNoteColors(
        style.color ?? 'yellow',
        'light',
        style.textColor,
        style.fillColor,
      )
      const strokeHex = resolveColor(style.textColor ?? 'ink', 'light')
      const borderStyle =
        style.dash === 'dashed' ? 'dashed' : style.dash === 'dotted' ? 'dotted' : 'solid'
      const radius = style.radius ?? 8

      return (
        <div
          className="tual-sidebar-preview-note"
          style={{
            opacity,
            backgroundColor: noteColors.bg,
            color: strokeHex,
            borderRadius: `${radius}px`,
            border:
              strokeWidth > 0 ? `${Math.min(strokeWidth, 6)}px ${borderStyle} ${strokeHex}` : 'none',
            fontSize: `${Math.min(fontSize, 15)}px`,
            fontWeight,
            fontStyle: style.fontStyle ?? 'normal',
            textDecoration:
              style.underline || style.textDecoration === 'underline' ? 'underline' : 'none',
            textAlign: style.align ?? 'left',
          }}
        >
          {selectedItem.text || t('note')}
        </div>
      )
    }

    if (selectedItem.type === 'text') {
      const textHex = resolveColor(style.textColor ?? style.color ?? 'ink', 'light')
      return (
        <div
          className="tual-sidebar-preview-text"
          style={{
            opacity,
            color: textHex,
            fontSize: `${fontSize}px`,
            fontWeight,
            fontStyle: style.fontStyle ?? 'normal',
            textDecoration:
              style.underline || style.textDecoration === 'underline' ? 'underline' : 'none',
            textAlign: style.align ?? 'left',
          }}
        >
          {selectedItem.text || t('text')}
        </div>
      )
    }

    const strokeHex = resolveColor(
      style.strokeColor ?? style.color ?? (selectedItem.type === 'arrow' ? 'blue' : 'ink'),
      'light',
    )
    const effectiveStroke = Math.max(1.5, strokeWidth || 2)

    let pathD = 'M 32 52 L 168 52'
    if (selectedItem.type === 'arrow') {
      if (selectedItem.kind === 'curved') {
        pathD = 'M 32 64 Q 100 20 168 64'
      } else if (selectedItem.kind === 'elbow') {
        pathD = 'M 32 68 L 100 68 L 100 34 L 168 34'
      } else if (selectedItem.kind === 's-curve') {
        pathD = 'M 32 68 C 100 68, 100 34, 168 34'
      }
    } else if (selectedItem.type === 'freedraw' || selectedItem.type === 'pen') {
      pathD = 'M 32 62 C 68 24, 132 80, 168 38'
    }

    return (
      <div className="tual-sidebar-preview-stage" style={{ opacity }}>
        <svg className="tual-sidebar-preview-svg" viewBox="0 0 200 100" aria-label={t('preview')}>
          <path
            d={pathD}
            fill="none"
            stroke={strokeHex}
            strokeWidth={effectiveStroke}
            strokeDasharray={dashArray}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {selectedItem.type === 'arrow' && (
            <polyline
              points="156,26 168,34 156,42"
              transform={
                selectedItem.kind === 'linear'
                  ? 'translate(0, 18)'
                  : selectedItem.kind === 'curved'
                    ? 'translate(0, 30) rotate(22 168 34)'
                    : undefined
              }
              fill="none"
              stroke={strokeHex}
              strokeWidth={effectiveStroke}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
        {(selectedItem.type === 'arrow' || selectedItem.type === 'ruler') &&
          selectedItem.label && (
            <span className="tual-sidebar-preview-label-pill">{selectedItem.label}</span>
          )}
      </div>
    )
  }

  return (
    <Collapsible title={t('preview')} className="tual-sidebar-section">
      <div className="tual-sidebar-preview-box">{renderPreviewContent()}</div>
    </Collapsible>
  )
}
