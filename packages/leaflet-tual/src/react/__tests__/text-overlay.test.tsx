import React from 'react'
import type L from 'leaflet'
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import {
  TextOverlay,
  calculateZoomFontSize,
  type TextItem,
} from '../index.js'
import './test-utils.js'

describe('TextOverlay', () => {
  it('clamps TextOverlay to viewport bounds so text does not bleed off container edges', () => {
    const mockMap = {
      getSize: () => ({ x: 800, y: 600 }),
      getContainer: () => ({
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
      }),
      dragging: {
        disable: vi.fn(),
        enable: vi.fn(),
      },
    } as unknown as L.Map

    const textItem: TextItem = {
      id: 'text-edge',
      type: 'text',
      position: { lat: 0, lng: 0 },
      text: 'Facility Perimeter',
      color: '#000000',
      initialFontSize: 16,
      createdAt: 0,
    }

    const { container } = render(
      React.createElement(TextOverlay, {
        item: textItem,
        screenPos: { x: 795, y: 5 },
        isSelected: false,
        map: mockMap,
        clampToViewport: true,
        onSelect: vi.fn(),
        onUpdate: vi.fn(),
        onDelete: vi.fn(),
      }),
    )

    const el = container.querySelector('[data-tual-text="text-edge"]') as HTMLElement
    expect(el).toBeDefined()
    const leftVal = parseFloat(el.style.left)
    const topVal = parseFloat(el.style.top)
    expect(leftVal).toBeLessThan(795)
    expect(topVal).toBeGreaterThan(5)
  })

  it('renders TextOverlay in compact state when map zoom is below threshold and reveals actual state on click', () => {
    const mockMap = {
      getZoom: () => 10,
      getSize: () => ({ x: 800, y: 600 }),
      getContainer: () => ({
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
      }),
      dragging: {
        disable: vi.fn(),
        enable: vi.fn(),
      },
    } as unknown as L.Map

    const onSelect = vi.fn()

    const textItem: TextItem = {
      id: 'txt-compact-1',
      type: 'text',
      position: { lat: 0, lng: 0 },
      text: 'Detailed Observation Post Alpha',
      color: '#1d4ed8',
      initialFontSize: 24,
      createdAt: 0,
    }

    const { container, rerender } = render(
      React.createElement(TextOverlay, {
        item: textItem,
        screenPos: { x: 200, y: 200 },
        isSelected: false,
        map: mockMap,
        autoMinimizeZoomThreshold: 12, // current zoom 10 < 12 -> compact
        onSelect,
        onUpdate: vi.fn(),
        onDelete: vi.fn(),
      }),
    )

    // In low zoom, renders compact pill
    const compactPill = container.querySelector('.rlc-text-compact-pill') as HTMLElement
    expect(compactPill).toBeTruthy()
    expect(compactPill.getAttribute('data-compact')).toBe('true')
    expect(compactPill.style.borderRadius).toBe('9999px')
    expect(compactPill.style.fontSize).toBe('11px')

    // Clicking compact text triggers onSelect and reveals actual state
    fireEvent.click(compactPill)
    expect(onSelect).toHaveBeenCalledWith('txt-compact-1')

    // Re-render as selected
    rerender(
      React.createElement(TextOverlay, {
        item: textItem,
        screenPos: { x: 200, y: 200 },
        isSelected: true,
        map: mockMap,
        autoMinimizeZoomThreshold: 12,
        onSelect,
        onUpdate: vi.fn(),
        onDelete: vi.fn(),
      }),
    )

    // Actual display is rendered with dynamically scaled fontSize (11px at zoom 10 from initial 24px at baseZoom 14)
    const normalDisplay = container.querySelector('.rlc-text-display') as HTMLElement
    expect(normalDisplay).toBeTruthy()
    expect(normalDisplay.style.fontSize).toBe('11px')

    // At base zoom (14), font size matches the initial 24px
    mockMap.getZoom = () => 14
    rerender(
      React.createElement(TextOverlay, {
        item: textItem,
        screenPos: { x: 200, y: 200 },
        isSelected: true,
        map: mockMap,
        onSelect,
        onUpdate: vi.fn(),
        onDelete: vi.fn(),
      }),
    )
    expect(normalDisplay.style.fontSize).toBe('24px')

    // At high zoom (16), font size dynamically scales up to 36px
    mockMap.getZoom = () => 16
    rerender(
      React.createElement(TextOverlay, {
        item: textItem,
        screenPos: { x: 200, y: 200 },
        isSelected: true,
        map: mockMap,
        onSelect,
        onUpdate: vi.fn(),
        onDelete: vi.fn(),
      }),
    )
    expect(normalDisplay.style.fontSize).toBe('36px')
  })

  it('calculates dynamic zoom font size smoothly and stays within proper bounds', () => {
    // At baseZoom (14), font size matches initial exactly
    expect(calculateZoomFontSize(16, 14, 14)).toBe(16)
    // When zoomed in to 16, font size scales up
    expect(calculateZoomFontSize(16, 16, 14)).toBe(24)
    // When zoomed out to 12, font size scales down
    expect(calculateZoomFontSize(16, 12, 14)).toBe(11)
    // When map.getZoom() is null, falls back to initial
    expect(calculateZoomFontSize(18, null, 14)).toBe(18)
    // Clamped to bounds
    expect(calculateZoomFontSize(16, 2, 14)).toBeGreaterThanOrEqual(9)
    expect(calculateZoomFontSize(16, 25, 14)).toBeLessThanOrEqual(72)
  })
})
