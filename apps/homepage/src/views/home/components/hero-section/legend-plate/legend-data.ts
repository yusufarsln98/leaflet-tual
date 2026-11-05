import { Layers, MoveRight, Shapes, StickyNote } from 'lucide-react'
import { DEFAULT_PALETTE } from 'leaflet-tual'
import type { LegendLayer } from './types'

export const LEGEND: LegendLayer[] = [
  {
    id: 'all',
    label: 'All Annotations',
    sublabel: 'Full vector overlay stack',
    count: '04 types',
    swatchColor: 'var(--oh-ink)',
    icon: Layers,
    chips: ['Zero-drift projection', 'EPSG:3857 sync', 'Shift-to-snap', 'Undo / Redo'],
    description:
      'Unified vector canvas overlay rendered synchronously with Leaflet zoom and pan passes.',
  },
  {
    id: 'arrows',
    label: 'Vector Arrows',
    sublabel: '4 styles: linear, curved, bi-dir, elbow',
    count: '4 styles',
    swatchColor: DEFAULT_PALETTE.blue,
    icon: MoveRight,
    chips: ['Curved Bézier', 'Linear', 'Bi-directional', 'Elbow (90°)'],
    description:
      'Parametric Bézier curves with interactive tangent handles, angle snapping, and configurable arrowheads.',
  },
  {
    id: 'shapes',
    label: 'Geometric Shapes',
    sublabel: '8 shapes: square, circle, star, actor, triangle, diamond, hexagon, marker',
    count: '8 shapes',
    swatchColor: DEFAULT_PALETTE.blue,
    icon: Shapes,
    chips: ['Square', 'Circle', 'Star', 'Actor', 'Triangle', 'Diamond', 'Hexagon', 'Marker'],
    description:
      'Parametric vector shapes with Shift 1:1 proportion locking, stroke & fill styling, and zero-drift geographic anchors.',
  },
  {
    id: 'notes',
    label: 'Pinned Notes & Text',
    sublabel: 'Station notes & cartographic labels',
    count: '1 pinned',
    swatchColor: DEFAULT_PALETTE.yellow,
    icon: StickyNote,
    chips: ['Station Note', 'Field Note', 'Text Callout', 'Markdown Support'],
    description:
      'Interactive draggable memo cards and labels locked to geographic latitude/longitude with zero drift.',
  },
]
