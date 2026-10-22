'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Compass,
  Crosshair,
  Layers,
  MapPin,
  Maximize2,
  Minus,
  MoveRight,
  Plus,
  Shapes,
  StickyNote,
} from 'lucide-react'
import { PlateMarks } from '../plate-marks'
import type { LayerFilter } from './constants'

interface LegendLayer {
  id: LayerFilter
  label: string
  sublabel: string
  count: string
  swatchColor: string
  icon: typeof Layers
  chips: string[]
  description: string
}

const LEGEND: LegendLayer[] = [
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
    sublabel: '5 styles: linear, curved, bi-dir, elbow, s-curve',
    count: '5 styles',
    swatchColor: 'var(--oh-lime)',
    icon: MoveRight,
    chips: ['Curved Bézier', 'Linear', 'Bi-directional', 'Elbow (90°)', 'S-Curve'],
    description:
      'Parametric Bézier curves with interactive tangent handles, angle snapping, and configurable arrowheads.',
  },
  {
    id: 'shapes',
    label: 'Geometric Shapes',
    sublabel: '8 shapes: square, circle, star, actor, triangle, diamond, hexagon, marker',
    count: '8 shapes',
    swatchColor: 'var(--oh-cyan)',
    icon: Shapes,
    chips: ['Square', 'Circle', 'Star', 'Actor', 'Triangle', 'Diamond', 'Hexagon', 'Marker'],
    description:
      'Parametric vector shapes with Shift 1:1 proportion locking, stroke & fill styling, and zero-drift geographic anchors.',
  },
  {
    id: 'notes',
    label: 'Pinned Notes & Text',
    sublabel: 'Station notes & cartographic labels',
    count: '2 pinned',
    swatchColor: 'light-dark(oklch(0.62 0.16 75), oklch(0.8 0.16 80))',
    icon: StickyNote,
    chips: ['Station Note', 'Field Note', 'Text Callout', 'Markdown Support'],
    description:
      'Interactive draggable memo cards and labels locked to geographic latitude/longitude with zero drift.',
  },
]

