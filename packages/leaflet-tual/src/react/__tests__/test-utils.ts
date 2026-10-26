import React from 'react'
import type L from 'leaflet'
import { vi } from 'vitest'
import {
  Toolbar,
  useLeafletTual,
  type ToolbarProps,
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

export type TestToolbarHarnessProps = Partial<ToolbarProps>

export const TestToolbarHarness: React.FC<TestToolbarHarnessProps> = (props) => {
  const controller = useLeafletTual({
    defaultValue: {
      version: 2,
      page: 'p1',
      pages: [
        {
          id: 'p1',
          name: 'Page 1',
          items: [
            {
              id: 'arrow-1',
              type: 'arrow',
              kind: 'linear',
              from: { lat: 41.0, lng: 28.9 },
              to: { lat: 41.02, lng: 28.95 },
              style: { color: 'blue', width: 'm' },
              createdAt: 1,
            },
          ],
        },
      ],
    },
  })
  return React.createElement(Toolbar, { controller, ...props })
}

export function createMockMap(overrides: Partial<Record<string, unknown>> = {}): L.Map {
  const mapContainer = document.createElement('div')
  const draggingState = { enabled: true }
  const scrollWheelZoomState = { enabled: true }
  const boxZoomState = { enabled: true }
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
    fitBounds: vi.fn(),
    setView: vi.fn(),
    getCenter: () => ({ lat: 41, lng: 28 }),
    on: vi.fn(),
    off: vi.fn(),
    dragging: {
      enable: vi.fn(() => { draggingState.enabled = true }),
      disable: vi.fn(() => { draggingState.enabled = false }),
      enabled: () => draggingState.enabled,
    },
    scrollWheelZoom: {
      enable: vi.fn(() => { scrollWheelZoomState.enabled = true }),
      disable: vi.fn(() => { scrollWheelZoomState.enabled = false }),
      enabled: () => scrollWheelZoomState.enabled,
    },
    doubleClickZoom: {
      enable: vi.fn(),
      disable: vi.fn(),
      enabled: () => true,
    },
    boxZoom: {
      enable: vi.fn(() => { boxZoomState.enabled = true }),
      disable: vi.fn(() => { boxZoomState.enabled = false }),
      enabled: () => boxZoomState.enabled,
    },
    ...overrides,
  } as unknown as L.Map
}
