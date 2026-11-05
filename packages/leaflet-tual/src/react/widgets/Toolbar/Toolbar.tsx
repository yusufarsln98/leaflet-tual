'use client'

import { memo, useCallback, useRef, useState } from 'react'
import type { DrawKind, MeasureKind, ToolId } from '../../../core/index.js'
import { themeTokensToCssVariables } from '../../../shared/theme/index.js'
import { useControllerState } from '../../features/index.js'
import { TranslationProvider } from '../../features/i18n/index.js'
import type { ToolbarProps } from '../../types/index.js'
import { useLeafletDomGuard, useOutsideDismiss } from '../../ui/index.js'
import {
  PageSwitcher,
  ToolbarDrawGroup,
  ToolbarHistoryControls,
  ToolbarItemButton,
  ToolbarMeasureGroup,
} from './controls/index.js'
import { resolveToolbarPosition } from './position.js'

const ALL_TOOLS: ToolId[] = [
  'select',
  'text',
  'note',
  'freedraw',
  'pen',
  'arrow',
  'shape',
  'ruler',
  'area',
  'laser',
]

const DRAW_TOOLS: DrawKind[] = ['freedraw', 'pen']
const MEASURE_TOOLS: MeasureKind[] = ['ruler', 'area']

export const Toolbar = memo(function Toolbar({
  controller,
  map,
  position = 'top-left',
  orientation,
  tools = ALL_TOOLS,
  pages = true,
  history = true,
  themeTokens,
}: ToolbarProps) {
  useControllerState(controller)

  const resolvedPosition = resolveToolbarPosition(position, orientation)
  const [activePopover, setActivePopover] = useState<'pages' | 'draw' | 'measure' | ToolId | null>(
    null,
  )
  const toolbarRef = useRef<HTMLDivElement>(null)
  const lastDrawToolRef = useRef<DrawKind>('freedraw')
  const lastMeasureToolRef = useRef<MeasureKind>('ruler')

  if (controller.tool === 'freedraw' || controller.tool === 'pen') {
    lastDrawToolRef.current = controller.tool
  }
  if (controller.tool === 'ruler' || controller.tool === 'area') {
    lastMeasureToolRef.current = controller.tool
  }

  const availableDrawTools = DRAW_TOOLS.filter((t) => tools.includes(t))
  const availableMeasureTools = MEASURE_TOOLS.filter((t) => tools.includes(t))

  const closePopover = useCallback(() => setActivePopover(null), [])
  useOutsideDismiss(toolbarRef, activePopover !== null, closePopover)
  useLeafletDomGuard(toolbarRef)

  const tokenStyles = themeTokens ? themeTokensToCssVariables(themeTokens) : undefined

  return (
    <TranslationProvider translations={controller.translations}>
      <div
        ref={toolbarRef}
        data-position={position}
        data-edge={resolvedPosition.edge}
        data-align={resolvedPosition.align}
        data-orientation={resolvedPosition.orientation}
        className="tual-toolbar"
        style={tokenStyles}
        onClick={(e) => {
          e.stopPropagation()
          if (e.target === e.currentTarget) closePopover()
        }}
      >
        {tools.length > 0 && (
          <div className="tual-tool-group" data-group="tools">
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

              if (toolId === 'ruler' || toolId === 'area') {
                if (toolId !== availableMeasureTools[0]) return null
                return (
                  <ToolbarMeasureGroup
                    key="measure"
                    controller={controller}
                    availableMeasureTools={availableMeasureTools}
                    activePopover={activePopover}
                    lastMeasureTool={lastMeasureToolRef.current}
                    onTogglePopover={(open) => setActivePopover(open ? 'measure' : null)}
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
                  onTogglePopover={(open) => setActivePopover(open ? toolId : null)}
                  onClosePopover={closePopover}
                />
              )
            })}
          </div>
        )}

        {history && (
          <div className="tual-tool-group" data-group="history">
            <ToolbarHistoryControls controller={controller} map={map} />
          </div>
        )}

        {pages && (
          <div className="tual-tool-group" data-group="pages">
            <PageSwitcher
              controller={controller}
              isOpen={activePopover === 'pages'}
              onToggle={() => setActivePopover((p) => (p === 'pages' ? null : 'pages'))}
              onClose={closePopover}
            />
          </div>
        )}
      </div>
    </TranslationProvider>
  )
})
