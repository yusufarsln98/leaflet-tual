import type L from 'leaflet'
import type { CreateLeafletTualOptions, InternalController } from './types.js'
import { createController } from './controller.js'
import { createMapContext, type MapContext } from './map-context.js'
import { EventBus } from './event-bus.js'
import { drawCanvasScene } from '../shared/drawing/canvas/canvas-drawing.js'
import { themeTokensToCssVariables } from '../shared/theme/tokens.js'

export class LeafletTualCore {
  readonly controller: InternalController
  readonly mapContext: MapContext
  readonly eventBus: EventBus
  private _map: L.Map | null = null
  private _container: HTMLDivElement | null = null
  private _canvas: HTMLCanvasElement | null = null
  private _cleanupFns: Array<() => void> = []
  private _themeTokens?: CreateLeafletTualOptions['themeTokens']

  constructor(options: CreateLeafletTualOptions = {}) {
    this.mapContext = createMapContext()
    this.eventBus = new EventBus()
    this._themeTokens = options.themeTokens
    this.controller = createController(options, () => this._map) as InternalController
  }

  get container(): HTMLDivElement | null {
    return this._container
  }

  get canvas(): HTMLCanvasElement | null {
    return this._canvas
  }

  addTo(map: L.Map): this {
    this.onAdd(map)
    return this
  }

  onAdd(map: L.Map): this {
    this._map = map
    this.mapContext.setMap(map)
    this.controller._setMap?.(map)

    // Mount canvas layer if DOM is available
    if (typeof document !== 'undefined' && map.getContainer) {
      const mapContainer = map.getContainer()
      const container = document.createElement('div')
      container.className = 'leaflet-tual-pane'
      container.style.position = 'absolute'
      container.style.inset = '0'
      container.style.pointerEvents = 'none'
      container.style.zIndex = '400'

      if (this._themeTokens) {
        for (const [name, value] of Object.entries(
          themeTokensToCssVariables(this._themeTokens),
        )) {
          container.style.setProperty(name, value)
        }
      }

      const canvas = document.createElement('canvas')
      canvas.className = 'leaflet-tual-canvas'
      canvas.style.position = 'absolute'
      canvas.style.inset = '0'
      canvas.style.pointerEvents = this.controller.readOnly ? 'none' : 'auto'
      container.appendChild(canvas)
      mapContainer.appendChild(container)

      this._container = container
      this._canvas = canvas

      const redraw = () => {
        if (!this._canvas || !this._map) return
        drawCanvasScene(this._canvas, this._map, this.controller, null, false, null)
      }

      // Map change listeners
      const onMapMove = () => redraw()
      const onMapZoom = () => redraw()
      map.on?.('move', onMapMove)
      map.on?.('zoom', onMapZoom)
      map.on?.('resize', onMapMove)

      // Controller listeners
      const unsubChange = this.controller.on('change', () => redraw())
      const unsubState = this.controller.on('state', () => {
        if (this._canvas) {
          this._canvas.style.pointerEvents = this.controller.readOnly ? 'none' : 'auto'
        }
        redraw()
      })

      redraw()

      this._cleanupFns.push(() => {
        map.off?.('move', onMapMove)
        map.off?.('zoom', onMapZoom)
        map.off?.('resize', onMapMove)
        unsubChange()
        unsubState()
        container.remove()
      })
    }

    return this
  }

  onRemove(): this {
    for (const cleanup of this._cleanupFns) {
      cleanup()
    }
    this._cleanupFns = []
    this._container = null
    this._canvas = null
    this._map = null
    this.mapContext.setMap(null)
    this.controller._setMap?.(null)
    return this
  }

  destroy(): void {
    this.onRemove()
    this.eventBus.clear()
  }
}
