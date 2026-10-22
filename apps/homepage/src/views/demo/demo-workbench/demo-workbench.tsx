'use client'

import { useEffect, useRef, useState } from 'react'
import { PanelLeftOpen } from 'lucide-react'
import {
  type ToolbarPosition,
  useLeafletCanvas,
} from 'leaflet-tual/react'
import { SHOWCASE_PRESETS, type ShowcasePreset } from '../../../data/presets'
import { FREE_TILE_LAYERS, type FreeTileLayer } from '../../../data/tiles'
import { useTheme } from '../../../components/theme-provider'
import type { DemoWorkbenchProps } from './types'
import { useCanvasThemeStyles } from './use-canvas-theme-styles'
import { WorkbenchMockHeader } from './workbench-mock-header'
import { WorkbenchDrawer } from './workbench-drawer'
import { WorkbenchMapView } from './workbench-map-view'

export function DemoWorkbench({ mode = 'embedded', initialDrawerOpen }: DemoWorkbenchProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [activePreset, setActivePreset] = useState<ShowcasePreset>(SHOWCASE_PRESETS[0])
  const [tileLayerId, setTileLayerId] = useState<string>('osm')
  const [canvasTheme, setCanvasTheme] = useState<'default' | 'homepage'>('homepage')
  const [toolbarPosition, setToolbarPosition] = useState<ToolbarPosition>('top-center')
  const [readOnly, setReadOnly] = useState<boolean>(false)
  const [collapsible, setCollapsible] = useState<boolean>(true)
  const [showToolLabels, setShowToolLabels] = useState<boolean>(false)
  const [copied, setCopied] = useState<boolean>(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(
    initialDrawerOpen !== undefined ? initialDrawerOpen : mode === 'fullscreen',
  )
  const drawerRef = useRef<HTMLElement>(null)

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
    FREE_TILE_LAYERS.find((t) => t.id === tileLayerId) ?? FREE_TILE_LAYERS[0]

  const controller = useLeafletCanvas({
    initialItems: activePreset.items,
    readOnly,
  })

  const { arrowTheme, strokeColors, canvasStyles } = useCanvasThemeStyles(isDark)

  const handleToggleReadOnly = (next: boolean) => {
    setReadOnly(next)
    controller.setReadOnly(next)
  }

  const handleSelectPreset = (presetId: string) => {
    const preset = SHOWCASE_PRESETS.find((p) => p.id === presetId)
    if (!preset) return
    setActivePreset(preset)
    controller.clearAll()
    preset.items.forEach((item) => controller.addItem(item))
  }

  const handleResetScenario = () => {
    controller.clearAll()
    activePreset.items.forEach((item) => controller.addItem(item))
  }

  const handleCopyJson = () => {
    navigator.clipboard.writeText(controller.exportJSON())
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
        className={`relative w-full ${
          isFullscreen ? 'flex-1 min-h-0' : 'h-[620px]'
        } overflow-hidden`}
      >
        {/* Mobile Backdrop when drawer is open */}
        {isDrawerOpen && (
          <div
            className="sm:hidden absolute inset-0 bg-black/40 z-[1040] backdrop-blur-[2px] transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Controls Drawer */}
        <WorkbenchDrawer
          drawerRef={drawerRef}
          isDrawerOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          tileLayerId={tileLayerId}
          onTileLayerChange={setTileLayerId}
          activePreset={activePreset}
          onSelectPreset={handleSelectPreset}
          controller={controller}
          onResetScenario={handleResetScenario}
          canvasTheme={canvasTheme}
          onCanvasThemeChange={setCanvasTheme}
          toolbarPosition={toolbarPosition}
          onToolbarPositionChange={setToolbarPosition}
          readOnly={readOnly}
          onToggleReadOnly={handleToggleReadOnly}
          collapsible={collapsible}
          onCollapsibleChange={setCollapsible}
          showToolLabels={showToolLabels}
          onShowToolLabelsChange={setShowToolLabels}
          copied={copied}
          onCopyJson={handleCopyJson}
        />

        {/* Floating Open Drawer Button when closed */}
        {!isDrawerOpen && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setIsDrawerOpen(true)
            }}
            className="absolute top-3 left-3 z-[1001] inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-pane/95 backdrop-blur-md border border-border-primary hover:border-accent text-text-primary text-xs font-mono font-bold shadow-lg hover:shadow-xl hover:bg-bg-sidebar transition-all cursor-pointer group"
            title="Open Controls Drawer"
            aria-label="Open Controls Drawer"
          >
            <PanelLeftOpen className="w-4 h-4 text-accent transition-transform group-hover:scale-110" />
            <span>Controls</span>
          </button>
        )}

        {/* Map Viewport */}
        <WorkbenchMapView
          activePreset={activePreset}
          activeTile={activeTile}
          controller={controller}
          canvasTheme={canvasTheme}
          arrowTheme={arrowTheme}
          canvasStyles={canvasStyles}
          strokeColors={strokeColors}
          readOnly={readOnly}
          collapsible={collapsible}
          toolbarPosition={toolbarPosition}
          showToolLabels={showToolLabels}
        />
      </div>
    </div>
  )
}

