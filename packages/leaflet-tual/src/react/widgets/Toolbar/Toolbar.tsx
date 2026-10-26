'use client'

import { useEffect, useRef, useState } from 'react'
import type { DrawKind, ToolId } from '../../../core/index.js'
import type { ToolbarProps } from '../../types/index.js'
import { useTranslation } from '../../features/i18n/index.js'
import { Button, Divider, IconButton, ICONS } from '../../ui/index.js'
import {
  PageSwitcher,
  ToolbarHistoryControls,
  ToolbarDrawGroup,
  ToolbarItemButton,
  ToolbarZoomControl,
} from './controls/index.js'

const ALL_TOOLS: ToolId[] = ['select', 'text', 'note', 'freedraw', 'pen', 'arrow', 'shape', 'ruler']

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
}: ToolbarProps) {
  const { t } = useTranslation(controller)
  const [, setTick] = useState(0)

  useEffect(() => {
    return controller.on('state', () => {
      setTick((n) => n + 1)
    })
  }, [controller])

  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const isCollapsed = collapsed !== undefined ? collapsed : internalCollapsed
  const [activePopover, setActivePopover] = useState<'pages' | 'draw' | ToolId | null>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const lastDrawToolRef = useRef<DrawKind>('freedraw')

  if (controller.tool === 'freedraw' || controller.tool === 'pen') {
    lastDrawToolRef.current = controller.tool
  }

  const availableDrawTools = DRAW_TOOLS.filter(
    (t) => tools.includes(t) && (!variants?.draw || variants.draw.includes(t)),
  )
  const effZoom = currentZoom ?? map?.getZoom()
  const zoomPercent = effZoom !== undefined ? Math.round(Math.pow(2, effZoom - 13) * 100) : null

  const toggleCollapsed = () => {
    const next = !isCollapsed
    setInternalCollapsed(next)
    onCollapsedChange?.(next)
  }

  const isVertical = orientation === 'vertical'
  const isRightAnchored = position.includes('right')
  const isBottomAnchored = position.startsWith('bottom')

  const collapseIcon = isVertical
    ? isBottomAnchored
      ? ICONS.chevronsDown()
      : ICONS.chevronsUp()
    : isRightAnchored
      ? ICONS.chevronsRight()
      : ICONS.chevronsLeft()

  const expandIcon = isVertical
    ? isBottomAnchored
      ? ICONS.chevronsUp()
      : ICONS.chevronsDown()
    : isRightAnchored
      ? ICONS.chevronsLeft()
      : ICONS.chevronsRight()

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
        className="tual-toolbar"
      >
        <IconButton
          icon={expandIcon}
          label={t('expandToolbar')}
          onClick={toggleCollapsed}
        />
      </div>
    )
  }

  return (
    <div
      ref={toolbarRef}
      data-position={position}
      data-orientation={orientation}
      className="tual-toolbar"
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
          />
          <Divider variant="toolbar" />
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
          <Divider variant="toolbar" />
          <ToolbarHistoryControls controller={controller} />
        </>
      )}

      {/* 4. Zoom percentage pill */}
      {zoom !== false && <ToolbarZoomControl map={map} zoomPercent={zoomPercent} />}

      {/* 5. Custom Toolbar Actions */}
      {actions && actions.length > 0 && (
        <>
          <Divider variant="toolbar" />
          {actions.map((act) => (
            <Button
              key={act.id}
              active={act.active}
              disabled={act.disabled}
              title={act.title ?? act.label}
              onClick={() => {
                act.onClick?.()
                act.run?.(controller)
              }}
            >
              {typeof act.icon === 'function' ? act.icon() : (act.icon ?? act.label)}
            </Button>
          ))}
        </>
      )}

      {/* 6. Collapse button */}
      {collapsible && (
        <>
          <Divider variant="toolbar" />
          <IconButton
            icon={collapseIcon}
            label={t('collapseToolbar')}
            onClick={toggleCollapsed}
          />
        </>
      )}
    </div>
  )
}
