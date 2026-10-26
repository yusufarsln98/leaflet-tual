'use client'

import { useEffect, useRef, useState } from 'react'
import type { DrawKind, ToolId } from '../../../core/index.js'
import type { ToolbarProps } from '../../types/index.js'
import { Button, Divider } from '../../ui/index.js'
import {
  PageSwitcher,
  ToolbarHistoryControls,
  ToolbarDrawGroup,
  ToolbarItemButton,
} from './controls/index.js'

const ALL_TOOLS: ToolId[] = ['select', 'text', 'note', 'freedraw', 'pen', 'arrow', 'shape', 'ruler']

const DRAW_TOOLS: DrawKind[] = ['freedraw', 'pen']

export function Toolbar({
  controller,
  position = 'top-left',
  orientation = 'horizontal',
  tools = ALL_TOOLS,
  variants,
  pages = true,
  history = true,
  actions,
}: ToolbarProps) {
  const [, setTick] = useState(0)

  useEffect(() => {
    return controller.on('state', () => {
      setTick((n) => n + 1)
    })
  }, [controller])

  const [activePopover, setActivePopover] = useState<'pages' | 'draw' | ToolId | null>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const lastDrawToolRef = useRef<DrawKind>('freedraw')

  if (controller.tool === 'freedraw' || controller.tool === 'pen') {
    lastDrawToolRef.current = controller.tool
  }

  const availableDrawTools = DRAW_TOOLS.filter(
    (t) => tools.includes(t) && (!variants?.draw || variants.draw.includes(t)),
  )

  const closePopover = () => setActivePopover(null)

  useEffect(() => {
    const onDocClick = (e: MouseEvent | PointerEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        closePopover()
      }
    }
    window.addEventListener('pointerdown', onDocClick, true)
    window.addEventListener('mousedown', onDocClick, true)
    return () => {
      window.removeEventListener('pointerdown', onDocClick, true)
      window.removeEventListener('mousedown', onDocClick, true)
    }
  }, [])

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

      {/* 4. Custom Toolbar Actions */}
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
    </div>
  )
}
