import type { ShowcasePreset } from './types'

export const ALPINE_PRESET: ShowcasePreset = {
  id: 'alpine',
  name: 'Alpine Trails & Search Grid',
  region: 'Chamonix / Mont Blanc',
  center: [45.923, 6.869],
  zoom: 12,
  description:
    'Mountain trail paths, high-altitude basecamps, and search perimeters in the Mont Blanc massif.',
  items: [
    {
      id: 'flight-path-rescue',
      type: 'arrow',
      kind: 's-curve',
      from: { lat: 45.905, lng: 6.84 },
      to: { lat: 45.938, lng: 6.91 },
      via: { lat: 45.93, lng: 6.86 },
      style: { color: 'blue', width: 'l' },
      label: 'Rescue Route',
      createdAt: 1000,
    },
    {
      id: 'summit-star',
      type: 'shape',
      kind: 'star',
      from: { lat: 45.855, lng: 6.835 },
      to: { lat: 45.815, lng: 6.895 },
      style: { color: 'yellow', fill: 'solid' },
      label: 'Summit',
      createdAt: 2000,
    },
    {
      id: 'perimeter-zone',
      type: 'shape',
      kind: 'hexagon',
      from: { lat: 45.95, lng: 6.84 },
      to: { lat: 45.91, lng: 6.9 },
      style: { color: 'blue', fill: 'tint' },
      label: 'Sector Bravo',
      createdAt: 3000,
    },
    {
      id: 'camp-note',
      type: 'note',
      at: { lat: 45.925, lng: 6.83 },
      title: 'Chamonix Helipad Station',
      text: 'Weather radar reports crosswinds < 15kt. Ready for mountain extraction standby.',
      style: { color: 'yellow' },
      createdAt: 4000,
    },
  ],
}
