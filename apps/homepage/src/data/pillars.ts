export interface PillarItem {
  id: string
  title: string
  tag: string
  badge: string
  stat: string
  description: string
  iconName: 'Compass' | 'Navigation' | 'Sparkles' | 'Layers' | 'Zap' | 'Shield'
}

export const PILLARS: PillarItem[] = [
  {
    id: 'geo-sync',
    title: 'Zero-Drift Geographic Projection',
    tag: 'Coordinate Sync',
    badge: 'Core Engine',
    stat: 'Zero Pixel Drift',
    description:
      'All annotations store real-world { lat, lng } coordinates. Continuous coordinate projection keeps arrows, shapes, notes, and sketches locked to the map across smooth zoom and pan.',
    iconName: 'Compass',
  },
  {
    id: 'arrow-engine',
    title: '5 Vector Arrow Styles',
    tag: 'Curved & Straight',
    badge: 'Vector Arrows',
    stat: '5 Arrow Styles',
    description:
      'Draw linear, curved Bézier, bi-directional, orthogonal elbow, and s-curve arrows with interactive curvature handles and 45° angle snapping.',
    iconName: 'Navigation',
  },
  {
    id: 'shapes-library',
    title: '8 Geometric Shape Primitives',
    tag: 'Shapes & Markers',
    badge: 'Geometric Shapes',
    stat: '8 Built-in Shapes',
    description:
      'Add squares, circles, stars, actor silhouettes, triangles, diamonds, hexagons, and map markers with 1:1 aspect ratio locking using the Shift key or toolbar toggle.',
    iconName: 'Sparkles',
  },
  {
    id: 'sticky-notes',
    title: 'Pinned Sticky Notes & Text Overlays',
    tag: 'Notes & Labels',
    badge: 'Map Annotations',
    stat: 'Expand / Collapse',
    description:
      'Place sticky notes and text annotations anchored to geographic coordinates, featuring collapsible card bodies, custom color palettes, and inline editing.',
    iconName: 'Layers',
  },
  {
    id: 'headless-controller',
    title: 'Flexible State & Built-in History',
    tag: 'Framework Agnostic',
    badge: 'State Management',
    stat: 'Undo / Redo',
    description:
      'Control state via createLeafletTual (or useLeafletTual in React) with built-in undo/redo history, or connect your own state store via controlled Doc values.',
    iconName: 'Zap',
  },
  {
    id: 'presentation-mode',
    title: 'Read-Only & Presentation Display',
    tag: 'Display Mode',
    badge: 'Dashboard Ready',
    stat: 'readOnly Prop',
    description:
      'Enable readOnly mode to hide editing handles and the drawing toolbar, presenting clean interactive annotations for dashboards, reports, and viewer screens.',
    iconName: 'Shield',
  },
]
