'use client'

import { ChevronDown } from 'lucide-react'
import type { ToolbarOptions } from 'leaflet-tual/react'
import { FREE_TILE_LAYERS } from '../../../data/tiles'
import { SHOWCASE_PRESETS, type ShowcasePreset } from '../../../data/presets'

export type WorkbenchToolbarPosition = NonNullable<ToolbarOptions['position']>

interface WorkbenchConfigurationSelectsProps {
  tileLayerId: string
  onTileLayerChange: (id: string) => void
  activePreset: ShowcasePreset
  onSelectPreset: (id: string) => void
  canvasTheme: 'default' | 'homepage'
  onCanvasThemeChange: (theme: 'default' | 'homepage') => void
  toolbarPosition: WorkbenchToolbarPosition
  onToolbarPositionChange: (pos: WorkbenchToolbarPosition) => void
}

export function WorkbenchConfigurationSelects({
  tileLayerId,
  onTileLayerChange,
  activePreset,
  onSelectPreset,
  canvasTheme,
  onCanvasThemeChange,
  toolbarPosition,
  onToolbarPositionChange,
}: WorkbenchConfigurationSelectsProps) {
  return (
    <>
      {/* Basemap Select Box */}
      <div>
        <label
          htmlFor="workbench-tile-select"
          className="block text-[11px] font-mono font-bold uppercase tracking-wider text-accent mb-1.5"
        >
          Basemap Layer (Free Maps)
        </label>
        <div className="relative">
          <select
            id="workbench-tile-select"
            value={tileLayerId}
            onChange={(e) => onTileLayerChange(e.target.value)}
            className="w-full pl-3 pr-8 py-2 rounded-lg bg-bg-pane border border-border-primary text-text-primary text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer transition-colors shadow-2xs appearance-none"
          >
            {FREE_TILE_LAYERS.map((t) => (
              <option key={t.id} value={t.id} className="bg-bg-pane text-text-primary">
                {t.name} ({t.category})
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        </div>
      </div>

      {/* Scenario Preset Select Box */}
      <div>
        <label
          htmlFor="workbench-scenario-select"
          className="block text-[11px] font-mono font-bold uppercase tracking-wider text-text-secondary mb-1.5"
        >
          Scenario Preset
        </label>
        <div className="relative">
          <select
            id="workbench-scenario-select"
            value={activePreset.id}
            onChange={(e) => onSelectPreset(e.target.value)}
            className="w-full pl-3 pr-8 py-2 rounded-lg bg-bg-pane border border-border-primary text-text-primary text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer transition-colors shadow-2xs appearance-none"
          >
            {SHOWCASE_PRESETS.map((p) => (
              <option key={p.id} value={p.id} className="bg-bg-pane text-text-primary">
                {p.name} ({p.region})
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        </div>
      </div>

      {/* Canvas Theme Selector */}
      <div>
        <label
          htmlFor="workbench-theme-select"
          className="block text-[11px] font-mono font-bold uppercase tracking-wider text-text-secondary mb-1.5"
        >
          Canvas Theme
        </label>
        <div className="relative">
          <select
            id="workbench-theme-select"
            value={canvasTheme}
            onChange={(e) => onCanvasThemeChange(e.target.value as 'default' | 'homepage')}
            className="w-full pl-3 pr-8 py-2 rounded-lg bg-bg-pane border border-border-primary text-text-primary text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer transition-colors shadow-2xs appearance-none"
          >
            <option value="default">Default Theme</option>
            <option value="homepage">Custom Brand Theme</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        </div>
      </div>

      {/* Toolbar Position Select Box */}
      <div>
        <label
          htmlFor="workbench-toolbar-select"
          className="block text-[11px] font-mono font-bold uppercase tracking-wider text-text-secondary mb-1.5"
        >
          Toolbar Position
        </label>
        <div className="relative">
          <select
            id="workbench-toolbar-select"
            value={toolbarPosition}
            onChange={(e) => onToolbarPositionChange(e.target.value as WorkbenchToolbarPosition)}
            className="w-full pl-3 pr-8 py-2 rounded-lg bg-bg-pane border border-border-primary text-text-primary text-xs font-mono focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer transition-colors shadow-2xs appearance-none"
          >
            <option value="top-left">Top Left</option>
            <option value="top">Top Center</option>
            <option value="top-right">Top Right</option>
            <option value="bottom-left">Bottom Left</option>
            <option value="bottom">Bottom Center</option>
            <option value="bottom-right">Bottom Right</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        </div>
      </div>
    </>
  )
}
