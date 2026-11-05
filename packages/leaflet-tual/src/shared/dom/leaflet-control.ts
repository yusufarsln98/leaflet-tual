import L from 'leaflet'
import { disableMapInteractions, type DisableDomPropagationOptions } from './ui-guard.js'
import { applyTheme, type ThemeTokens } from '../theme/tokens.js'

export interface ControlContainerOptions {
  orientation?: 'horizontal' | 'vertical'
  className?: string
  themeTokens?: Partial<ThemeTokens>
}

/**
 * Creates an isolated DOM container styled with the default Leaflet control bar theme.
 * Clients can populate this element with their own custom buttons, widgets, or logic.
 */
export function createControlContainer(options: ControlContainerOptions = {}): HTMLDivElement {
  const { orientation = 'vertical', className = '', themeTokens } = options
  const el = document.createElement('div')
  el.className = `tual tual-tool-group tual-bar ${className}`.trim()
  el.setAttribute('data-orientation', orientation)
  if (themeTokens) {
    applyTheme(el, themeTokens)
  }
  disableMapInteractions(el)
  return el
}

export interface LeafletControlOptions {
  position?: L.ControlPosition
  className?: string
  onAdd?: (map: L.Map) => HTMLElement
  onRemove?: (map: L.Map) => void
  disablePropagation?: boolean
  domOptions?: DisableDomPropagationOptions
}

/**
 * Creates a Leaflet Control instance with map interaction isolation built in.
 * Allows clients to easily mount custom sidebars, floating panels, or custom toolbars
 * into Leaflet's control corners.
 */
export function createLeafletControl(options: LeafletControlOptions = {}): L.Control {
  const {
    position = 'topleft',
    className = 'tual-control',
    onAdd,
    onRemove,
    disablePropagation = true,
    domOptions,
  } = options

  const CustomControl = L.Control.extend({
    options: {
      position,
    },

    onAdd(map: L.Map): HTMLElement {
      let el: HTMLElement
      if (onAdd) {
        el = onAdd(map)
      } else {
        el = L.DomUtil.create('div', className)
      }

      if (disablePropagation) {
        disableMapInteractions(el, domOptions)
      }

      return el
    },

    onRemove(map: L.Map) {
      if (onRemove) {
        onRemove(map)
      }
    },
  })

  return new CustomControl()
}
