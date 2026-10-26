'use client'

import { useEffect, useRef, useState } from 'react'
import type { DrawKind, ToolId } from '../../../core/index.js'
import type { ToolbarProps } from '../../types/index.js'
import { ICONS } from './icons/index.js'
import {
  PageSwitcher,
  ToolbarHistoryControls,
  ToolbarDrawGroup,
  ToolbarItemButton,
  ToolbarZoomControl,
} from './controls/index.js'

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

  const availableDrawTools = DRAW_TOOLS.filter((t) => tools.includes(t) && (!variants?.draw || variants.draw.includes(t)))
  const effZoom = currentZoom ?? map?.getZoom()
  const zoomPercent = effZoom !== undefined ? Math.round(Math.pow(2, effZoom - 13) * 100) : null

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
          if (toolId !== availableDrawTools[0]) return null
          return (
            <ToolbarDrawGroup
              key="draw"
              controller={controller}
              availableDrawTools={availableDrawTools}
              activePopover={activePopover}
              lastDrawTool={lastDrawToolRef.current}
              popoverClassName={classNames?.popover}
              onTogglePopover={(open) => setActivePopover(open ? 'draw' : null)}
              onClosePopover={closePopover}
            />
          )
        }

        return (
          <ToolbarItemButton
            key={toolId}
            toolId={toolId}
            controller={controller}
            isPopoverOpen={activePopover === toolId}
            popoverClassName={classNames?.popover}
            allowedArrowVariants={variants?.arrow}
            allowedShapeVariants={variants?.shape}
            onTogglePopover={(open) => setActivePopover(open ? toolId : null)}
            onClosePopover={closePopover}
          />
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
      {zoom !== false && <ToolbarZoomControl map={map} zoomPercent={zoomPercent} />}

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
