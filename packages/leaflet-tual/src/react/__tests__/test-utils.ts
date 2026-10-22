import React from 'react'
import type L from 'leaflet'
import { vi } from 'vitest'
import {
  CanvasToolbar,
  useLeafletCanvas,
  type CanvasToolbarProps,
} from '../index.js'

export class MockPointerEvent extends MouseEvent {
  pointerId = 1
  pointerType = 'mouse'
  isPrimary = true
}

if (typeof window.PointerEvent === 'undefined') {
  window.PointerEvent = MockPointerEvent as unknown as typeof PointerEvent
  ;(globalThis as unknown as Record<string, unknown>).PointerEvent = MockPointerEvent
}

export type TestToolbarHarnessProps = Partial<CanvasToolbarProps>

export const TestToolbarHarness: React.FC<TestToolbarHarnessProps> = (props) => {
  const controller = useLeafletCanvas({
    initialItems: [
      {
        id: 'arrow-1',
        type: 'arrow',
        arrowStyle: 'linear',
        start: { lat: 41.0, lng: 28.9 },
        end: { lat: 41.02, lng: 28.95 },
        color: '#2563eb',
        strokeWidth: 3,
        createdAt: 1,
      },
    ],
  })
  return React.createElement(CanvasToolbar, { controller, ...props })
}

export function createMockMap(overrides: Partial<Record<string, unknown>> = {}): L.Map {
  const mapContainer = document.createElement('div')
  return {
    getContainer: () => mapContainer,
    getSize: () => ({ x: 800, y: 600 }),
    getZoom: () => 14,
    latLngToContainerPoint: () => ({ x: 100, y: 100 }),
    containerPointToLatLng: (pt: { x: number; y: number }) => ({
      lat: pt.y / 10,
      lng: pt.x / 10,
    }),
    layerPointToLatLng: () => ({ lat: 41.0, lng: 28.0 }),
    latLngToLayerPoint: () => ({ x: 100, y: 100 }),
    on: vi.fn(),
    off: vi.fn(),
    dragging: {
      enable: vi.fn(),
      disable: vi.fn(),
      enabled: () => true,
    },
    doubleClickZoom: {
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
    setLineDash: vi.fn(),
    measureText: vi.fn().mockReturnValue({ width: 50 }),
    fillText: vi.fn(),
  } as unknown as CanvasRenderingContext2D
}
