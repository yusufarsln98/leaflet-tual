'use client'

import { useCallback, useRef, useState } from 'react'
import type { ArrowKind, DrawKind, ShapeKind, ToolId } from '../../../core/index.js'
import { useControllerState } from '../../features/index.js'
import { TranslationProvider } from '../../features/i18n/index.js'
import type { ToolbarProps } from '../../types/index.js'
import { Divider, useOutsideDismiss } from '../../ui/index.js'
import { PageSwitcher, ToolbarDrawGroup, ToolbarItemButton } from './controls/index.js'
import { ALL_ARROW_KINDS, ALL_SHAPE_KINDS } from './popovers/index.js'

const ALL_TOOLS: ToolId[] = ['select', 'text', 'note', 'freedraw', 'pen', 'arrow', 'shape', 'ruler']

const DRAW_TOOLS: DrawKind[] = ['freedraw', 'pen']

export function Toolbar({
  controller,
  position = 'top-left',
  orientation = 'horizontal',
  tools = ALL_TOOLS,
  pages = true,
}: ToolbarProps) {
  useControllerState(controller)

  const [activePopover, setActivePopover] = useState<'pages' | 'draw' | ToolId | null>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const lastDrawToolRef = useRef<DrawKind>('freedraw')
  const lastArrowVariantRef = useRef<ArrowKind | null>(
    controller.tool === 'arrow' && controller.variant && ALL_ARROW_KINDS.includes(controller.variant as ArrowKind)
      ? (controller.variant as ArrowKind)
      : null,
  )
  const lastShapeVariantRef = useRef<ShapeKind | null>(
    controller.tool === 'shape' && controller.variant && ALL_SHAPE_KINDS.includes(controller.variant as ShapeKind)
      ? (controller.variant as ShapeKind)
      : null,
  )

  if (controller.tool === 'freedraw' || controller.tool === 'pen') {
    lastDrawToolRef.current = controller.tool
  }
  if (
    controller.tool === 'arrow' &&
    controller.variant &&
    ALL_ARROW_KINDS.includes(controller.variant as ArrowKind)
  ) {
    lastArrowVariantRef.current = controller.variant as ArrowKind
  }
  if (
    controller.tool === 'shape' &&
    controller.variant &&
    ALL_SHAPE_KINDS.includes(controller.variant as ShapeKind)
  ) {
    lastShapeVariantRef.current = controller.variant as ShapeKind
  }

  const availableDrawTools = DRAW_TOOLS.filter((t) => tools.includes(t))

  const closePopover = useCallback(() => setActivePopover(null), [])
  useOutsideDismiss(toolbarRef, activePopover !== null, closePopover)

  return (
    <TranslationProvider translations={controller.translations}>
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

          const itemActiveVariant =
            toolId === 'arrow'
              ? (controller.tool === 'arrow' && controller.variant && ALL_ARROW_KINDS.includes(controller.variant as ArrowKind)
                  ? controller.variant
                  : lastArrowVariantRef.current)
              : toolId === 'shape'
                ? (controller.tool === 'shape' && controller.variant && ALL_SHAPE_KINDS.includes(controller.variant as ShapeKind)
                    ? controller.variant
                    : lastShapeVariantRef.current)
                : null

          return (
            <ToolbarItemButton
              key={toolId}
              toolId={toolId}
              controller={controller}
              activeVariant={itemActiveVariant}
              isPopoverOpen={activePopover === toolId}
              onTogglePopover={(open) => setActivePopover(open ? toolId : null)}
              onClosePopover={closePopover}
            />
          )
        })}
      </div>
    </TranslationProvider>
  )
}
