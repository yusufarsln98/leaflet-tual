'use client'

import { useEffect, useRef, useState } from 'react'
import type { ArrowKind, DrawKind, ShapeKind, ToolId } from '../../../core/index.js'
import type { ToolbarProps } from '../../types/index.js'
import { ARROW_ICONS, DRAW_ICONS, ICONS, SHAPE_ICONS } from './icons.js'
import { PageSwitcher } from './PageSwitcher.js'
import { ToolVariantsPopover } from './ToolVariantsPopover.js'
import { ToolbarHistoryControls } from './ToolbarHistoryControls.js'
import { ToolbarToolButton } from './ToolbarToolButton.js'

const ALL_TOOLS: ToolId[] = [
  'select',
  'text',
  'note',
  'freedraw',
  'pen',
  'arrow',
  'shape',
  'ruler',
]

const DRAW_TOOLS: DrawKind[] = ['freedraw', 'pen']

export function Toolbar({
  controller,
  map,
  currentZoom,
  zoom = true,
  position = 'top-left',
  orientation = 'horizontal',
  tools = ALL_TOOLS,
  variants,
  pages = true,
  history = true,
  collapsible = false,
  collapsed,
  onCollapsedChange,
  actions,
  className,
  style,
  classNames,
}: ToolbarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const isCollapsed = collapsed !== undefined ? collapsed : internalCollapsed
  const [activePopover, setActivePopover] = useState<'pages' | 'draw' | ToolId | null>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const lastDrawToolRef = useRef<DrawKind>('freedraw')

  if (controller.tool === 'freedraw' || controller.tool === 'pen') {
    lastDrawToolRef.current = controller.tool
  }

  const availableDrawTools = DRAW_TOOLS.filter(
    (tool) => tools.includes(tool) && (!variants?.draw || variants.draw.includes(tool)),
  )

  const effectiveZoom = currentZoom !== undefined ? currentZoom : (map ? map.getZoom() : undefined)
  const zoomPercent =
    effectiveZoom !== undefined
      ? Math.round(Math.pow(2, effectiveZoom - 13) * 100)
      : null

  const toggleCollapsed = () => {
    const next = !isCollapsed
    setInternalCollapsed(next)
    onCollapsedChange?.(next)
  }

  const closePopover = () => setActivePopover(null)

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        closePopover()
      }
    }
    window.addEventListener('mousedown', onDocClick)
    return () => window.removeEventListener('mousedown', onDocClick)
  }, [])

  if (isCollapsed) {
    return (
      <div
        ref={toolbarRef}
        data-position={position}
        data-orientation={orientation}
        className={`tual-toolbar ${className ?? ''} ${classNames?.toolbar ?? ''}`}
        style={style}
      >
        <button
          type="button"
          className="tual-btn"
          title="Expand toolbar"
          onClick={toggleCollapsed}
        >
          {ICONS.more()}
        </button>
      </div>
    )
  }

  return (
    <div
      ref={toolbarRef}
      data-position={position}
      data-orientation={orientation}
      className={`tual-toolbar ${className ?? ''} ${classNames?.toolbar ?? ''}`}
      style={style}
      onClick={(e) => {
        if (e.target === e.currentTarget) closePopover()
      }}
    >
      {/* 1. Page Switcher Dropdown */}
      {pages && (
        <>
          <PageSwitcher
            controller={controller}
            isOpen={activePopover === 'pages'}
            onToggle={() => setActivePopover((p) => (p === 'pages' ? null : 'pages'))}
            onClose={closePopover}
            className={classNames?.popover}
          />
          <div className="tual-separator" />
        </>
      )}

      {/* 2. Tools list */}
      {tools.map((toolId) => {
        if (toolId === 'freedraw' || toolId === 'pen') {
          // Both drawing tools share one Draw group. Render it once, at the
          // position of the first drawing tool in the configured list.
          if (toolId !== availableDrawTools[0]) return null

          const activeDrawTool =
            controller.tool === 'freedraw' || controller.tool === 'pen'
              ? controller.tool
              : null
          const isActive = activeDrawTool !== null
          const hasVariants = availableDrawTools.length > 1
          const isPopoverOpen = activePopover === 'draw'
          const fallbackTool = availableDrawTools.includes(lastDrawToolRef.current)
            ? lastDrawToolRef.current
            : availableDrawTools[0]
          const previewTool = activeDrawTool ?? fallbackTool
          const label = `Draw (${previewTool === 'pen' ? 'P' : 'F'})`

          return (
            <div key="draw" style={{ position: 'relative' }}>
              <ToolbarToolButton
                label={label}
                icon={DRAW_ICONS[previewTool]()}
                isActive={isActive}
                hasVariants={hasVariants}
                onSelect={() => {
                  if (hasVariants) {
                    const nextOpen = activePopover !== 'draw'
                    if (!isActive) controller.setTool(fallbackTool)
                    setActivePopover(nextOpen ? 'draw' : null)
                  } else {
                    controller.setTool(fallbackTool)
                    closePopover()
                  }
                }}
              />

              {hasVariants && isPopoverOpen && (
                <ToolVariantsPopover
                  controller={controller}
                  type="draw"
                  allowedDrawVariants={availableDrawTools}
                  onClose={closePopover}
                  className={classNames?.popover}
                />
              )}
            </div>
          )
        }

        const isActive = controller.tool === toolId
        const hasVariants = toolId === 'arrow' || toolId === 'shape'
        const isPopoverOpen = activePopover === toolId
        const icon =
          toolId === 'arrow' && controller.variant
            ? (ARROW_ICONS[controller.variant as ArrowKind]?.() ?? ICONS.arrow())
            : toolId === 'shape' && controller.variant
              ? (SHAPE_ICONS[controller.variant as ShapeKind]?.() ?? ICONS.shape())
              : ICONS[toolId]()
        const label = `${toolId.charAt(0).toUpperCase() + toolId.slice(1)} (${toolId.charAt(0).toUpperCase()})`

        return (
          <div key={toolId} style={{ position: 'relative' }}>
            <ToolbarToolButton
              label={label}
              icon={icon}
              isActive={isActive}
              hasVariants={hasVariants}
              onSelect={() => {
                if (hasVariants) {
                  const nextOpen = activePopover !== toolId
                  if (!isActive) controller.setTool(toolId)
                  setActivePopover(nextOpen ? toolId : null)
                } else {
                  controller.setTool(toolId)
                  closePopover()
                }
              }}
            />

            {/* Tool variants popover */}
            {hasVariants && isPopoverOpen && (
              <ToolVariantsPopover
                controller={controller}
                type={toolId as 'arrow' | 'shape'}
                allowedArrowVariants={variants?.arrow}
                allowedShapeVariants={variants?.shape}
                onClose={closePopover}
                className={classNames?.popover}
              />
            )}
          </div>
        )
      })}

      {/* 3. History Undo / Redo */}
      {history && (
        <>
          <div className="tual-separator" />
          <ToolbarHistoryControls controller={controller} />
        </>
      )}

      {/* 4. Zoom percentage pill */}
      {zoom !== false && zoomPercent !== null && (
        <>
          <div className="tual-separator" />
          <button
            type="button"
            className="tual-btn tual-zoom-pill"
            title="Zoom level (click to reset to 100%)"
            style={{
              padding: '0 8px',
              fontSize: 12,
              fontWeight: 500,
              minWidth: 46,
              fontVariantNumeric: 'tabular-nums',
            }}
            onClick={() => {
              if (map) {
                map.setZoom(13)
              }
            }}
          >
            {zoomPercent}%
          </button>
        </>
      )}

      {/* 5. Custom Toolbar Actions */}
      {actions && actions.length > 0 && (
        <>
          <div className="tual-separator" />
          {actions.map((act) => (
            <button
              key={act.id}
              type="button"
              className="tual-btn"
              title={act.title ?? act.label}
              onClick={() => {
                act.onClick?.()
                act.run?.(controller)
              }}
            >
              {typeof act.icon === 'function' ? act.icon() : (act.icon ?? act.label)}
            </button>
          ))}
        </>
      )}

      {/* 6. Collapse button */}
      {collapsible && (
        <>
          <div className="tual-separator" />
          <button type="button" className="tual-btn" title="Collapse toolbar" onClick={toggleCollapsed}>
            {ICONS.more()}
          </button>
        </>
      )}
    </div>
  )
}
