'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Compass, Crosshair, Info, Layers, Maximize2, Minus, Plus, X } from 'lucide-react'
import { DEFAULT_PALETTE } from 'leaflet-tual'
import { PlateMarks } from '../../plate-marks'
import type { LayerFilter } from '../constants'
import { LEGEND } from './legend-data'
import { Handle, OpenHead, SvgLabel, TriangleHead } from './item-marks'
import { DASH, HANDLE_COLOR, NOTE_SURFACE, STROKE, tint } from './item-styles'

export function LegendPlate() {
  const [activeLayer, setActiveLayer] = useState<LayerFilter>('all')
  const [isInfoOpen, setIsInfoOpen] = useState(false)

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
                {/* Circle — blue, width m, dashed, 25% tint fill */}
                <circle
                  cx="220"
                  cy="200"
                  r="48"
                  fill={tint(DEFAULT_PALETTE.blue)}
                  stroke={DEFAULT_PALETTE.blue}
                  strokeWidth={STROKE.m}
                  strokeDasharray={DASH.dashed.join(' ')}
                  vectorEffect="non-scaling-stroke"
                />
                {/* Selected shape: dashed bounds + screen-constant handles */}
                <rect
                  x="172"
                  y="152"
                  width="96"
                  height="96"
                  fill="none"
                  stroke={HANDLE_COLOR}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  vectorEffect="non-scaling-stroke"
                />
                <Handle x={172} y={152} />
                <Handle x={268} y={152} />
                <Handle x={268} y={248} />
                <Handle x={172} y={248} />
                <SvgLabel x={220} y={141}>
                  Sector Alpha
                </SvgLabel>

                {/* Hexagon — gray, width m, dashed */}
                <polygon
                  points="580.7,292 580.7,338 540,361 499.3,338 499.3,292 540,269"
                  fill={tint(DEFAULT_PALETTE.gray)}
                  stroke={DEFAULT_PALETTE.gray}
                  strokeWidth={STROKE.m}
                  strokeDasharray={DASH.dashed.join(' ')}
                  vectorEffect="non-scaling-stroke"
                />
                <SvgLabel x={540} y={258}>
                  Sector Bravo
                </SvgLabel>

                {/* Star — yellow, width m, solid, 25% tint fill */}
                <polygon
                  points="450,171 455.43,185.52 470.92,186.2 458.79,195.85 462.93,210.8 450,202.24 437.07,210.8 441.21,195.85 429.08,186.2 444.57,185.52"
                  fill={tint(DEFAULT_PALETTE.yellow)}
                  stroke={DEFAULT_PALETTE.yellow}
                  strokeWidth={STROKE.m}
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
                <SvgLabel x={450} y={160}>
                  Maiden&apos;s Tower
                </SvgLabel>

                {/* Marker — blue, width m, solid, tint fill with inner hole */}
                <g transform="translate(675, 175)">
                  <path
                    d="M 0 44 C -13.5 30.8 -15 22 -15 15.84 A 15 15.84 0 0 1 15 15.84 C 15 22 13.5 30.8 0 44 Z M -5.25 15.84 A 5.25 5.54 0 1 0 5.25 15.84 A 5.25 5.54 0 1 0 -5.25 15.84 Z"
                    fill={tint(DEFAULT_PALETTE.blue)}
                    fillRule="evenodd"
                    stroke={DEFAULT_PALETTE.blue}
                    strokeWidth={STROKE.m}
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
                <SvgLabel x={675} y={230}>
                  Waypoint
                </SvgLabel>

                {/* Actor — gray, width m, solid with tint-filled head */}
                <g transform="translate(345, 335)">
                  <circle
                    cx="0"
                    cy="-14"
                    r="5.5"
                    fill={tint(DEFAULT_PALETTE.gray)}
                    stroke={DEFAULT_PALETTE.gray}
                    strokeWidth={STROKE.m}
                    vectorEffect="non-scaling-stroke"
                  />
                  <line
                    x1="0"
                    y1="-8.5"
                    x2="0"
                    y2="7"
                    stroke={DEFAULT_PALETTE.gray}
                    strokeWidth={STROKE.m}
                    vectorEffect="non-scaling-stroke"
                  />
                  <line
                    x1="-10"
                    y1="-1"
                    x2="10"
                    y2="-1"
                    stroke={DEFAULT_PALETTE.gray}
                    strokeWidth={STROKE.m}
                    vectorEffect="non-scaling-stroke"
                  />
                  <line
                    x1="0"
                    y1="7"
                    x2="-8"
                    y2="21"
                    stroke={DEFAULT_PALETTE.gray}
                    strokeWidth={STROKE.m}
                    vectorEffect="non-scaling-stroke"
                  />
                  <line
                    x1="0"
                    y1="7"
                    x2="8"
                    y2="21"
                    stroke={DEFAULT_PALETTE.gray}
                    strokeWidth={STROKE.m}
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
                <SvgLabel x={345} y={367}>
                  Surveyor
                </SvgLabel>
              </g>

              {/* ═════════════════════════════════════════════════════════════
                  VECTOR CANVAS LAYER: VECTOR ARROWS & FREEHAND
                  ═════════════════════════════════════════════════════════════ */}
              <g
                className={`transition-opacity duration-300 ${
                  showArrows ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                {/* Curved Bézier arrow — blue, width l, filled triangle head */}
                <path
                  d="M 120,290 Q 360,65 660,150"
                  fill="none"
                  stroke={DEFAULT_PALETTE.blue}
                  strokeWidth={STROKE.l}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
                <TriangleHead x={660} y={150} angle={15.8} size={18} color={DEFAULT_PALETTE.blue} />

                {/* Selected arrow: control guide + screen-constant handles */}
                <path
                  d="M 120,290 L 360,65 L 660,150"
                  fill="none"
                  stroke={HANDLE_COLOR}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  vectorEffect="non-scaling-stroke"
                />
                <Handle x={120} y={290} />
                <Handle x={360} y={65} />
                <Handle x={660} y={150} />
                <SvgLabel x={375} y={142}>
                  Transit Corridor
                </SvgLabel>

                {/* Elbow arrow — blue, width m, dashed, open head */}
                <path
                  d="M 180,360 L 290,360 L 290,430"
                  fill="none"
                  stroke={DEFAULT_PALETTE.blue}
                  strokeWidth={STROKE.m}
                  strokeDasharray={DASH.dashed.join(' ')}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
                <OpenHead
                  x={290}
                  y={430}
                  angle={90}
                  size={14}
                  color={DEFAULT_PALETTE.blue}
                  lineWidth={STROKE.m}
                />
                <SvgLabel x={290} y={395}>
                  Elbow · 90°
                </SvgLabel>

                {/* Freehand stroke — green, width m, solid */}
                <path
                  d="M 80,180 C 110,150 140,165 170,145 S 220,160 240,135"
                  fill="none"
                  stroke={DEFAULT_PALETTE.green}
                  strokeWidth={STROKE.m}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </g>

              {/* ═════════════════════════════════════════════════════════════
                  VECTOR CANVAS LAYER: PINNED NOTES & TEXT
                  ═════════════════════════════════════════════════════════════ */}
              <g
                className={`transition-opacity duration-300 ${
                  showNotes ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                {/* Text item — palette-colored text with no background or border */}
                <text
                  x="290"
                  y="320"
                  fill={DEFAULT_PALETTE.blue}
                  fontSize={14}
                  fontWeight={400}
                  fontFamily="var(--font-sans)"
                >
                  Bosphorus Transit Sector · 02
                </text>
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
              <svg
                viewBox="0 0 14 18"
                className="w-3 h-3.5 text-[var(--oh-ink)]"
                aria-hidden="true"
              >
                <path d="M7 0 L11 9 L7 7 L3 9 Z" fill="var(--oh-needle)" />
                <path d="M7 18 L4 10 L7 12 L10 10 Z" fill="currentColor" opacity="0.45" />
              </svg>
              <span className="font-mono text-[10px] font-semibold text-[var(--oh-ink)]">
                N 000°
              </span>
            </div>

            {/* ── Geo-anchored note (actual leaflet-tual note surface) ── */}
            <div
              className="tual-note-card right-3 bottom-16 z-10"
              style={{
                width: 210,
                height: 120,
                backgroundColor: NOTE_SURFACE.bg,
                color: NOTE_SURFACE.text,
                border: `${STROKE.s}px solid ${NOTE_SURFACE.border}`,
                borderRadius: 8,
                opacity: showNotes ? 1 : 0,
                transform: showNotes ? 'translateY(0)' : 'translateY(4px)',
                transition: 'opacity 300ms ease, transform 300ms ease',
                pointerEvents: showNotes ? 'auto' : 'none',
              }}
              aria-hidden={!showNotes}
            >
              <div
                className="tual-note-textarea"
                style={{
                  fontSize: 14,
                  lineHeight: 1.4,
                  color: NOTE_SURFACE.text,
                  cursor: 'default',
                }}
              >
                Pinned notes stay anchored to Leaflet coordinates through pan and zoom.
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

            {/* ── Map info (Bottom-Right) ── */}
            <div className="absolute bottom-9 right-3 z-20 flex flex-col items-end gap-1.5">
              {isInfoOpen && (
                <div
                  role="dialog"
                  aria-label="Map information"
                  className="w-[min(260px,calc(100vw-2rem))] rounded border border-[var(--oh-line)] bg-[var(--oh-plate)]/95 p-2.5 font-mono text-[10px] leading-relaxed text-[var(--oh-ink-2)] shadow-lg backdrop-blur-sm"
                >
                  <div className="mb-1.5 flex items-start justify-between gap-2">
                    <span className="font-bold uppercase tracking-wider text-[var(--oh-ink)]">
                      Map information
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsInfoOpen(false)}
                      className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded text-[var(--oh-ink-3)] hover:bg-[var(--oh-plate)] hover:text-[var(--oh-ink)]"
                      title="Close map information"
                      aria-label="Close map information"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                  <p>Basemap: Carto</p>
                  <p>
                    ©{' '}
                    <a
                      href="https://leafletjs.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--oh-lime)] underline underline-offset-2"
                    >
                      Leaflet
                    </a>{' '}
                    · © Carto Basemap
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsInfoOpen((open) => !open)}
                className="inline-flex h-6 w-6 items-center justify-center rounded border border-[var(--oh-line)] bg-[var(--oh-plate)]/90 text-[var(--oh-ink-3)] shadow-sm backdrop-blur-sm transition-colors hover:border-[var(--oh-ink-3)] hover:text-[var(--oh-ink)]"
                title="Map information"
                aria-label="Map information"
                aria-expanded={isInfoOpen}
              >
                <Info className="h-3 w-3" />
              </button>
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
