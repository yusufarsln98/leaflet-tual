import { describe, it, expect, vi } from 'vitest'
import {
  renderArrowOnCanvas,
  renderFreedrawOnCanvas,
  renderShapeOnCanvas,
  renderPenOnCanvas,
  renderRulerOnCanvas,
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
        style: { color: 'blue', width: 'm' },
        createdAt: Date.now(),
      },
      'light',
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
    renderArrowOnCanvas(
      linearCtx,
      map,
      {
        id: 'arrow-linear',
        type: 'arrow',
        kind: 'linear',
        from: { lat: 41, lng: 28 },
        to: { lat: 41.2, lng: 28.2 },
        heads: { start: 'triangle', end: 'triangle' },
        createdAt: Date.now(),
      },
      'light',
    )
    expect(linearCtx.fill).toHaveBeenCalled()
    expect(linearCtx.stroke).toHaveBeenCalled()

    // Elbow arrow
    const elbowCtx = createMockCtx()
    renderArrowOnCanvas(
      elbowCtx,
      map,
      {
        id: 'arrow-elbow',
        type: 'arrow',
        kind: 'elbow',
        from: { lat: 41, lng: 28 },
        to: { lat: 41.2, lng: 28.2 },
        heads: { end: 'triangle' },
        createdAt: Date.now(),
      },
      'light',
    )
    expect(elbowCtx.stroke).toHaveBeenCalled()
    expect(elbowCtx.fill).toHaveBeenCalled()

    // S-curve arrow
    const scurveCtx = createMockCtx()
    renderArrowOnCanvas(
      scurveCtx,
      map,
      {
        id: 'arrow-scurve',
        type: 'arrow',
        kind: 's-curve',
        from: { lat: 41, lng: 28 },
        to: { lat: 41.2, lng: 28.2 },
        heads: { end: 'open' },
        createdAt: Date.now(),
      },
      'light',
    )
    expect(scurveCtx.stroke).toHaveBeenCalled()
  })

  it('renders geometric shapes with fill and stroke', () => {
    const ctx = createMockCtx()
    const map = createMockMap()
    renderShapeOnCanvas(
      ctx,
      map,
      {
        id: 'shape-1',
        type: 'shape',
        kind: 'star',
        at: { lat: 41.1, lng: 28.1 },
        width: 200,
        height: 200,
        style: { color: 'red', fill: 'solid' },
        createdAt: Date.now(),
      },
      'light',
    )
    expect(ctx.fill).toHaveBeenCalled()
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
      'light',
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
      style: { color: 'blue' as const, fill: 'solid' as const },
      createdAt: Date.now(),
    }

    const topCtx = createMockCtx()
    renderShapeOnCanvas(topCtx, map, { ...shape, labelPosition: 'top' }, 'light')
    let [text, x, y] = (topCtx.fillText as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(text).toBe('Outside label')
    expect(x).toBeCloseTo(100)
    expect(y).toBeCloseTo(789) // top edge 800 - (pill height / 2 + gap)

    const bottomCtx = createMockCtx()
    renderShapeOnCanvas(bottomCtx, map, { ...shape, labelPosition: 'bottom' }, 'light')
    ;[text, x, y] = (bottomCtx.fillText as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(text).toBe('Outside label')
    expect(x).toBeCloseTo(100)
    expect(y).toBeCloseTo(1011) // bottom edge 1000 + (pill height / 2 + gap)
  })

  it('renders freehand (freedraw) drawings', () => {
    const ctx = createMockCtx()
    const map = createMockMap()
    renderFreedrawOnCanvas(
      ctx,
      map,
      {
        id: 'freedraw-1',
        type: 'freedraw',
        points: [
          { lat: 41, lng: 28 },
          { lat: 41.1, lng: 28.1 },
          { lat: 41.2, lng: 28.2 },
        ],
        style: { color: 'green', width: 'l' },
        createdAt: Date.now(),
      },
      'light',
    )
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
        style: { color: 'blue', width: 'm' },
        createdAt: Date.now(),
      },
      'light',
      { isSelected: true },
    )
    expect(ctx.bezierCurveTo).toHaveBeenCalled()
    expect(ctx.stroke).toHaveBeenCalled()
  })

  it('renders distance ruler with end ticks and distance pill', () => {
    const ctx = createMockCtx()
    const map = createMockMap()
    renderRulerOnCanvas(
      ctx,
      map,
      {
        id: 'ruler-1',
        type: 'ruler',
        from: { lat: 41, lng: 28 },
        to: { lat: 41.5, lng: 28.5 },
        unit: 'metric',
        style: { color: 'ink' },
        createdAt: Date.now(),
      },
      'light',
    )
    expect(ctx.stroke).toHaveBeenCalled()
    expect(ctx.fillText).toHaveBeenCalled()
  })

  it('always uses light theme colors for shapes and items even when scheme is dark', () => {
    const ctxLight = createMockCtx()
    const ctxDark = createMockCtx()
    const map = createMockMap()
    const shapeItem = {
      id: 'shape-1',
      type: 'shape' as const,
      kind: 'square' as const,
      at: { lat: 41, lng: 28 },
      width: 100,
      height: 100,
      style: { color: 'ink' as const, fill: 'solid' as const },
      createdAt: Date.now(),
    }

    renderShapeOnCanvas(ctxLight, map, shapeItem, 'light')
    renderShapeOnCanvas(ctxDark, map, shapeItem, 'dark')

    // Both light and dark scheme calls render the shape with light ink color (#1D1D1B)
    expect(ctxLight.strokeStyle).toBe('#1D1D1B')
    expect(ctxDark.strokeStyle).toBe('#1D1D1B')
  })
})
