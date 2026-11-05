import { vi } from 'vitest'

export function createMockCanvasContext(): CanvasRenderingContext2D {
  return {
    clearRect: vi.fn(),
    scale: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    setTransform: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    rect: vi.fn(),
    roundRect: vi.fn(),
    ellipse: vi.fn(),
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    strokeRect: vi.fn(),
    fillRect: vi.fn(),
    setLineDash: vi.fn(),
    measureText: vi.fn().mockReturnValue({ width: 50 }),
    fillText: vi.fn(),
  } as unknown as CanvasRenderingContext2D
}
