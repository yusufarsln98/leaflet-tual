'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import type { Controller, Item, ShapeItem, Style } from '../../../core/index.js'
import { resolveColor, resolveNoteColors } from '../../../core/index.js'
import { ICONS, LABEL_POSITION_ICONS } from '../Toolbar/icons.js'
import { ColorDropdown } from './ColorDropdown.js'
import { BorderPopover } from './BorderPopover.js'
import { getItemBounds } from './get-item-bounds.js'
import { LabelPositionDropdown } from './LabelPositionDropdown.js'
import { MoreOptionsDropdown } from './MoreOptionsDropdown.js'
import { RadiusDropdown } from './RadiusDropdown.js'
import { TypographyDropdown } from './TypographyDropdown.js'

export interface SecondaryTooltipProps {
  map: L.Map; controller: Controller; className?: string
}

export function SecondaryTooltip({ map, controller, className }: SecondaryTooltipProps) {
  const [activePopover, setActivePopover] = useState<string | null>(null)
  const [, setTick] = useState(0)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const selectedItem = controller.selected[0] as Item | undefined

  useEffect(() => {
    const unsub = controller.on('state', () => {
      setTick((t) => t + 1)
    })
    return unsub
  }, [controller])

  // Double-clicking the tooltip or wheel scrolling inside it must never zoom the map
  useEffect(() => {
    const el = tooltipRef.current
    if (!el) return
    const stop = (event: Event) => event.stopPropagation()
    el.addEventListener('dblclick', stop)
    el.addEventListener('wheel', stop, { passive: true })
    return () => {
      el.removeEventListener('dblclick', stop)
      el.removeEventListener('wheel', stop)
    }
  }, [selectedItem?.id])

  // Re-enable map dragging when any pointerup occurs on window
  useEffect(() => {
    const handleGlobalUp = () => {
      if (controller.tool === 'select') {
        map?.dragging?.enable()
      }
    }
    window.addEventListener('pointerup', handleGlobalUp)
    window.addEventListener('mouseup', handleGlobalUp)
    window.addEventListener('touchend', handleGlobalUp)
    return () => {
      window.removeEventListener('pointerup', handleGlobalUp)
      window.removeEventListener('mouseup', handleGlobalUp)
      window.removeEventListener('touchend', handleGlobalUp)
    }
  }, [controller.tool, map])

  // Keep menu open until clicking outside (lose focus) or pressing Escape
  useEffect(() => {
    if (!activePopover) return

    const handlePointerDownOutside = (e: MouseEvent | TouchEvent | PointerEvent) => {
      const target = e.target as Node | null
      if (tooltipRef.current && target && !tooltipRef.current.contains(target)) {
        setActivePopover(null)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActivePopover(null)
      }
    }

    document.addEventListener('pointerdown', handlePointerDownOutside, true)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDownOutside, true)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [activePopover])

  if (!selectedItem || controller.readOnly) return null

  const bounds = getItemBounds(map, selectedItem)
  const leftPos = Math.round(bounds.cx)
  const topPos = Math.round(Math.max(16, bounds.minY - 44))
  const scheme = controller.scheme
  const style = selectedItem.style ?? {}
  const colorHex = resolveColor(style.color ?? 'ink', scheme)

  const updateStyle = (patch: Partial<Style>) => controller.update(selectedItem.id, { style: { ...style, ...patch } })
  const toggle = (name: string) => setActivePopover((p) => (p === name ? null : name))

  const isShape = selectedItem.type === 'shape'
  const isArrow = selectedItem.type === 'arrow'
  const isSquareShape = isShape && (selectedItem as ShapeItem).kind === 'square'
  const isNote = selectedItem.type === 'note'
  const isTextOrNote = isNote || selectedItem.type === 'text'
  const hasTypography = isTextOrNote || isShape || isArrow
  const hasBorder =
    isShape ||
    isNote ||
    selectedItem.type === 'arrow' ||
    selectedItem.type === 'ruler' ||
    selectedItem.type === 'freedraw' ||
    selectedItem.type === 'pen'

  const isBold =
    style.weight === 'bold' ||
    style.weight === 700 ||
    style.weight === 'semibold' ||
    style.weight === 'black' ||
    style.weight === 600 ||
    style.weight === 800

  const isItalic = style.fontStyle === 'italic'
  const isUnderline = Boolean(style.underline || style.textDecoration === 'underline')

  const toggleBold = () => {
    updateStyle({ weight: isBold ? 'regular' : 'bold' })
  }

  const toggleItalic = () => {
    updateStyle({ fontStyle: isItalic ? 'normal' : 'italic' })
  }

  const toggleUnderline = () => {
    updateStyle({
      underline: !isUnderline,
      textDecoration: !isUnderline ? 'underline' : 'none',
    })
  }

  const getItemText = (): string => {
    if (isTextOrNote) {
      return (selectedItem as any).text ?? ''
    }
    if (isShape || isArrow) {
      return (selectedItem as any).label ?? ''
    }
    return ''
  }

  const currentText = getItemText()
  const textLines = currentText.split('\n')
  const hasContent = textLines.some((l) => l.trim().length > 0)
  const isBulleted =
    style.list === 'bullet' ||
    style.bullets === true ||
    (hasContent &&
      textLines
        .filter((l) => l.trim().length > 0)
        .every((l) => /^\s*([•\-\*])\s+/.test(l) || /^\s*•/.test(l)))

  const toggleBullets = () => {
    const willBeBulleted = !isBulleted
    let newText = ''
    if (willBeBulleted) {
      if (!currentText) {
        newText = '• '
      } else {
        newText = textLines
          .map((l) => {
            if (!l.trim()) return l
            if (/^\s*([•\-\*])\s+/.test(l) || /^\s*•/.test(l)) return l
            return `• ${l}`
          })
          .join('\n')
      }
    } else {
      newText = textLines
        .map((l) => l.replace(/^(\s*)([•\-\*]\s*)/, '$1'))
        .join('\n')
    }

    const patch: any = {
      style: {
        ...style,
        list: willBeBulleted ? 'bullet' : 'none',
        bullets: willBeBulleted,
      },
    }
    if (isTextOrNote) {
      patch.text = newText
    } else if (isShape || isArrow) {
      patch.label = newText
    }
    controller.update(selectedItem.id, patch)
  }

  let typographyLabel = 'Body'
  if (style.fontSize) {
    typographyLabel = `${style.fontSize}px`
  } else if (style.size === 'xl') {
    typographyLabel = 'Heading 1'
  } else if (style.size === 'l') {
    typographyLabel = 'Heading 2'
  } else if (style.size === 's') {
    typographyLabel = 'Caption'
  }

  return (
    <div
      ref={tooltipRef}
      className={`tual-secondary-tooltip ${className ?? ''}`}
      style={{
        position: 'absolute',
        left: leftPos,
        top: topPos,
        transform: 'translateX(-50%)',
        zIndex: 500,
      }}
      onMouseEnter={() => {
        map?.dragging?.disable()
      }}
      onMouseLeave={() => {
        if (!activePopover && controller.tool === 'select') {
          map?.dragging?.enable()
        }
      }}
      onPointerDown={(e) => {
        e.stopPropagation()
        map?.dragging?.disable()
      }}
      onMouseDown={(e) => {
        e.stopPropagation()
        map?.dragging?.disable()
      }}
      onTouchStart={(e) => {
        e.stopPropagation()
        map?.dragging?.disable()
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {hasTypography && (
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="tual-secondary-pill-btn"
            title="Text Size & Style"
            onClick={() => toggle('typography')}
          >
            <span style={{ opacity: 0.7, fontWeight: 700, fontSize: 11, marginRight: 3, letterSpacing: -0.5 }}>TT</span>
            <span style={{ fontWeight: 500, margin: '0 4px' }}>{typographyLabel}</span>
            <span style={{ fontSize: 9, opacity: 0.6 }}>⌄</span>
          </button>
          {activePopover === 'typography' && (
            <TypographyDropdown
              currentSize={style.size}
              currentFontSize={style.fontSize}
              currentWeight={style.weight}
              currentFontStyle={style.fontStyle}
              currentUnderline={isUnderline}
              currentAlign={style.align}
              onUpdateStyle={(patch) => {
                updateStyle(patch)
              }}
              onClose={() => setActivePopover(null)}
            />
          )}
        </div>
      )}

      {isNote ? (
        <>
          <div style={{ position: 'relative' }}>
            <button type="button" className="tual-secondary-swatch-btn" title="Text Color" onClick={() => toggle('textColor')}>
              <div className="tual-secondary-swatch-box" style={{ backgroundColor: resolveColor(style.textColor ?? 'ink', scheme) }} />
            </button>
            {activePopover === 'textColor' && <ColorDropdown map={map} title="Text Color" mode="stroke" currentColor={style.textColor ?? 'ink'} scheme={scheme as 'light' | 'dark'} onSelectColor={(c) => updateStyle({ textColor: c })} onClose={() => setActivePopover(null)} />}
          </div>
          <div style={{ position: 'relative' }}>
            <button type="button" className="tual-secondary-swatch-btn" title="Background Color" onClick={() => toggle('bgColor')}>
              <div className="tual-secondary-swatch-box" style={{ backgroundColor: resolveNoteColors(style.color ?? 'yellow', scheme, style.textColor, style.fillColor).bg }} />
            </button>
            {activePopover === 'bgColor' && <ColorDropdown map={map} title="Background Color" mode="fill" currentColor={style.fillColor ?? style.color ?? 'yellow'} scheme={scheme as 'light' | 'dark'} onSelectColor={(c) => updateStyle({ fillColor: c, color: c })} onClose={() => setActivePopover(null)} />}
          </div>
        </>
      ) : (
        <div style={{ position: 'relative' }}>
          <button type="button" className="tual-secondary-swatch-btn" title="Color" onClick={() => toggle('color')}>
            {style.fill === 'none' ? <div className="tual-secondary-swatch-box tual-no-fill-swatch" /> : <div className="tual-secondary-swatch-box" style={{ backgroundColor: colorHex }} />}
          </button>
          {activePopover === 'color' && (
            <ColorDropdown
              map={map}
              title="Color" mode={isShape ? 'fill' : 'stroke'} currentColor={style.color} currentFill={style.fill} scheme={scheme as 'light' | 'dark'}
              onSelectColor={(c) => updateStyle(style.fill === 'none' ? { color: c, fill: 'solid' } : { color: c })}
              onSelectFillMode={(mode) => updateStyle({ fill: mode })} onClose={() => setActivePopover(null)}
            />
          )}
        </div>
      )}

      {isTextOrNote && (
        <>
          <button
            type="button"
            className="tual-secondary-icon-btn"
            title="Bold"
            aria-label="Bold"
            data-active={isBold}
            onClick={toggleBold}
          >
            {ICONS.bold()}
          </button>
          <button
            type="button"
            className="tual-secondary-icon-btn"
            title="Italic"
            aria-label="Italic"
            data-active={isItalic}
            onClick={toggleItalic}
          >
            {ICONS.italic()}
          </button>
          <button
            type="button"
            className="tual-secondary-icon-btn"
            title="Underline"
            aria-label="Underline"
            data-active={isUnderline}
            onClick={toggleUnderline}
          >
            {ICONS.underline()}
          </button>
          <div className="tual-secondary-separator" />
          <button
            type="button"
            className="tual-secondary-icon-btn"
            title="Bulleted List"
            aria-label="Bulleted List"
            data-active={isBulleted}
            onClick={toggleBullets}
          >
            {ICONS.bullets()}
          </button>
          <button
            type="button"
            className="tual-secondary-icon-btn"
            title="Text Alignment"
            aria-label="Text Alignment"
            onClick={() =>
              updateStyle({
                align:
                  style.align === 'center'
                    ? 'right'
                    : style.align === 'right'
                      ? 'left'
                      : 'center',
              })
            }
          >
            {style.align === 'center'
              ? ICONS.alignCenter()
              : style.align === 'right'
                ? ICONS.alignRight()
                : ICONS.alignLeft()}
          </button>
        </>
      )}

      {isNote && (
        <div style={{ position: 'relative' }}>
          <button type="button" className="tual-secondary-icon-btn" title="Corner Radius" data-active={activePopover === 'radius'} onClick={() => toggle('radius')}>
            {ICONS.radius()}
          </button>
          {activePopover === 'radius' && (
            <RadiusDropdown currentRadius={style.radius} onSelectRadius={(r) => updateStyle({ radius: r })} onClose={() => setActivePopover(null)} />
          )}
        </div>
      )}

      {/* Border button with unified border popover & nested color select */}
      {hasBorder && (
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="tual-secondary-icon-btn"
            title="Border & Stroke"
            data-active={activePopover === 'border'}
            onClick={() => toggle('border')}
          >
            {ICONS.strokeWidth()}
          </button>
          {activePopover === 'border' && (
            <BorderPopover
              currentDash={style.dash} currentColor={style.color} currentStrokeColor={style.strokeColor}
              currentWidth={isNote ? (style.width ?? 's') : style.width} currentRadius={style.radius} scheme={scheme as 'light' | 'dark'} isSquareShape={isSquareShape}
              onSelectDash={(d) => updateStyle({ dash: d })} onSelectStrokeColor={(c) => updateStyle({ strokeColor: c })}
              onSelectWidth={(w) => updateStyle({ width: w })} onSelectRadius={(r) => updateStyle({ radius: r })} onClose={() => setActivePopover(null)}
            />
          )}
        </div>
      )}

      {isShape && (
        <div style={{ position: 'relative' }}>
          <button type="button" className="tual-secondary-icon-btn" title="Label Position" data-active={activePopover === 'labelPosition'} onClick={() => toggle('labelPosition')}>
            {LABEL_POSITION_ICONS.center()}
          </button>
          {activePopover === 'labelPosition' && (
            <LabelPositionDropdown currentPosition={(selectedItem as ShapeItem).labelPosition} onSelectPosition={(p) => controller.update(selectedItem.id, { labelPosition: p })} onClose={() => setActivePopover(null)} />
          )}
        </div>
      )}

      <div className="tual-secondary-separator" />

      <div style={{ position: 'relative' }}>
        <button type="button" className="tual-secondary-icon-btn" title="More Options" data-active={activePopover === 'more'} onClick={() => toggle('more')}>
          {ICONS.moreVertical()}
        </button>
        {activePopover === 'more' && (
          <MoreOptionsDropdown
            onDuplicate={() => {
              const { id: _, createdAt: __, ...rest } = selectedItem as any
              controller.select(controller.add(rest).id)
              setActivePopover(null)
            }}
            onDelete={() => { controller.remove(selectedItem.id); setActivePopover(null) }}
            onClose={() => setActivePopover(null)}
          />
        )}
      </div>
    </div>
  )
}
