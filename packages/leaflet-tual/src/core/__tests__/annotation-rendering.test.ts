import { describe, it, expect, vi } from 'vitest'
import {
  renderShapeOnCanvas,
  renderArrowOnCanvas,
  renderRulerOnCanvas,
  hitTestRuler,
  hitTestRulerHandle,
  type TualAnnotationTheme,
  type ArrowItem,
  type RulerItem,
  type ShapeItem,
} from '../index.js'
import { createMockCanvasContext } from './test-utils.js'

describe('unified canvas annotation theme (shapes, arrows, tooltips)', () => {
  it('applies unified TualAnnotationTheme to shape labels/tooltips and handles', () => {
    const mockCtx = createMockCanvasContext()

    const shape: ShapeItem = {
      id: 'test-shp-1',
      type: 'shape',
      shape: 'square',
      start: { lat: 10, lng: 10 },
      end: { lat: 20, lng: 20 },
      color: '#ff0000',
      strokeWidth: 2,
      label: 'Custom Shape Tooltip',
      createdAt: 0,
    }

    const projected = {
      start: { x: 10, y: 10 },
      end: { x: 100, y: 100 },
      minX: 10,
      minY: 10,
      maxX: 100,
      maxY: 100,
      width: 90,
      height: 90,
      cx: 55,
      cy: 55,
    }

    const customTheme: TualAnnotationTheme = {
      labelBackgroundColor: '#fef08a',
      labelTextColor: '#713f12',
      labelBorderColor: '#ca8a04',
      labelBorderRadius: 4,
      labelBorderWidth: 2,
      handleRadius: 8,
      endpointHandleColor: '#10b981',
    }

    renderShapeOnCanvas(mockCtx, projected, shape, {
      isSelected: true,
      theme: customTheme,
    })

    expect(mockCtx.roundRect).toHaveBeenCalled()
    expect(mockCtx.fillText).toHaveBeenCalledWith('Custom Shape Tooltip', 55, 55)
  })

  it('applies unified TualAnnotationTheme to arrow labels/tooltips and handles', () => {
    const mockCtx = createMockCanvasContext()

    const arrow: ArrowItem = {
      id: 'test-arr-1',
      type: 'arrow',
      arrowStyle: 'linear',
      start: { lat: 0, lng: 0 },
      end: { lat: 10, lng: 10 },
      color: '#2563eb',
      strokeWidth: 3,
      label: 'Direction Vector',
      createdAt: 0,
    }

    const projected = {
      start: { x: 0, y: 0 },
      end: { x: 100, y: 100 },
      control: { x: 50, y: 50 },
    }

    const customTheme: TualAnnotationTheme = {
      labelBackgroundColor: '#ffffff',
      labelTextColor: '#000000',
      labelBorderRadius: 2,
      labelBorderWidth: 1,
    }

    renderArrowOnCanvas(mockCtx, projected, arrow, {
      isSelected: true,
      theme: customTheme,
    })

    expect(mockCtx.roundRect).toHaveBeenCalled()
    expect(mockCtx.fillText).toHaveBeenCalledWith('Direction Vector', 50, 50)
  })

  it('renders geometric square with rect (0px radius) by default and supports shapeBorderRadius', () => {
    const mockCtxDefault = createMockCanvasContext()

    const shape: ShapeItem = {
      id: 'test-square-default',
      type: 'shape',
      shape: 'square',
      start: { lat: 0, lng: 0 },
      end: { lat: 10, lng: 10 },
      color: '#000000',
      strokeWidth: 2,
      createdAt: 0,
    }

    const projected = {
      start: { x: 10, y: 10 },
      end: { x: 100, y: 100 },
      minX: 10,
      minY: 10,
      maxX: 100,
      maxY: 100,
      width: 90,
      height: 90,
      cx: 55,
      cy: 55,
    }

    // Default rendering (no custom theme) -> must use crisp geometric rect (0 border radius)
    renderShapeOnCanvas(mockCtxDefault, projected, shape)
    expect(mockCtxDefault.rect).toHaveBeenCalledWith(10, 10, 90, 90)
    expect(mockCtxDefault.roundRect).not.toHaveBeenCalled()

    // When custom shapeBorderRadius is provided in theme -> uses roundRect
    const mockCtxCustom = {
      ...mockCtxDefault,
      rect: vi.fn(),
      roundRect: vi.fn(),
    } as unknown as CanvasRenderingContext2D

    renderShapeOnCanvas(mockCtxCustom, projected, shape, {
      theme: { shapeBorderRadius: 8 },
    })
    expect(mockCtxCustom.roundRect).toHaveBeenCalledWith(10, 10, 90, 90, 8)
  })

  it('renders marker shape with outer contour and inner circle', () => {
    const ellipse = vi.fn()
    const mockCtxMarker = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      bezierCurveTo: vi.fn(),
      ellipse,
      fill: vi.fn(),
      stroke: vi.fn(),
      setLineDash: vi.fn(),
    } as unknown as CanvasRenderingContext2D

    const projected = {
      start: { x: 20, y: 10 },
      end: { x: 80, y: 110 },
      minX: 20,
      minY: 10,
      maxX: 80,
      maxY: 110,
      width: 60,
      height: 100,
      cx: 50,
      cy: 60,
    }

    const markerShape: ShapeItem = {
      id: 'marker-1',
      type: 'shape',
      shape: 'marker',
      start: { lat: 40, lng: -74 },
      end: { lat: 40.1, lng: -73.9 },
      color: '#ef4444',
      strokeWidth: 2,
      createdAt: 0,
    }

    renderShapeOnCanvas(mockCtxMarker, projected, markerShape)
    // Expect 2 ellipse calls: 1 for the outer bulb arc and 1 for the inner circle
    expect(ellipse).toHaveBeenCalledTimes(2)
    // Call 1: outer bulb (Math.PI to 0)
    expect(ellipse).toHaveBeenNthCalledWith(
      1,
      50, // cx
      46, // headCy = 10 + 100 * 0.36 = 46
      30, // rx = 60 / 2
      36, // ry = 100 * 0.36
      0,
      Math.PI,
      0,
      false,
    )
    // Call 2: inner circle (counterclockwise full circle)
    expect(ellipse).toHaveBeenNthCalledWith(
      2,
      50,
      46,
      10.5, // innerRx = 30 * 0.35
      12.6, // innerRy = 36 * 0.35
      0,
      Math.PI * 2,
      0,
      true,
    )
  })

  it('renders actor shape with stroke and supports fill when filled is true', () => {
    const mockCtx = createMockCanvasContext()

    const projected = {
      start: { x: 20, y: 10 },
      end: { x: 80, y: 110 },
      minX: 20,
      minY: 10,
      maxX: 80,
      maxY: 110,
      width: 60,
      height: 100,
      cx: 50,
      cy: 60,
    }

    const actorShapeUnfilled: ShapeItem = {
      id: 'actor-unfilled',
      type: 'shape',
      shape: 'actor',
      start: { lat: 40, lng: -74 },
      end: { lat: 40.1, lng: -73.9 },
      color: '#06b6d4',
      strokeWidth: 2,
      filled: false,
      createdAt: 0,
    }

    renderShapeOnCanvas(mockCtx, projected, actorShapeUnfilled)
    expect(mockCtx.arc).toHaveBeenCalled()
    expect(mockCtx.closePath).toHaveBeenCalled()
    expect(mockCtx.fill).not.toHaveBeenCalled()
    expect(mockCtx.stroke).toHaveBeenCalled()

    const mockCtxFilled = createMockCanvasContext()
    const actorShapeFilled: ShapeItem = {
      id: 'actor-filled',
      type: 'shape',
      shape: 'actor',
      start: { lat: 40, lng: -74 },
      end: { lat: 40.1, lng: -73.9 },
      color: '#06b6d4',
      fillColor: 'rgba(6, 182, 212, 0.3)',
      filled: true,
      strokeWidth: 2,
      createdAt: 0,
    }

    renderShapeOnCanvas(mockCtxFilled, projected, actorShapeFilled)
    expect(mockCtxFilled.arc).toHaveBeenCalled()
    expect(mockCtxFilled.closePath).toHaveBeenCalled()
    expect(mockCtxFilled.fill).toHaveBeenCalled()
    expect(mockCtxFilled.fillStyle).toBe('rgba(6, 182, 212, 0.3)')
    expect(mockCtxFilled.stroke).toHaveBeenCalled()
  })

  it('hides shape and arrow labels when screen size is below labelMinShapeSize at low zoom', () => {
    const fillText = vi.fn()
    const mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      rect: vi.fn(),
      roundRect: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      measureText: vi.fn((text: string) => ({ width: text.length * 8 })),
      fillText,
      setLineDash: vi.fn(),
    } as unknown as CanvasRenderingContext2D

    const smallProjectedShape = {
      start: { x: 10, y: 10 },
      end: { x: 22, y: 22 },
      minX: 10,
      minY: 10,
      maxX: 22,
      maxY: 22,
      width: 12,
      height: 12,
      cx: 16,
      cy: 16,
    }

    const shape: ShapeItem = {
      id: 'small-shape',
      type: 'shape',
      shape: 'square',
      start: { lat: 0, lng: 0 },
      end: { lat: 1, lng: 1 },
      color: '#ff0000',
      strokeWidth: 2,
      label: 'Tiny Building',
      createdAt: 0,
    }

    // Default labelMinShapeSize is 18 -> shape with width 12 must NOT render label
    renderShapeOnCanvas(mockCtx, smallProjectedShape, shape)
    expect(fillText).not.toHaveBeenCalled()

    // When arrow distance is below min size -> must NOT render label
    const smallProjectedArrow = {
      start: { x: 0, y: 0 },
      end: { x: 15, y: 0 },
      control: { x: 7.5, y: 0 },
    }
    const arrow: ArrowItem = {
      id: 'small-arrow',
      type: 'arrow',
      arrowStyle: 'linear',
      start: { lat: 0, lng: 0 },
      end: { lat: 0.1, lng: 0.1 },
      color: '#0000ff',
      strokeWidth: 2,
      label: 'Small Corridor',
      createdAt: 0,
    }
    renderArrowOnCanvas(mockCtx, smallProjectedArrow, arrow)
    expect(fillText).not.toHaveBeenCalled()
  })

  it('truncates shape labels when text exceeds shape screen width', () => {
    const fillText = vi.fn()
    const mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      rect: vi.fn(),
      roundRect: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      measureText: vi.fn((text: string) => ({ width: text.length * 8 })),
      fillText,
      setLineDash: vi.fn(),
    } as unknown as CanvasRenderingContext2D

    const projectedShape = {
      start: { x: 10, y: 10 },
      end: { x: 60, y: 60 },
      minX: 10,
      minY: 10,
      maxX: 60,
      maxY: 60,
      width: 50,
      height: 50,
      cx: 35,
      cy: 35,
    }

    const shape: ShapeItem = {
      id: 'shape-long-label',
      type: 'shape',
      shape: 'square',
      start: { lat: 0, lng: 0 },
      end: { lat: 5, lng: 5 },
      color: '#000000',
      strokeWidth: 2,
      label: 'Super Long Facility Compound Name Across Map',
      createdAt: 0,
    }

    renderShapeOnCanvas(mockCtx, projectedShape, shape)
    expect(fillText).toHaveBeenCalled()
    const renderedText = fillText.mock.calls[0][0] as string
    expect(renderedText).toContain('…')
    expect(renderedText.length).toBeLessThan(shape.label!.length)
  })

  it('renders ruler with automatic real world distance badge and crossbar caps', () => {
    const mockCtx = createMockCanvasContext()

    const ruler: RulerItem = {
      id: 'ruler-1',
      type: 'ruler',
      start: { lat: 40.0, lng: -74.0 },
      end: { lat: 40.0, lng: -73.9 },
      color: '#2563eb',
      strokeWidth: 2,
      createdAt: 0,
    }

    const projected = {
      start: { x: 50, y: 100 },
      end: { x: 250, y: 100 },
      mid: { x: 150, y: 100 },
      lengthPx: 200,
      angle: 0,
    }

    renderRulerOnCanvas(mockCtx, projected, ruler, { isSelected: true })

    // Distance label pill drawn
    expect(mockCtx.fillText).toHaveBeenCalled()
    const renderedLabel = (mockCtx.fillText as any).mock.calls[0][0] as string
    expect(renderedLabel).toMatch(/km|m/)

    // Hit testing
    expect(hitTestRuler({ x: 150, y: 100 }, projected, ruler)).toBe(true)
    expect(hitTestRuler({ x: 150, y: 130 }, projected, ruler)).toBe(false)
    expect(hitTestRulerHandle({ x: 52, y: 100 }, projected)).toBe('start')
    expect(hitTestRulerHandle({ x: 249, y: 101 }, projected)).toBe('end')
    expect(hitTestRulerHandle({ x: 150, y: 100 }, projected)).toBeNull()
  })
})
