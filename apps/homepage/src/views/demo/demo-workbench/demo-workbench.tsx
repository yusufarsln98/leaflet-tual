'use client'

import { useEffect, useRef, useState } from 'react'
import { PanelLeftOpen } from 'lucide-react'
import { useLeafletTual } from 'leaflet-tual/react'
import { useTheme } from '../../../components/theme-provider'
import { SHOWCASE_PRESETS, type ShowcasePreset } from '../../../data/presets'
import { FREE_TILE_LAYERS, type FreeTileLayer } from '../../../data/tiles'
import type { DemoWorkbenchProps } from './types'
import { WorkbenchMockHeader } from './workbench-mock-header'
import { WorkbenchDrawer } from './workbench-drawer'
import { WorkbenchMapView } from './workbench-map-view'
import type { WorkbenchToolbarPosition } from './workbench-configuration-selects'

export function DemoWorkbench({ mode = 'embedded', initialDrawerOpen }: DemoWorkbenchProps) {
  const { theme: siteTheme } = useTheme()
  const [activePreset, setActivePreset] = useState<ShowcasePreset>(SHOWCASE_PRESETS[0])
  const [customTileId, setCustomTileId] = useState<string | null>(null)
  const [toolbarPosition, setToolbarPosition] = useState<WorkbenchToolbarPosition>('top')
  const [readOnly, setReadOnly] = useState<boolean>(false)
  const [collapsible, setCollapsible] = useState<boolean>(true)
  const [copied, setCopied] = useState<boolean>(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(
    initialDrawerOpen !== undefined ? initialDrawerOpen : mode === 'fullscreen',
  )
  const drawerRef = useRef<HTMLElement>(null)

  // By default, match dark/light tile layer according to theme (not OSM default)
  const defaultTileId = siteTheme === 'dark' ? 'esri-dark' : 'esri-light'
  const activeTileId = customTileId ?? defaultTileId

  // Prevent scroll & mouse event propagation from drawer to Leaflet map
  useEffect(() => {
    const el = drawerRef.current
    if (!el) return
    const stop = (e: Event) => e.stopPropagation()
    el.addEventListener('wheel', stop, { passive: false })
    el.addEventListener('mousedown', stop)
    el.addEventListener('dblclick', stop)
    el.addEventListener('touchstart', stop)
    el.addEventListener('pointerdown', stop)
    return () => {
      el.removeEventListener('wheel', stop)
      el.removeEventListener('mousedown', stop)
      el.removeEventListener('dblclick', stop)
      el.removeEventListener('touchstart', stop)
      el.removeEventListener('pointerdown', stop)
    }
  }, [])

  const activeTile: FreeTileLayer =
    FREE_TILE_LAYERS.find((t) => t.id === activeTileId) ?? FREE_TILE_LAYERS[0]

  const controller = useLeafletTual({
    defaultValue: {
      version: 2,
      page: 'p1',
      pages: [
        {
          id: 'p1',
          name: 'Page 1',
          items: activePreset.items,
        },
      ],
    },
    readOnly,
  })

  const handleToggleReadOnly = (next: boolean) => {
    setReadOnly(next)
    controller.setReadOnly(next)
  }

  const handleSelectPreset = (presetId: string) => {
    const preset = SHOWCASE_PRESETS.find((p) => p.id === presetId)
    if (!preset) return
    setActivePreset(preset)
    controller.clear()
    preset.items.forEach((item) => controller.add(item))
  }

  const handleResetScenario = () => {
    controller.clear()
    activePreset.items.forEach((item) => controller.add(item))
  }

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(controller.doc, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isFullscreen = mode === 'fullscreen'

  return (
    <div
      className={`flex flex-col bg-bg-pane border-border-primary ${
        isFullscreen ? 'flex-1 w-full min-h-0' : 'rounded-2xl border shadow-float overflow-hidden'
      }`}
    >
      {/* 1. Browser Mock Window Header */}
      {!isFullscreen && <WorkbenchMockHeader />}

      {/* Workbench Workspace: Map Viewport + Overlay Drawer */}
      <div
        className={`relative w-full overflow-hidden ${
          isFullscreen ? 'flex-1 min-h-0' : 'h-[640px]'
        }`}
      >
        {/* Toggle Drawer Trigger Button (visible when drawer closed) */}
        {!isDrawerOpen && (
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="absolute top-3.5 left-3.5 z-[1000] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-sidebar/95 backdrop-blur-md border border-border-primary shadow-float text-text-primary hover:text-accent hover:border-accent text-xs font-mono font-semibold transition-all cursor-pointer"
            title="Open Controls Drawer"
            aria-label="Open Controls Drawer"
          >
            <PanelLeftOpen className="w-4 h-4 text-accent" />
            <span>Workbench Controls</span>
          </button>
        )}

        {/* Collapsible Left Drawer with Presets, Settings, Annotations & Live JSON */}
        <WorkbenchDrawer
          drawerRef={drawerRef}
          isDrawerOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          tileLayerId={activeTileId}
          onTileLayerChange={setCustomTileId}
          activePreset={activePreset}
          onSelectPreset={handleSelectPreset}
          controller={controller}
          onResetScenario={handleResetScenario}
          toolbarPosition={toolbarPosition}
          onToolbarPositionChange={setToolbarPosition}
          readOnly={readOnly}
          onToggleReadOnly={handleToggleReadOnly}
          collapsible={collapsible}
          onCollapsibleChange={setCollapsible}
          copied={copied}
          onCopyJson={handleCopyJson}
        />

        {/* Leaflet Map + LeafletTual Vector Canvas Overlay */}
        <WorkbenchMapView
          activePreset={activePreset}
          activeTile={activeTile}
          controller={controller}
          readOnly={readOnly}
          collapsible={collapsible}
          toolbarPosition={toolbarPosition}
        />
      </div>
    </div>
  )
}