export function LegendPlate() {
  const [activeLayer, setActiveLayer] = useState<LayerFilter>('all')

  const showArrows = activeLayer === 'all' || activeLayer === 'arrows'
  const showShapes = activeLayer === 'all' || activeLayer === 'shapes'
  const showNotes = activeLayer === 'all' || activeLayer === 'notes'

  const currentLayer = LEGEND.find((item) => item.id === activeLayer) ?? LEGEND[0]

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault()
      const next = (index + 1) % LEGEND.length
      setActiveLayer(LEGEND[next].id)
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const prev = (index - 1 + LEGEND.length) % LEGEND.length
      setActiveLayer(LEGEND[prev].id)
    }
  }

  return (
    <div className="oh-marks">
      <PlateMarks />
      <figure className="oh-plate overflow-hidden">
        {/* ── Plate edge strip / Folio cartouche ── */}
        <figcaption className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--oh-line)] px-4 py-2.5 bg-[var(--oh-plate)]">
          <span className="flex items-center gap-2 oh-num">
            <Compass className="w-3.5 h-3.5 text-[var(--oh-lime)] shrink-0" />
            <span>Interactive Canvas Preview</span>
          </span>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 oh-num">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--oh-lime)] animate-pulse" />
              <span>Canvas Active</span>
            </span>
            <span className="oh-leg-count font-mono">EPSG:3857 · 60 FPS · 0.00px drift</span>
          </div>
        </figcaption>

        <div className="grid grid-cols-1 lg:grid-cols-[19rem_1fr]">
          {/* ── Left Sidebar: Layer filter controls & specification ── */}
          <div className="bg-[var(--oh-plate)] flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[var(--oh-line)]">
            <div>
              <div className="px-4 py-3 border-b border-[var(--oh-line)] flex items-center justify-between">
                <div>
                  <p className="oh-num">Canvas Layer Filter</p>
                  <p className="text-[11px] text-[var(--oh-ink-3)] mt-0.5">
                    Toggle annotations to inspect geometries
                  </p>
                </div>
                <Layers className="w-4 h-4 text-[var(--oh-ink-3)]" />
              </div>

              {/* Radio Group */}
              <div role="radiogroup" aria-label="Canvas annotation layers">
                {LEGEND.map((item, index) => {
                  const checked = activeLayer === item.id
                  return (
                    <label
                      key={item.id}
                      className="oh-leg-item relative"
                      onKeyDown={(e) => handleKeyDown(e, index)}
                    >
                      <input
                        type="radio"
                        name="hero-layer-filter"
                        value={item.id}
                        checked={checked}
                        onChange={() => setActiveLayer(item.id)}
                        className="sr-only"
                        aria-label={item.label}
                      />
                      <span
                        aria-hidden="true"
                        className="oh-leg-swatch"
                        style={{ background: item.swatchColor }}
                      />
                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="oh-leg-label">{item.label}</span>
                          <span className="oh-leg-count">{item.count}</span>
                        </div>
                        <p className="text-[11px] text-[var(--oh-ink-3)] truncate mt-0.5">
                          {item.sublabel}
                        </p>
                      </div>
                    </label>
                  )
                })}
              </div>

              {/* Active Layer Inspector Drawer */}
              <div className="px-4 py-3.5 border-t border-[var(--oh-line)] bg-[var(--oh-well)]/40">
                <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[var(--oh-line-2)]">
                  <span className="oh-tick-label text-[var(--oh-ink-2)]">Active Inspector</span>
                  <span className="font-mono text-[10px] text-[var(--oh-lime)] font-semibold">
                    {currentLayer.count}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-[var(--oh-ink-2)] mb-2.5">
                  {currentLayer.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {currentLayer.chips.map((chip) => (
                    <span
                      key={chip}
                      className="inline-block px-1.5 py-0.5 rounded-[2px] border border-[var(--oh-line-2)] bg-[var(--oh-plate)] font-mono text-[9.5px] text-[var(--oh-ink-2)]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Link to demo */}
            <div className="border-t border-[var(--oh-line)] px-4 py-3 bg-[var(--oh-plate)]">
              <Link
                href="/demo"
                className="inline-flex items-center justify-between w-full text-[12px] font-semibold text-[var(--oh-ink)] hover:text-[var(--oh-lime)] transition-colors group"
              >
                <span>Launch Interactive Demo</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* ── Interactive Viewport: Stylized Map with Canvas Overlay ── */}
          <div className="relative h-[24rem] sm:h-[28rem] lg:h-[29rem] oh-well select-none overflow-hidden">
            {/* ── Cartographic basemap and vector canvas SVG ── */}
            <svg
              aria-label="Interactive Leaflet vector canvas preview showing curved Bézier arrow, geofence shapes, and field notes"
              viewBox="0 0 760 480"
              preserveAspectRatio="xMidYMid meet"
              className="absolute inset-0 w-full h-full"
              role="img"
            >
              <defs>
                {/* Arrowhead marker: Lime */}
                <marker
                  id="folio-bezier-head"
                  markerWidth="10"
                  markerHeight="8"
                  refX="8"
                  refY="4"
                  orient="auto"
                >
                  <polygon points="0 1, 9 4, 0 7, 2 4" fill="var(--oh-lime)" />
                </marker>

                {/* Arrowhead marker: Elbow bi-directional */}
                <marker
                  id="folio-elbow-head"
                  markerWidth="8"
                  markerHeight="6"
                  refX="7"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0.5, 7 3, 0 5.5, 1.5 3" fill="var(--oh-lime)" />
                </marker>
                <marker
                  id="folio-elbow-start"
                  markerWidth="8"
                  markerHeight="6"
                  refX="0"
                  refY="3"
                  orient="auto-start-reverse"
                >
                  <polygon points="0 0.5, 7 3, 0 5.5, 1.5 3" fill="var(--oh-lime)" />
                </marker>

                {/* Subtle bathymetric water pattern */}
                <pattern id="bathymetry-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                  <path
                    d="M 0 24 Q 24 20 48 24"
                    fill="none"
                    stroke="var(--oh-line)"
                    strokeWidth="0.5"
                    strokeOpacity="0.4"
                  />
                </pattern>
              </defs>

              {/* ── BASEMAP: Water Body (Navigation Channel & Strait) ── */}
              <rect
                width="760"
                height="480"
                fill="color-mix(in oklch, var(--oh-cyan) 6%, var(--oh-well))"
              />
              <rect width="760" height="480" fill="url(#bathymetry-grid)" opacity="0.6" />

              {/* ── BASEMAP: Landmass (North-West Shore) ── */}
              <path
                d="M 0,0 L 460,0 C 430,70 380,120 300,160 C 220,195 160,240 120,310 C 90,365 50,420 0,460 Z"
                fill="var(--oh-plate)"
                stroke="var(--oh-line-2)"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />

              {/* North shore shelf contour */}
              <path
                d="M 0,0 L 472,0 C 440,76 388,128 308,168 C 228,203 168,248 128,318 C 98,373 58,428 0,468"
                fill="none"
                stroke="var(--oh-cyan)"
                strokeOpacity="0.3"
                strokeWidth="1"
                strokeDasharray="3 4"
                vectorEffect="non-scaling-stroke"
              />

              {/* North terrain contour lines */}
              <path
                d="M 30,40 C 130,30 220,50 250,90 C 270,120 220,150 140,140 C 60,130 20,80 30,40"
                fill="none"
                stroke="var(--oh-line)"
                strokeWidth="0.8"
                strokeOpacity="0.6"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M 60,60 C 120,55 170,70 190,95 C 200,115 160,130 110,125 C 60,120 45,90 60,60"
                fill="none"
                stroke="var(--oh-line)"
                strokeWidth="0.8"
                strokeOpacity="0.7"
                strokeDasharray="4 3"
                vectorEffect="non-scaling-stroke"
              />

              {/* ── BASEMAP: Landmass (South-East Shore) ── */}
              <path
                d="M 430,480 C 450,390 510,340 590,310 C 660,280 720,270 760,260 L 760,480 Z"
                fill="var(--oh-plate)"
                stroke="var(--oh-line-2)"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />

              {/* South shore shelf contour */}
              <path
                d="M 416,480 C 438,382 498,332 578,302 C 650,272 712,262 760,252"
                fill="none"
                stroke="var(--oh-cyan)"
                strokeOpacity="0.3"
                strokeWidth="1"
                strokeDasharray="3 4"
                vectorEffect="non-scaling-stroke"
              />

              {/* South terrain contours */}
              <path
                d="M 520,460 C 570,395 640,365 720,365 C 745,365 755,375 760,380"
                fill="none"
                stroke="var(--oh-line)"
                strokeWidth="0.8"
                strokeOpacity="0.6"
                vectorEffect="non-scaling-stroke"
              />

              {/* ── BASEMAP: Navigation Channel Fairway ── */}
              <path
                d="M 640,0 C 530,120 440,210 370,300 C 310,380 260,440 210,480"
                fill="none"
                stroke="var(--oh-line)"
                strokeWidth="1"
                strokeDasharray="8 6"
                strokeOpacity="0.6"
                vectorEffect="non-scaling-stroke"
              />

              {/* Depth soundings */}
              <text
                x="560"
                y="80"
                className="oh-tick-label"
                fill="var(--oh-ink-3)"
                opacity="0.7"
                fontSize="8.5"
              >
                32m
              </text>
              <text
                x="470"
                y="170"
                className="oh-tick-label"
                fill="var(--oh-ink-3)"
                opacity="0.7"
                fontSize="8.5"
              >
                28m
              </text>
              <text
                x="370"
                y="240"
                className="oh-tick-label"
                fill="var(--oh-ink-3)"
                opacity="0.7"
                fontSize="8.5"
              >
                24m
              </text>
              <text
                x="260"
                y="330"
                className="oh-tick-label"
                fill="var(--oh-ink-3)"
                opacity="0.7"
                fontSize="8.5"
              >
                19m
              </text>
              <text
                x="150"
                y="420"
                className="oh-tick-label"
                fill="var(--oh-ink-3)"
                opacity="0.7"
                fontSize="8.5"
              >
                14m
              </text>

              {/* Cartographic place labels */}
              <text
                x="50"
                y="85"
                className="oh-serif"
                fill="var(--oh-ink-2)"
                opacity="0.85"
                fontSize="13"
                letterSpacing="0.08em"
              >
                NORTH CAPE RIDGE
              </text>
              <text
                x="610"
                y="435"
                className="oh-serif"
                fill="var(--oh-ink-2)"
                opacity="0.85"
                fontSize="13"
                letterSpacing="0.08em"
              >
                EAST PENINSULA
              </text>
              <text
                x="430"
                y="225"
                className="oh-tick-label"
                fill="var(--oh-ink-3)"
                opacity="0.75"
                fontSize="8"
                letterSpacing="0.16em"
              >
                CENTRAL FAIRWAY
              </text>

              {/* ── BASEMAP: Graticule grid & ticks ── */}
              <line
                x1="200"
                y1="0"
                x2="200"
                y2="480"
                stroke="var(--oh-line)"
                strokeWidth="1"
                strokeDasharray="2 6"
                strokeOpacity="0.5"
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1="400"
                y1="0"
                x2="400"
                y2="480"
                stroke="var(--oh-line)"
                strokeWidth="1"
                strokeDasharray="2 6"
                strokeOpacity="0.5"
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1="600"
                y1="0"
                x2="600"
                y2="480"
                stroke="var(--oh-line)"
                strokeWidth="1"
                strokeDasharray="2 6"
                strokeOpacity="0.5"
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1="0"
                y1="120"
                x2="760"
                y2="120"
                stroke="var(--oh-line)"
                strokeWidth="1"
                strokeDasharray="2 6"
                strokeOpacity="0.5"
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1="0"
                y1="240"
                x2="760"
                y2="240"
                stroke="var(--oh-line)"
                strokeWidth="1"
                strokeDasharray="2 6"
                strokeOpacity="0.5"
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1="0"
                y1="360"
                x2="760"
                y2="360"
                stroke="var(--oh-line)"
                strokeWidth="1"
                strokeDasharray="2 6"
                strokeOpacity="0.5"
                vectorEffect="non-scaling-stroke"
              />

              {/* Center reticle */}
              <circle
                cx="380"
                cy="240"
                r="18"
                fill="none"
                stroke="var(--oh-line-2)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1="372"
                y1="240"
                x2="388"
                y2="240"
                stroke="var(--oh-line-2)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1="380"
                y1="232"
                x2="380"
                y2="248"
                stroke="var(--oh-line-2)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />

              {/* ═════════════════════════════════════════════════════════════
                  VECTOR CANVAS LAYER: GEOMETRIC SHAPES
                  ═════════════════════════════════════════════════════════════ */}
              <g
                className={`transition-opacity duration-300 ${
                  showShapes ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                {/* 1. Circle Geofence */}
                <circle
                  cx="220"
                  cy="200"
                  r="48"
                  fill="color-mix(in oklch, var(--oh-cyan) 12%, transparent)"
                  stroke="var(--oh-cyan)"
                  strokeWidth="1.8"
                  strokeDasharray="6 3"
                  vectorEffect="non-scaling-stroke"
                />
                <circle cx="220" cy="200" r="2.5" fill="var(--oh-cyan)" />
                {/* Radius dimension line */}
                <line
                  x1="220"
                  y1="200"
                  x2="268"
                  y2="200"
                  stroke="var(--oh-cyan)"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  vectorEffect="non-scaling-stroke"
                />
                <text
                  x="226"
                  y="194"
                  className="oh-tick-label"
                  fill="var(--oh-cyan)"
                  fontSize="8"
                  fontWeight="bold"
                >
                  r = 650m
                </text>
                {/* Bounding box handles (proportional editing) */}
                <rect
                  x="169"
                  y="149"
                  width="6"
                  height="6"
                  fill="var(--oh-plate)"
                  stroke="var(--oh-cyan)"
                  strokeWidth="1.2"
                  vectorEffect="non-scaling-stroke"
                />
                <rect
                  x="265"
                  y="149"
                  width="6"
                  height="6"
                  fill="var(--oh-plate)"
                  stroke="var(--oh-cyan)"
                  strokeWidth="1.2"
                  vectorEffect="non-scaling-stroke"
                />
                <rect
                  x="265"
                  y="245"
                  width="6"
                  height="6"
                  fill="var(--oh-plate)"
                  stroke="var(--oh-cyan)"
                  strokeWidth="1.2"
                  vectorEffect="non-scaling-stroke"
                />
                <rect
                  x="169"
                  y="245"
                  width="6"
                  height="6"
                  fill="var(--oh-plate)"
                  stroke="var(--oh-cyan)"
                  strokeWidth="1.2"
                  vectorEffect="non-scaling-stroke"
                />
                <g transform="translate(172, 140)">
                  <rect
                    rx="2"
                    width="104"
                    height="17"
                    fill="var(--oh-plate)"
                    stroke="var(--oh-cyan)"
                    strokeWidth="1"
                  />
                  <text
                    x="6"
                    y="12"
                    className="font-mono text-[8.5px] font-bold"
                    fill="var(--oh-ink)"
                  >
                    SECTOR ZULU · CIRCLE
                  </text>
                </g>

                {/* 2. Hexagon Shape */}
                <polygon
                  points="587,292 587,338 540,361 493,338 493,292 540,269"
                  fill="color-mix(in oklch, var(--oh-cyan) 10%, transparent)"
                  stroke="var(--oh-cyan)"
                  strokeWidth="1.8"
                  vectorEffect="non-scaling-stroke"
                />
                {/* Hexagon corner edit handles */}
                {[
                  [587, 292],
                  [587, 338],
                  [540, 361],
                  [493, 338],
                  [493, 292],
                  [540, 269],
                ].map(([x, y], idx) => (
                  <rect
                    key={idx}
                    x={x - 2.5}
                    y={y - 2.5}
                    width="5"
                    height="5"
                    fill="var(--oh-plate)"
                    stroke="var(--oh-cyan)"
                    strokeWidth="1.2"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                <g transform="translate(480, 305)">
                  <rect
                    rx="2"
                    width="122"
                    height="18"
                    fill="var(--oh-plate)"
                    stroke="var(--oh-line-2)"
                    strokeWidth="1"
                  />
                  <text
                    x="6"
                    y="12.5"
                    className="font-mono text-[8.5px] font-semibold"
                    fill="var(--oh-ink)"
                  >
                    ANCHORAGE · HEXAGON
                  </text>
                </g>

                {/* 3. 5-Pointed Star Shape */}
                <polygon
                  points="450,177 454,189 467,189 457,197 461,210 450,202 439,210 443,197 433,189 446,189"
                  fill="color-mix(in oklch, var(--oh-cyan) 14%, transparent)"
                  stroke="var(--oh-cyan)"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
                <g transform="translate(406, 218)">
                  <rect
                    rx="2"
                    width="90"
                    height="16"
                    fill="var(--oh-plate)"
                    stroke="var(--oh-line-2)"
                    strokeWidth="1"
                  />
                  <text
                    x="6"
                    y="11.5"
                    className="font-mono text-[8px] font-semibold"
                    fill="var(--oh-ink)"
                  >
                    LANDMARK · STAR
                  </text>
                </g>

                {/* 4. Map Pin Marker Shape */}
                <g transform="translate(675, 195)">
                  <path
                    d="M 0,22 C -13,10 -14,3 -14,-4 A 14,14 0 1,1 14,-4 C 14,3 13,10 0,22 Z"
                    fill="color-mix(in oklch, var(--oh-cyan) 18%, transparent)"
                    stroke="var(--oh-cyan)"
                    strokeWidth="1.8"
                    vectorEffect="non-scaling-stroke"
                  />
                  <circle
                    cx="0"
                    cy="-4"
                    r="4.5"
                    fill="var(--oh-plate)"
                    stroke="var(--oh-cyan)"
                    strokeWidth="1.2"
                  />
                  <rect
                    x="18"
                    y="-12"
                    width="96"
                    height="17"
                    rx="2"
                    fill="var(--oh-plate)"
                    stroke="var(--oh-line-2)"
                    strokeWidth="1"
                  />
                  <text
                    x="24"
                    y="0"
                    className="font-mono text-[8px] font-bold"
                    fill="var(--oh-ink)"
                  >
                    WAYPOINT · MARKER
                  </text>
                </g>

                {/* 5. Tactical Actor (Personnel) Shape */}
                <g transform="translate(345, 335)">
                  {/* Head */}
                  <circle
                    cx="0"
                    cy="-14"
                    r="5.5"
                    fill="none"
                    stroke="var(--oh-cyan)"
                    strokeWidth="1.6"
                    vectorEffect="non-scaling-stroke"
                  />
                  {/* Spine */}
                  <line
                    x1="0"
                    y1="-8.5"
                    x2="0"
                    y2="7"
                    stroke="var(--oh-cyan)"
                    strokeWidth="1.6"
                    vectorEffect="non-scaling-stroke"
                  />
                  {/* Arms */}
                  <line
                    x1="-10"
                    y1="-1"
                    x2="10"
                    y2="-1"
                    stroke="var(--oh-cyan)"
                    strokeWidth="1.6"
                    vectorEffect="non-scaling-stroke"
                  />
                  {/* Legs */}
                  <line
                    x1="0"
                    y1="7"
                    x2="-8"
                    y2="21"
                    stroke="var(--oh-cyan)"
                    strokeWidth="1.6"
                    vectorEffect="non-scaling-stroke"
                  />
                  <line
                    x1="0"
                    y1="7"
                    x2="8"
                    y2="21"
                    stroke="var(--oh-cyan)"
                    strokeWidth="1.6"
                    vectorEffect="non-scaling-stroke"
                  />
                  <rect
                    x="-42"
                    y="25"
                    width="84"
                    height="16"
                    rx="2"
                    fill="var(--oh-plate)"
                    stroke="var(--oh-line-2)"
                    strokeWidth="1"
                  />
                  <text
                    x="-36"
                    y="36"
                    className="font-mono text-[8px] font-semibold"
                    fill="var(--oh-ink)"
                  >
                    SURVEYOR · ACTOR
                  </text>
                </g>
              </g>

              {/* ═════════════════════════════════════════════════════════════
                  VECTOR CANVAS LAYER: VECTOR ARROWS & FREEHAND
                  ═════════════════════════════════════════════════════════════ */}
              <g
                className={`transition-opacity duration-300 ${
                  showArrows ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                {/* 1. Curved Bézier Corridor Arrow */}
                <path
                  d="M 120,290 Q 360,65 660,150"
                  fill="none"
                  stroke="var(--oh-lime)"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  markerEnd="url(#folio-bezier-head)"
                  vectorEffect="non-scaling-stroke"
                />

                {/* Bézier Curvature Tangent Construction Handle */}
                <line
                  x1="375"
                  y1="140"
                  x2="360"
                  y2="65"
                  stroke="var(--oh-ink-3)"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                  vectorEffect="non-scaling-stroke"
                />
                {/* Tangent control handle handle */}
                <rect
                  x="354"
                  y="59"
                  width="12"
                  height="12"
                  rx="2"
                  fill="var(--oh-plate)"
                  stroke="var(--oh-lime)"
                  strokeWidth="2"
                  className="cursor-grab"
                  vectorEffect="non-scaling-stroke"
                />
                {/* Start anchor circle */}
                <circle
                  cx="120"
                  cy="290"
                  r="4.5"
                  fill="var(--oh-plate)"
                  stroke="var(--oh-lime)"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />

                {/* Control Handle Label */}
                <g transform="translate(374, 55)">
                  <rect
                    rx="2"
                    width="122"
                    height="19"
                    fill="var(--oh-plate)"
                    stroke="var(--oh-line-2)"
                    strokeWidth="1"
                  />
                  <text
                    x="6"
                    y="13"
                    className="font-mono text-[8.5px] font-semibold"
                    fill="var(--oh-ink)"
                  >
                    Ctrl Pt (41.026°N, 28.988°E)
                  </text>
                </g>

                {/* Arrow route badge along path */}
                <g transform="translate(435, 122) rotate(12)">
                  <rect
                    rx="2"
                    width="158"
                    height="20"
                    fill="var(--oh-plate)"
                    stroke="var(--oh-lime)"
                    strokeWidth="1"
                  />
                  <circle cx="10" cy="10" r="3" fill="var(--oh-lime)" />
                  <text
                    x="18"
                    y="13.5"
                    className="font-mono text-[9px] font-bold tracking-wide"
                    fill="var(--oh-ink)"
                  >
                    TRANSIT CORRIDOR · BÉZIER
                  </text>
                </g>

                {/* 2. Secondary Elbow Vector Arrow (90° Snap) */}
                <path
                  d="M 180,360 L 290,360 L 290,430"
                  fill="none"
                  stroke="var(--oh-lime)"
                  strokeWidth="1.8"
                  strokeDasharray="5 3"
                  markerStart="url(#folio-elbow-start)"
                  markerEnd="url(#folio-elbow-head)"
                  vectorEffect="non-scaling-stroke"
                />
                <text
                  x="184"
                  y="352"
                  className="font-mono text-[8.5px] font-medium"
                  fill="var(--oh-ink-2)"
                >
                  Elbow Vector (90° Snap)
                </text>

                {/* 3. Freehand Recon Track (Freedraw item) */}
                <path
                  d="M 80,180 C 110,150 140,165 170,145 S 220,160 240,135"
                  fill="none"
                  stroke="var(--oh-lime)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeOpacity="0.8"
                  vectorEffect="non-scaling-stroke"
                />
                <circle cx="80" cy="180" r="2.5" fill="var(--oh-lime)" />
                <circle cx="240" cy="135" r="2.5" fill="var(--oh-lime)" />
                <text
                  x="82"
                  y="142"
                  className="font-mono text-[8px] italic"
                  fill="var(--oh-ink-3)"
                >
                  Recon Track [Freedraw · 28 pts]
                </text>
              </g>

              {/* ═════════════════════════════════════════════════════════════
                  VECTOR CANVAS LAYER: PINNED NOTES & TEXT
                  ═════════════════════════════════════════════════════════════ */}
              <g
                className={`transition-opacity duration-300 ${
                  showNotes ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                {/* Note Geo Anchor Marker */}
                <circle
                  cx="400"
                  cy="215"
                  r="3.5"
                  fill="#f59e0b"
                  stroke="#78350f"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                />
                <circle
                  cx="400"
                  cy="215"
                  r="9"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  opacity="0.75"
                  vectorEffect="non-scaling-stroke"
                />
                {/* Hairline tether line from anchor to card */}
                <path
                  d="M 400,215 L 435,185 L 455,185"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="1.2"
                  strokeDasharray="2 2"
                  vectorEffect="non-scaling-stroke"
                />

                {/* Standalone Cartographic Text Overlay */}
                <g transform="translate(290, 310)">
                  <rect
                    rx="1"
                    width="180"
                    height="18"
                    fill="var(--oh-plate)"
                    stroke="var(--oh-line-2)"
                    strokeWidth="1"
                  />
                  <text
                    x="8"
                    y="12.5"
                    className="font-mono text-[8.5px] font-bold tracking-wider"
                    fill="var(--oh-ink)"
                  >
                    BOSPHORUS TRANSIT SECTOR · 02
                  </text>
                </g>
              </g>
            </svg>

            {/* ── Leaflet Controls Overlay (Top-Left) ── */}
            <div className="absolute top-3 left-3 flex flex-col rounded-[2px] border border-[var(--oh-line-2)] bg-[var(--oh-plate)] shadow-sm overflow-hidden z-10">
              <button
                type="button"
                aria-label="Zoom in preview map"
                className="w-6 h-6 flex items-center justify-center font-mono text-xs text-[var(--oh-ink)] hover:bg-[var(--oh-well)] border-b border-[var(--oh-line)] transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
              <button
                type="button"
                aria-label="Zoom out preview map"
                className="w-6 h-6 flex items-center justify-center font-mono text-xs text-[var(--oh-ink)] hover:bg-[var(--oh-well)] transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
            </div>

            {/* Map Mode Chip (Top-Left adjacent) */}
            <div className="absolute top-3 left-11 hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-[2px] border border-[var(--oh-line)] bg-[var(--oh-plate)]/90 text-[10px] font-mono text-[var(--oh-ink-2)] backdrop-blur-sm z-10">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--oh-lime)]" />
              <span>MapContainer Vector Overlay</span>
            </div>

            {/* ── North needle / Compass (Top-Right) ── */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-[2px] border border-[var(--oh-line-2)] bg-[var(--oh-plate)]/90 backdrop-blur-sm z-10">
              <svg viewBox="0 0 14 18" className="w-3 h-3.5 text-[var(--oh-ink)]" aria-hidden="true">
                <path d="M7 0 L11 9 L7 7 L3 9 Z" fill="var(--oh-needle)" />
                <path d="M7 18 L4 10 L7 12 L10 10 Z" fill="currentColor" opacity="0.45" />
              </svg>
              <span className="font-mono text-[10px] font-semibold text-[var(--oh-ink)]">N 000°</span>
            </div>

            {/* ── Geographically Pinned Sticky Note (HTML Overlay) ── */}
            <div
              className={`absolute top-[32%] sm:top-[30%] left-[38%] sm:left-[44%] w-56 sm:w-64 rounded-sm border border-amber-500/50 bg-amber-50/95 dark:bg-amber-950/75 backdrop-blur-md p-2.5 shadow-md transition-all duration-300 z-10 ${
                showNotes ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'
              }`}
            >
              <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-amber-600/20 dark:border-amber-400/25">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  <span className="font-mono text-[10.5px] font-bold text-amber-900 dark:text-amber-200">
                    Field Note · Station 04
                  </span>
                </div>
                <span className="font-mono text-[9px] text-amber-700/80 dark:text-amber-400/80">
                  Pinned
                </span>
              </div>
              <p className="text-[10px] leading-relaxed text-amber-950 dark:text-amber-100/90 font-sans">
                Pinned note anchored to Leaflet EPSG:3857 coordinates with zero pan/zoom drift.
              </p>
              <div className="flex items-center justify-between text-[9px] font-mono text-amber-800/80 dark:text-amber-300/80 border-t border-amber-600/15 dark:border-amber-400/15 pt-1 mt-1.5">
                <span>Lat 41.0182° · Lng 28.9840°</span>
                <span className="text-amber-700 dark:text-amber-400 font-semibold">0.00 px</span>
              </div>
            </div>

            {/* ── Scale bar (Bottom-Left) ── */}
            <div className="absolute bottom-9 left-3 z-10 hidden sm:flex flex-col gap-0.5">
              <div className="flex h-1.5 w-24 border border-[var(--oh-ink-3)] bg-[var(--oh-plate)] overflow-hidden">
                <div className="w-1/2 bg-[var(--oh-ink)]" />
                <div className="w-1/2 bg-transparent" />
              </div>
              <span className="font-mono text-[9px] text-[var(--oh-ink-3)]">500 m / 0.27 nmi</span>
            </div>

            {/* ── Leaflet attribution (Bottom-Right) ── */}
            <div className="absolute bottom-9 right-3 z-10 hidden sm:block font-mono text-[9px] text-[var(--oh-ink-3)] bg-[var(--oh-plate)]/85 px-1.5 py-0.5 rounded-[1px] border border-[var(--oh-line)]">
              Leaflet · © Carto Basemap
            </div>

            {/* ── Status Bar / GIS Coordinate Readout (Bottom Strip) ── */}
            <div className="absolute bottom-0 left-0 right-0 h-7 border-t border-[var(--oh-line)] bg-[var(--oh-plate)]/95 backdrop-blur-sm flex items-center justify-between px-3 text-[10px] font-mono z-10">
              <div className="flex items-center gap-2 text-[var(--oh-ink-2)]">
                <Crosshair className="w-3 h-3 text-[var(--oh-lime)] shrink-0" />
                <span>41°01&apos;24.8&quot;N · 28°58&apos;36.4&quot;E</span>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-[var(--oh-ink-3)]">
                <span>CRS: EPSG:3857</span>
                <span>Zoom: 13.5</span>
                <span>Scale: 1:25,000</span>
              </div>
              <div className="flex items-center gap-1.5 text-[var(--oh-ink)]">
                <Maximize2 className="w-3 h-3 text-[var(--oh-lime)]" />
                <span className="font-semibold">60 FPS</span>
              </div>
            </div>
          </div>
        </div>
      </figure>
    </div>
  )
}
