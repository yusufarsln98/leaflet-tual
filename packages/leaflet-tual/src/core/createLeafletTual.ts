import type L from 'leaflet'
import type { Controller, CreateLeafletTualOptions } from './types.js'
import { LeafletTualCore } from './LeafletTualCore.js'

export function createLeafletTual(
  map: L.Map,
  options: CreateLeafletTualOptions = {},
): Controller & { destroy: () => void; core: LeafletTualCore } {
  const core = new LeafletTualCore(options)
  core.addTo(map)
  const controller = core.controller
  return Object.assign(controller, {
    destroy: () => core.destroy(),
    core,
  })
}
