import type L from 'leaflet'
import type { Controller, CreateLeafletTualOptions } from '../types/index.js'
import { createController } from './controller.js'
import { drawVanillaScene, type VanillaGesture } from './vanilla-drawing.js'
import { createVanillaGestures } from './vanilla-gestures.js'

export interface VanillaLeafletTual extends Controller {
  destroy(): void
}

export function createLeafletTual(
  map: L.Map,
  options: CreateLeafletTualOptions = {},
): VanillaLeafletTual {
  const controller = createController(options, () => map)

  const container = document.createElement('div')
  container.className = 'tual tual-container'
  if (options.zIndex !== undefined) container.style.zIndex = `${options.zIndex}`
  else container.style.zIndex = '650'

  const canvas = document.createElement('canvas')
  canvas.className = 'tual-canvas'
  container.appendChild(canvas)
  map.getContainer().appendChild(container)

  let systemDark = false
  let mediaQuery: MediaQueryList | null = null
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    systemDark = mediaQuery.matches ?? false
    mediaQuery.addEventListener?.('change', (e) => {
      systemDark = e.matches
      updateTheme()
    })
  }

  function resolveCurrentScheme(): 'light' | 'dark' {
    if (options.theme === 'dark') return 'dark'
    if (options.theme === 'light') return 'light'
    return systemDark ? 'dark' : 'light'
  }

  let resolvedScheme = resolveCurrentScheme()

  function updateTheme() {
    resolvedScheme = resolveCurrentScheme()
    container.setAttribute('data-theme', resolvedScheme)
    ;(controller as any)._setScheme(resolvedScheme)
    redraw()
  }

  function updateMapInteractions() {
    const isDrawingTool = controller.tool !== 'select'
    if (isDrawingTool && !controller.readOnly) {
      map.dragging.disable()
      map.doubleClickZoom.disable()
      canvas.style.cursor = 'crosshair'
    } else {
      map.dragging.enable()
      map.doubleClickZoom.enable()
      canvas.style.cursor = 'default'
    }

    // Shift is used by the annotation layer for aspect locks, angle snapping
    // and resizing. Keep Leaflet's Shift+drag box zoom out of the way.
    if (controller.readOnly) map.boxZoom.enable()
    else map.boxZoom.disable()
  }

  let activeGesture: VanillaGesture | null = null
  let isShiftPressed = false

  function redraw() {
    drawVanillaScene(
      canvas,
      map,
      controller,
      resolvedScheme,
      activeGesture,
      isShiftPressed,
      options.tokens,
    )
  }

  const gestures = createVanillaGestures({
    canvas,
    map,
    controller,
    getActiveGesture: () => activeGesture,
    setActiveGesture: (g) => { activeGesture = g },
    getShift: () => isShiftPressed,
    setShift: (s) => { isShiftPressed = s },
    redraw,
  })

  function onKeyDown(e: KeyboardEvent) {
    if (
      document.activeElement?.tagName === 'INPUT' ||
      document.activeElement?.tagName === 'TEXTAREA' ||
      (document.activeElement as HTMLElement)?.isContentEditable
    ) {
      return
    }

    const key = e.key.toUpperCase()
    const isMeta = e.metaKey || e.ctrlKey

    if (isMeta && key === 'Z') {
      e.preventDefault()
      if (e.shiftKey) controller.redo()
      else controller.undo()
      return
    }
    if (isMeta && key === 'Y') {
      e.preventDefault()
      controller.redo()
      return
    }
    if (e.key === 'Enter' && controller.tool === 'pen') {
      e.preventDefault()
      gestures.finishPen(false)
      return
    }
    if (e.key === 'Escape') {
      activeGesture = null
      controller.select(null)
      controller.setTool('select')
      return
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (controller.selection.length > 0) {
        e.preventDefault()
        controller.remove()
      }
      return
    }

    switch (key) {
      case 'V': controller.setTool('select'); break
      case 'T': controller.setTool('text'); break
      case 'N': controller.setTool('note'); break
      case 'F': controller.setTool('freedraw'); break
      case 'P': controller.setTool('pen'); break
      case 'L': controller.setTool('arrow'); break
      case 'S': controller.setTool('shape'); break
      case 'R': controller.setTool('ruler'); break
    }
  }

  updateMapInteractions()
  updateTheme()
  redraw()

  const mapHandler = () => redraw()
  map.on('move zoom viewreset resize', mapHandler)

  canvas.addEventListener('mousedown', gestures.onPointerDown)
  window.addEventListener('mousemove', gestures.onPointerMove)
  window.addEventListener('mouseup', gestures.onPointerUp)
  canvas.addEventListener('touchstart', gestures.onPointerDown, { passive: true })
  window.addEventListener('touchmove', gestures.onPointerMove, { passive: true })
  window.addEventListener('touchend', gestures.onPointerUp, { passive: true })
  window.addEventListener('keydown', onKeyDown)

  const unlistenState = controller.on('state', () => {
    updateMapInteractions()
    redraw()
  })

  return Object.assign(controller, {
    destroy() {
      unlistenState()
      container.remove()
      map.off('move zoom viewreset resize', mapHandler)
      canvas.removeEventListener('mousedown', gestures.onPointerDown)
      window.removeEventListener('mousemove', gestures.onPointerMove)
      window.removeEventListener('mouseup', gestures.onPointerUp)
      canvas.removeEventListener('touchstart', gestures.onPointerDown)
      window.removeEventListener('touchmove', gestures.onPointerMove)
      window.removeEventListener('touchend', gestures.onPointerUp)
      window.removeEventListener('keydown', onKeyDown)
      map.dragging.enable()
      map.doubleClickZoom.enable()
      map.boxZoom.enable()
    },
  })
}
