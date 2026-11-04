import { describe, it, expect, vi } from 'vitest'
import {
  renderArrowOnCanvas,
  renderFreedrawOnCanvas,
  renderItemOnCanvas,
  renderShapeOnCanvas,
  renderPenOnCanvas,
  renderRulerOnCanvas,
  renderAreaOnCanvas,
} from '../index.js'
import type L from 'leaflet'

function createMockCtx(): CanvasRenderingContext2D {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    rect: vi.fn(),
    roundRect: vi.fn(),
    ellipse: vi.fn(),
    arc: vi.fn(),
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    setLineDash: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 40 })),
    translate: vi.fn(),
    rotate: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D
}

function createMockMap(): L.Map {
  return {
    latLngToContainerPoint: vi.fn(([lat, lng]) => ({
      x: (lng - 28) * 1000,
      y: (42 - lat) * 1000,
    })),
    containerPointToLatLng: vi.fn(([x, y]) => ({
      lat: 42 - y / 1000,
      lng: 28 + x / 1000,
    })),
    getZoom: vi.fn(() => 13),
  } as unknown as L.Map
}

describe('v2 Canvas annotation rendering', () => {
  it('renders arrow paths and heads without throwing', () => {
    const ctx = createMockCtx()
    const map = createMockMap()
    renderArrowOnCanvas(
      ctx,
      map,
      {
        id: 'arrow-1',
        type: 'arrow',
        kind: 'curved',
        from: { lat: 41, lng: 28 },
        to: { lat: 41.5, lng: 28.5 },
        style: { color: '#2F6FEB', width: 'm' },
        createdAt: Date.now(),
      },
      { isSelected: true },
    )
    expect(ctx.beginPath).toHaveBeenCalled()
    expect(ctx.stroke).toHaveBeenCalled()
    // Curved selection draws a dashed guide through the control point.
    expect(ctx.setLineDash).toHaveBeenCalledWith([4, 4])
  })

  it('renders linear, elbow, and s-curve arrows with heads', () => {
    const map = createMockMap()

    // Linear with bi-directional heads
    const linearCtx = createMockCtx()
    renderArrowOnCanvas(linearCtx, map, {
      id: 'arrow-linear',
      type: 'arrow',
      kind: 'linear',
      from: { lat: 41, lng: 28 },
      to: { lat: 41.2, lng: 28.2 },
      heads: { start: 'triangle', end: 'triangle' },
      createdAt: Date.now(),
    })
    expect(linearCtx.fill).toHaveBeenCalled()
    expect(linearCtx.stroke).toHaveBeenCalled()

    // Elbow arrow
    const elbowCtx = createMockCtx()
    renderArrowOnCanvas(elbowCtx, map, {
      id: 'arrow-elbow',
      type: 'arrow',
      kind: 'elbow',
      from: { lat: 41, lng: 28 },
      to: { lat: 41.2, lng: 28.2 },
      heads: { end: 'triangle' },
      createdAt: Date.now(),
    })
    expect(elbowCtx.stroke).toHaveBeenCalled()
    expect(elbowCtx.fill).toHaveBeenCalled()

    // S-curve arrow
    const scurveCtx = createMockCtx()
    renderArrowOnCanvas(scurveCtx, map, {
      id: 'arrow-scurve',
      type: 'arrow',
      kind: 's-curve',
      from: { lat: 41, lng: 28 },
      to: { lat: 41.2, lng: 28.2 },
      heads: { end: 'open' },
      createdAt: Date.now(),
    })
    expect(scurveCtx.stroke).toHaveBeenCalled()
  })

  it('renders geometric shapes with fill and stroke', () => {
    const ctx = createMockCtx()
    const map = createMockMap()
    renderShapeOnCanvas(ctx, map, {
      id: 'shape-1',
      type: 'shape',
      kind: 'star',
      at: { lat: 41.1, lng: 28.1 },
      width: 200,
      height: 200,
      style: { color: '#E5484D' },
      createdAt: Date.now(),
    })
    expect(ctx.fill).toHaveBeenCalled()
    expect(ctx.stroke).toHaveBeenCalled()
  })

  it('keeps the border opaque so translucent fill cannot bleed through it', () => {
    const ctx = createMockCtx()
    const map = createMockMap()
    let currentAlpha = 1
    const fillAlphas: number[] = []
    const strokeAlphas: number[] = []

    Object.defineProperty(ctx, 'globalAlpha', {
      get: () => currentAlpha,
      set: (value: number) => {
        currentAlpha = value
      },
      configurable: true,
    })
    ctx.fill = vi.fn(() => {
      fillAlphas.push(currentAlpha)
    })
    ctx.stroke = vi.fn(() => {
      strokeAlphas.push(currentAlpha)
    })

    renderShapeOnCanvas(ctx, map, {
      id: 'translucent-shape',
      type: 'shape',
      kind: 'circle',
      at: { lat: 41.1, lng: 28.1 },
      width: 200,
      height: 200,
      style: { color: '#E5484D', opacity: 0.25 },
      createdAt: Date.now(),
    })

    expect(fillAlphas).toEqual([0.25])
    expect(strokeAlphas).toEqual([1])
  })

  it('skips the shape fill when fillColor is transparent', () => {
    const ctx = createMockCtx()
    const map = createMockMap()
    renderShapeOnCanvas(ctx, map, {
      id: 'shape-no-fill',
      type: 'shape',
      kind: 'square',
      at: { lat: 41.1, lng: 28.1 },
      width: 100,
      height: 100,
      style: { color: '#E5484D', fillColor: 'transparent' },
      createdAt: Date.now(),
    })

    expect(ctx.fill).not.toHaveBeenCalled()
    expect(ctx.stroke).toHaveBeenCalled()
  })

  it('draws a dashed selection frame between the resize handles', () => {
    const ctx = createMockCtx()
    const map = createMockMap()
    renderShapeOnCanvas(
      ctx,
      map,
      {
        id: 'shape-selected',
        type: 'shape',
        kind: 'square',
        at: { lat: 41.2, lng: 28.2 },
        width: 400,
        height: 400,
        createdAt: Date.now(),
      },
      { isSelected: true },
    )

    expect(ctx.setLineDash).toHaveBeenCalledWith([4, 4])
    expect(ctx.strokeRect).toHaveBeenCalled()
  })

  it('draws top and bottom shape labels outside the shape', () => {
    const map = createMockMap()
    const shape = {
      id: 'shape-2',
      type: 'shape' as const,
      kind: 'square' as const,
      at: { lat: 41.1, lng: 28.1 },
      width: 200,
      height: 200,
      label: 'Outside label',
      style: { color: '#2F6FEB' as const },
      createdAt: Date.now(),
    }

    const topCtx = createMockCtx()
    renderShapeOnCanvas(topCtx, map, { ...shape, labelPosition: 'top' })
    let [text, x, y] = (topCtx.fillText as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(text).toBe('Outside label')
    expect(x).toBeCloseTo(100)
    expect(y).toBeCloseTo(789) // top edge 800 - (pill height / 2 + gap)

    const bottomCtx = createMockCtx()
    renderShapeOnCanvas(bottomCtx, map, { ...shape, labelPosition: 'bottom' })
    ;[text, x, y] = (bottomCtx.fillText as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(text).toBe('Outside label')
    expect(x).toBeCloseTo(100)
    expect(y).toBeCloseTo(1011) // bottom edge 1000 + (pill height / 2 + gap)
  })

  it('never makes label container dashed even when shape stroke is dashed', () => {
    const map = createMockMap()
    const ctx = createMockCtx()
    renderShapeOnCanvas(ctx, map, {
      id: 'dashed-shape',
      type: 'shape',
      kind: 'square',
      at: { lat: 41.1, lng: 28.1 },
      width: 200,
      height: 200,
      label: 'Solid Label',
      style: { color: '#2F6FEB', dash: 'dashed' },
      createdAt: Date.now(),
    })

    // The shape stroke sets a dashed pattern
    expect(ctx.setLineDash).toHaveBeenCalledWith([6, 6])
    // But drawLabelPill resets lineDash to solid [] so the pill border is never dashed
    expect(ctx.setLineDash).toHaveBeenCalledWith([])
  })

  it('never applies shape opacity to label pill', () => {
    const map = createMockMap()
    const alphaValues: number[] = []
    const ctx = createMockCtx()
    // Track globalAlpha assignments
    let currentAlpha = 1
    Object.defineProperty(ctx, 'globalAlpha', {
      get: () => currentAlpha,
      set: (val: number) => {
        currentAlpha = val
        alphaValues.push(val)
      },
      configurable: true,
    })

    renderShapeOnCanvas(ctx, map, {
      id: 'opacity-shape',
      type: 'shape',
      kind: 'circle',
      at: { lat: 41.1, lng: 28.1 },
      width: 200,
      height: 200,
      label: 'Opaque Label',
      style: { color: '#2F6FEB', opacity: 0.25 },
      createdAt: Date.now(),
    })

    // The shape itself sets globalAlpha to 0.25
    expect(alphaValues).toContain(0.25)
    // But drawLabelPill sets globalAlpha to 1 so the label is never transparent
    expect(alphaValues[alphaValues.length - 1]).toBe(1)
  })

  it('sets matching font attributes and font family on label pill', () => {
    const map = createMockMap()
    let assignedFont = ''
    const ctx = createMockCtx()
    Object.defineProperty(ctx, 'font', {
      get: () => assignedFont,
      set: (val: string) => {
        assignedFont = val
      },
      configurable: true,
    })

    renderShapeOnCanvas(
      ctx,
      map,
      {
        id: 'font-shape',
        type: 'shape',
        kind: 'square',
        at: { lat: 41.1, lng: 28.1 },
        width: 100,
        height: 100,
        label: 'Font Test',
        style: { fontSize: 16, weight: 'bold', fontStyle: 'italic' },
        createdAt: Date.now(),
      },
      { fontFamily: 'CustomSans, sans-serif' },
    )

    expect(assignedFont).toBe('italic 700 16px CustomSans, sans-serif')
  })

  it('renders freehand (freedraw) drawings', () => {
    const ctx = createMockCtx()
    const map = createMockMap()
    renderFreedrawOnCanvas(ctx, map, {
      id: 'freedraw-1',
      type: 'freedraw',
      points: [
        { lat: 41, lng: 28 },
        { lat: 41.1, lng: 28.1 },
        { lat: 41.2, lng: 28.2 },
      ],
      style: { color: '#30A46C', width: 'l' },
      createdAt: Date.now(),
    })
    expect(ctx.stroke).toHaveBeenCalled()
    expect(ctx.quadraticCurveTo).toHaveBeenCalled()
  })

  it('renders bezier pen paths with straights, curves and closure', () => {
    const ctx = createMockCtx()
    const map = createMockMap()
    renderPenOnCanvas(
      ctx,
      map,
      {
        id: 'pen-1',
        type: 'pen',
        points: [
          { at: { lat: 41, lng: 28 } },
          {
            at: { lat: 41.2, lng: 28.2 },
            in: { lat: 41.1, lng: 28.05 },
            out: { lat: 41.3, lng: 28.25 },
          },
        ],
        style: { color: '#2F6FEB', width: 'm' },
        createdAt: Date.now(),
      },
      { isSelected: true },
    )
    expect(ctx.bezierCurveTo).toHaveBeenCalled()
    expect(ctx.stroke).toHaveBeenCalled()
  })

  it('renders distance ruler with end ticks and distance pill', () => {
    const ctx = createMockCtx()
    const map = createMockMap()
    renderRulerOnCanvas(ctx, map, {
      id: 'ruler-1',
      type: 'ruler',
      from: { lat: 41, lng: 28 },
      to: { lat: 41.5, lng: 28.5 },
      unit: 'metric',
      style: { color: '#1D1D1B' },
      createdAt: Date.now(),
    })
    expect(ctx.stroke).toHaveBeenCalled()
    expect(ctx.fillText).toHaveBeenCalled()
  })

  it('renders area polygon measurement with fill, dashed outline, and area badge', () => {
    const ctx = createMockCtx()
    const map = createMockMap()
    renderAreaOnCanvas(ctx, map, {
      id: 'area-1',
      type: 'area',
      points: [
        { lat: 41, lng: 28 },
        { lat: 41.01, lng: 28 },
        { lat: 41.01, lng: 28.01 },
        { lat: 41, lng: 28.01 },
      ],
      unit: 'metric',
      style: { color: '#1D1D1B' },
      createdAt: Date.now(),
    })
    expect(ctx.stroke).toHaveBeenCalled()
    expect(ctx.fill).toHaveBeenCalled()
    expect(ctx.fillText).toHaveBeenCalled()
  })

  it('dispatches items via renderItemOnCanvas with opinionated ink color', () => {
    const ctx = createMockCtx()
    const map = createMockMap()
    renderItemOnCanvas(ctx, map, {
      id: 'shape-1',
      type: 'shape',
      kind: 'square',
      at: { lat: 41, lng: 28 },
      width: 100,
      height: 100,
      style: { color: '#1D1D1B' },
      createdAt: Date.now(),
    })
    expect(ctx.strokeStyle).toBe('#1D1D1B')
  })
})
