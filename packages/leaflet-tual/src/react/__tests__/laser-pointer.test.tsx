import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, renderHook, act } from '@testing-library/react'
import {
  LaserPointer,
  Laser,
  useLaserPointer,
  renderLaserOnCanvas,
  LASER_LIFETIME_MS,
  useLeafletTual,
  emptyDoc,
  LeafletTual,
} from '../../react.js'
import { createMockMap } from './test-utils.js'

describe('Laser Pointer presentation component', () => {
  let mockMap: ReturnType<typeof createMockMap>

  beforeEach(() => {
    mockMap = createMockMap()
  })

  it('renders LaserPointer and Laser canvas with correct className and data-active state', () => {
    const { container: c1, rerender: r1 } = render(<LaserPointer map={mockMap} active={false} />)
    const canvas1 = c1.querySelector('canvas.tual-laser-canvas') as HTMLCanvasElement
    expect(canvas1).not.toBeNull()
    expect(canvas1.getAttribute('data-active')).toBe('false')
    expect(canvas1.style.pointerEvents).toBe('none')

    r1(<LaserPointer map={mockMap} active={true} />)
    expect(canvas1.getAttribute('data-active')).toBe('true')
    expect(canvas1.style.pointerEvents).toBe('auto')
    expect(canvas1.style.cursor).toBe('none')

    // Test alias Laser
    const { container: c2 } = render(<Laser map={mockMap} active={true} />)
    const canvas2 = c2.querySelector('canvas.tual-laser-canvas') as HTMLCanvasElement
    expect(canvas2).not.toBeNull()
    expect(canvas2.getAttribute('data-active')).toBe('true')
  })

  it('tracks active state dynamically from controller.tool', () => {
    const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))
    const { container } = render(<LaserPointer map={mockMap} controller={result.current} />)
    const canvas = container.querySelector('canvas.tual-laser-canvas') as HTMLCanvasElement

    expect(canvas.getAttribute('data-active')).toBe('false')

    act(() => {
      result.current.setTool('laser')
    })
    expect(canvas.getAttribute('data-active')).toBe('true')

    act(() => {
      result.current.setTool('select')
    })
    expect(canvas.getAttribute('data-active')).toBe('false')
  })

  it('disables map dragging and captures pointer gestures when active', () => {
    const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))
    act(() => {
      result.current.setTool('laser')
    })

    const onPointerDown = vi.fn()
    const onPointerMove = vi.fn()
    const onPointerUp = vi.fn()

    const { container } = render(
      <LaserPointer
        map={mockMap}
        controller={result.current}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />,
    )
    const canvas = container.querySelector('canvas.tual-laser-canvas') as HTMLCanvasElement

    fireEvent.pointerDown(canvas, { clientX: 100, clientY: 100, button: 0 })
    expect(onPointerDown).toHaveBeenCalledTimes(1)
    expect(mockMap.dragging?.disable).toHaveBeenCalled()

    fireEvent.pointerMove(canvas, { clientX: 120, clientY: 130 })
    expect(onPointerMove).toHaveBeenCalledTimes(1)

    fireEvent.pointerUp(canvas, { clientX: 120, clientY: 130 })
    expect(onPointerUp).toHaveBeenCalledTimes(1)
    expect(mockMap.dragging?.enable).toHaveBeenCalled()
  })

  it('allows wheel zoom and middle-click pan while laser tool is active', () => {
    const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))
    act(() => {
      result.current.setTool('laser')
    })

    const onWheel = vi.fn()
    const { container } = render(
      <div onWheel={onWheel}>
        <LaserPointer map={mockMap} controller={result.current} />
      </div>,
    )
    const canvas = container.querySelector('canvas.tual-laser-canvas') as HTMLCanvasElement

    // 1. Wheel events bubble to parent container (enabling scroll zoom)
    fireEvent.wheel(canvas, { deltaY: 100 })
    expect(onWheel).toHaveBeenCalledTimes(1)

    // 2. Middle-click (mouse wheel button: 1) does not disable map dragging or capture laser
    const onPointerDown = vi.fn()
    const { container: c2 } = render(
      <LaserPointer map={mockMap} controller={result.current} onPointerDown={onPointerDown} />,
    )
    const canvas2 = c2.querySelector('canvas.tual-laser-canvas') as HTMLCanvasElement
    vi.mocked(mockMap.dragging!.disable).mockClear()

    fireEvent.pointerDown(canvas2, { clientX: 100, clientY: 100, button: 1 })
    expect(onPointerDown).not.toHaveBeenCalled()
    expect(mockMap.dragging?.disable).not.toHaveBeenCalled()
  })

  it('allows panning with mouse wheel drag (middle-click) in LeafletTual when laser tool is active', () => {
    let currentTool = 'select'
    const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))
    const { container } = render(<LeafletTual map={mockMap} controller={result.current} />)

    act(() => {
      result.current.setTool('laser')
      currentTool = 'laser'
    })
    expect(currentTool).toBe('laser')

    const laserCanvas = container.querySelector('canvas.tual-laser-canvas') as HTMLCanvasElement
    expect(laserCanvas).not.toBeNull()

    // Middle-click (button: 1) drag on laser canvas
    fireEvent.mouseDown(laserCanvas, { clientX: 100, clientY: 100, button: 1 })
    fireEvent.mouseMove(window, { clientX: 160, clientY: 140 })
    fireEvent.mouseUp(window, { clientX: 160, clientY: 140, button: 1 })

    // Map panBy was invoked with the inverse delta
    expect(mockMap.panBy).toHaveBeenCalledWith([-60, -40], { animate: false })
  })

  it('hook useLaserPointer manages trail, lifetime and decay correctly', () => {
    const redraw = vi.fn()
    const { result } = renderHook(() =>
      useLaserPointer({
        active: true,
        color: 'red',
        duration: 500,
        redraw,
      }),
    )

    act(() => {
      result.current.handleLaserPointerDown({ x: 50, y: 50 })
    })

    const state1 = result.current.getLaserState()
    expect(state1.active).toBe(true)
    expect(state1.pointerPos).toEqual({ x: 50, y: 50 })
    expect(state1.trail.length).toBe(1)

    act(() => {
      result.current.handleLaserPointerMove({ x: 80, y: 90 })
    })

    const state2 = result.current.getLaserState()
    expect(state2.pointerPos).toEqual({ x: 80, y: 90 })
    expect(state2.trail.length).toBe(2)

    act(() => {
      result.current.handleLaserPointerUp()
    })

    // Clear laser resets everything
    act(() => {
      result.current.clearLaser()
    })
    const stateCleared = result.current.getLaserState()
    expect(stateCleared.trail.length).toBe(0)
    expect(stateCleared.pointerPos).toBeNull()
  })

  it('stops drawing trail once click is dropped and does not follow cursor with a line', () => {
    const redraw = vi.fn()
    const { result } = renderHook(() =>
      useLaserPointer({
        active: true,
        duration: 1000,
        redraw,
      }),
    )

    // Default pointer color is red
    expect(result.current.getLaserState().color).toBe('red')

    // 1. Mouse down at (10, 10) -> starts drawing
    act(() => {
      result.current.handleLaserPointerDown({ x: 10, y: 10 })
    })
    expect(result.current.getLaserState().isDrawing).toBe(true)
    expect(result.current.getLaserState().trail.length).toBe(1)

    // 2. Mouse move while down to (20, 20) -> adds to trail
    act(() => {
      result.current.handleLaserPointerMove({ x: 20, y: 20 })
    })
    expect(result.current.getLaserState().trail.length).toBe(2)

    // 3. Drop click (mouse up) -> isDrawing becomes false
    act(() => {
      result.current.handleLaserPointerUp()
    })
    expect(result.current.getLaserState().isDrawing).toBe(false)
    expect(result.current.getLaserState().trail.length).toBe(2)

    // 4. Move cursor to (100, 100) after dropping click -> updates cursor dot, but does NOT add to trail!
    act(() => {
      result.current.handleLaserPointerMove({ x: 100, y: 100 })
    })
    const state = result.current.getLaserState()
    expect(state.pointerPos).toEqual({ x: 100, y: 100 })
    expect(state.trail.length).toBe(2) // No new points added!

    // Verify renderLaserOnCanvas does not draw a line to (100, 100)
    const mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      arc: vi.fn(),
      lineCap: 'round',
      lineJoin: 'round',
      strokeStyle: '',
      fillStyle: '',
      lineWidth: 1,
      shadowColor: '',
      shadowBlur: 0,
      globalAlpha: 1,
    } as unknown as CanvasRenderingContext2D

    renderLaserOnCanvas(mockCtx, state)
    // Ribbon is drawn and filled
    expect(mockCtx.fill).toHaveBeenCalled()
    // Dot is drawn at pointerPos (100, 100)
    expect(mockCtx.arc).toHaveBeenCalledWith(100, 100, 9, 0, Math.PI * 2)
    expect(mockCtx.arc).toHaveBeenCalledWith(100, 100, 4.5, 0, Math.PI * 2)
  })

  it('assigns unique strokeId to separate gestures so distinct strokes are not connected', () => {
    const redraw = vi.fn()
    const { result } = renderHook(() =>
      useLaserPointer({
        active: true,
        duration: 1000,
        redraw,
      }),
    )

    // Stroke 1
    act(() => {
      result.current.handleLaserPointerDown({ x: 10, y: 10 })
      result.current.handleLaserPointerMove({ x: 20, y: 20 })
      result.current.handleLaserPointerUp()
    })

    // Stroke 2
    act(() => {
      result.current.handleLaserPointerDown({ x: 80, y: 80 })
      result.current.handleLaserPointerMove({ x: 90, y: 90 })
      result.current.handleLaserPointerUp()
    })

    const state = result.current.getLaserState()
    expect(state.trail.length).toBe(4)
    expect(state.trail[0].strokeId).not.toBe(state.trail[2].strokeId)

    const mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      arc: vi.fn(),
      lineCap: 'round',
      lineJoin: 'round',
      strokeStyle: '',
      fillStyle: '',
      lineWidth: 1,
      shadowColor: '',
      shadowBlur: 0,
      globalAlpha: 1,
    } as unknown as CanvasRenderingContext2D

    renderLaserOnCanvas(mockCtx, state)
    // Multiple strokes are drawn in distinct paths and filled
    expect(mockCtx.beginPath).toHaveBeenCalledTimes(4) // 2 strokes + 2 dot auras
    expect(mockCtx.fill).toHaveBeenCalledTimes(4)
  })

  it('renders laser overlay when integrated in LeafletTual', () => {
    const { result } = renderHook(() => useLeafletTual({ defaultValue: emptyDoc() }))
    const { container } = render(<LeafletTual map={mockMap} controller={result.current} />)

    const laserCanvas = container.querySelector('canvas.tual-laser-canvas')
    expect(laserCanvas).not.toBeNull()

    // When tool changes to laser
    act(() => {
      result.current.setTool('laser')
    })
    expect(laserCanvas?.getAttribute('data-active')).toBe('true')
  })

  it('renderLaserOnCanvas executes without error on 2d context', () => {
    const mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      arc: vi.fn(),
      lineCap: 'round',
      lineJoin: 'round',
      strokeStyle: '',
      fillStyle: '',
      lineWidth: 1,
      shadowColor: '',
      shadowBlur: 0,
      globalAlpha: 1,
    } as unknown as CanvasRenderingContext2D

    const now = Date.now()
    const laserState = {
      trail: [
        { x: 10, y: 10, time: now },
        { x: 50, y: 50, time: now },
      ],
      pointerPos: { x: 50, y: 50 },
      active: true,
      color: 'red',
    }

    renderLaserOnCanvas(mockCtx, laserState, LASER_LIFETIME_MS)
    expect(mockCtx.save).toHaveBeenCalled()
    expect(mockCtx.restore).toHaveBeenCalled()
    expect(mockCtx.beginPath).toHaveBeenCalled()
  })

  it('renders laser tail and dot with single solid color and no white inner dashes or dots', () => {
    const strokeStyles: string[] = []
    const fillStyles: string[] = []
    const mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      arc: vi.fn(),
      lineCap: 'round',
      lineJoin: 'round',
      get strokeStyle() {
        return ''
      },
      set strokeStyle(val: string) {
        strokeStyles.push(val)
      },
      get fillStyle() {
        return ''
      },
      set fillStyle(val: string) {
        fillStyles.push(val)
      },
      lineWidth: 1,
      shadowColor: '',
      shadowBlur: 0,
      globalAlpha: 1,
    } as unknown as CanvasRenderingContext2D

    const now = Date.now()
    const laserState = {
      trail: [
        { x: 10, y: 10, time: now },
        { x: 50, y: 50, time: now },
      ],
      pointerPos: { x: 50, y: 50 },
      active: true,
      color: 'red',
    }

    renderLaserOnCanvas(mockCtx, laserState, LASER_LIFETIME_MS)
    // No white (#FFFFFF or #fff) stroke or fill used anywhere
    expect(strokeStyles).not.toContain('#FFFFFF')
    expect(strokeStyles).not.toContain('#ffffff')
    expect(fillStyles).not.toContain('#FFFFFF')
    expect(fillStyles).not.toContain('#ffffff')
    // Tail is solid red
    expect(fillStyles).toContain('#E5484D')
  })
})
