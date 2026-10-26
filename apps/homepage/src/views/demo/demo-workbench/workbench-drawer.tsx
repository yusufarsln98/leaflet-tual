'use client'

import type { RefObject } from 'react'
import type { Controller } from 'leaflet-tual/react'
import { PanelLeftClose, SlidersHorizontal } from 'lucide-react'
import type { ShowcasePreset } from '../../../data/presets'
import {
  WorkbenchConfigurationSelects,
  type WorkbenchToolbarPosition,
} from './workbench-configuration-selects'
import { WorkbenchQuickActions } from './workbench-quick-actions'
import { WorkbenchFeatureToggles } from './workbench-feature-toggles'
import { WorkbenchAnnotationsList } from './workbench-annotations-list'
import { WorkbenchLiveJson } from './workbench-live-json'

interface WorkbenchDrawerProps {
  drawerRef: RefObject<HTMLElement | null>
  isDrawerOpen: boolean
  onClose: () => void
  tileLayerId: string
  onTileLayerChange: (id: string) => void
  activePreset: ShowcasePreset
  onSelectPreset: (id: string) => void
  controller: Controller
  onResetScenario: () => void
  toolbarPosition: WorkbenchToolbarPosition
  onToolbarPositionChange: (pos: WorkbenchToolbarPosition) => void
  readOnly: boolean
  onToggleReadOnly: (val: boolean) => void
  copied: boolean
  onCopyJson: () => void
}

export function WorkbenchDrawer({
  drawerRef,
  isDrawerOpen,
  onClose,
  tileLayerId,
  onTileLayerChange,
  activePreset,
  onSelectPreset,
  controller,
  onResetScenario,
  toolbarPosition,
  onToolbarPositionChange,
  readOnly,
  onToggleReadOnly,
  copied,
  onCopyJson,
}: WorkbenchDrawerProps) {
  const selected = controller.selected[0]

  return (
    <aside
      ref={drawerRef}
      className={`absolute top-0 bottom-0 left-0 z-[1050] w-full max-w-[340px] sm:w-[340px] bg-bg-sidebar/95 backdrop-blur-md border-r border-border-primary shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
        isDrawerOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
      }`}
      aria-label="Workbench controls drawer"
    >
      {/* Drawer Header with Title and Close Button */}
      <div className="px-4 py-3 border-b border-border-primary flex items-center justify-between shrink-0 bg-bg-sidebar select-none">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-accent" />
          <span className="font-mono font-bold text-xs uppercase tracking-wider text-text-primary">
            Workbench Controls
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-pane border border-border-primary/50 hover:border-border-primary transition-all cursor-pointer text-xs font-mono"
          title="Close Drawer"
          aria-label="Close Drawer"
        >
          <PanelLeftClose className="w-3.5 h-3.5" />
          <span>Close</span>
        </button>
      </div>

      {/* Scrollable Drawer Content */}
      <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-3.5 scrollbar-thin">
        {/* Basemap, Scenario, Toolbar Selects */}
        <WorkbenchConfigurationSelects
          tileLayerId={tileLayerId}
          onTileLayerChange={onTileLayerChange}
          activePreset={activePreset}
          onSelectPreset={onSelectPreset}
          toolbarPosition={toolbarPosition}
          onToolbarPositionChange={onToolbarPositionChange}
        />

        {/* Quick Actions (Undo, Redo, Reset) */}
        <WorkbenchQuickActions
          controller={controller}
          readOnly={readOnly}
          onResetScenario={onResetScenario}
        />

        {/* Feature Checkbox Toggles */}
        <WorkbenchFeatureToggles
          readOnly={readOnly}
          onToggleReadOnly={onToggleReadOnly}
        />

        {/* Selected Item Details */}
        {selected && (
          <div className="p-2.5 rounded-lg bg-bg-pane border border-accent/40 text-[11px] font-mono flex flex-col gap-1 shadow-2xs">
            <div className="flex items-center justify-between text-accent font-bold">
              <span>
                {selected.type.toUpperCase()}: {selected.id}
              </span>
            </div>
            {'label' in selected && selected.label && (
              <div className="text-text-secondary truncate">
                Label: &quot;{selected.label}&quot;
              </div>
            )}
            {'from' in selected && selected.from && (
              <div className="text-text-muted text-[10px]">
                Pos: {selected.from.lat.toFixed(4)}, {selected.from.lng.toFixed(4)}
              </div>
            )}
          </div>
        )}

        {/* Annotations List */}
        <WorkbenchAnnotationsList controller={controller} readOnly={readOnly} />

        {/* Live JSON State in Sidebar */}
        <WorkbenchLiveJson
          controller={controller}
          copied={copied}
          onCopyJson={onCopyJson}
        />
      </div>
    </aside>
  )
}
