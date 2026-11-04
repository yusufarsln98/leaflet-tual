import type L from 'leaflet'
import { vi } from 'vitest'

export class MockPointerEvent extends MouseEvent {
  pointerId = 1
  pointerType = 'mouse'
  isPrimary = true
}

if (typeof window.PointerEvent === 'undefined') {
  window.PointerEvent = MockPointerEvent as unknown as typeof PointerEvent
  ;(globalThis as unknown as Record<string, unknown>).PointerEvent = MockPointerEvent
}

export function createMockMap(overrides: Partial<Record<string, unknown>> = {}): L.Map {
  const mapContainer = document.createElement('div')
  const draggingState = { enabled: true }
  return {
    getContainer: () => mapContainer,
    getSize: () => ({ x: 800, y: 600 }),
    getZoom: () => 14,
    latLngToContainerPoint: () => ({ x: 100, y: 100 }),
    containerPointToLatLng: (pt: [number, number] | { x: number; y: number }) => {
      const [x, y] = Array.isArray(pt) ? pt : [pt.x, pt.y]
      return { lat: y / 10, lng: x / 10 }
    },
    layerPointToLatLng: () => ({ lat: 41.0, lng: 28.0 }),
    latLngToLayerPoint: () => ({ x: 100, y: 100 }),
    on: vi.fn(),
    off: vi.fn(),
    dragging: {
      enable: vi.fn(() => { draggingState.enabled = true }),
      disable: vi.fn(() => { draggingState.enabled = false }),
      enabled: () => draggingState.enabled,
    },
    doubleClickZoom: {
      enable: vi.fn(),
      disable: vi.fn(),
      enabled: () => true,
    },
    boxZoom: {
      enable: vi.fn(),
      disable: vi.fn(),
      enabled: () => true,
    },
    ...overrides,
  } as unknown as L.Map
}

export function createMockCanvasContext(): CanvasRenderingContext2D {
  return {
    clearRect: vi.fn(),
    scale: vi.fn(),
    translate: vi.fn(),
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

