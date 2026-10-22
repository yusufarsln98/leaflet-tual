import React from 'react'
import type L from 'leaflet'
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, act } from '@testing-library/react'
import { NoteOverlay, type NoteItem } from '../index.js'
import './test-utils.js'

describe('NoteOverlay', () => {
  it('uses native default textarea resizer and does not render custom corner handle icon', () => {
    const mapContainer = document.createElement('div')
    const mockMap = {
      getContainer: () => mapContainer,
      dragging: {
        enable: vi.fn(),
        disable: vi.fn(),
      },
    } as unknown as L.Map

    const noteItem = {
      id: 'note-1',
      type: 'note' as const,
      position: { lat: 41.0, lng: 28.9 },
      title: 'Resizable Note',
      text: 'Content here',
      backgroundColor: '#fef9c3',
      textColor: '#422006',
      width: 230,
      createdAt: 1,
    }

    const { container } = render(
      React.createElement(NoteOverlay, {
        item: noteItem,
        screenPos: { x: 100, y: 100 },
        isSelected: true,
        map: mockMap,
        readOnly: false,
        onSelect: vi.fn(),
        onUpdate: vi.fn(),
        onDelete: vi.fn(),
      }),
    )

    // No custom corner overlay icon
    expect(container.querySelector('[data-tual-note-resize]')).toBeNull()

    // Native textarea resizer is active for both directions
    const textarea = container.querySelector(
      '.rlc-note-textarea',
    ) as HTMLTextAreaElement
    expect(textarea).toBeTruthy()
    expect(textarea.style.resize).toBe('both')
  })

  it('disables textarea resize in readOnly mode', () => {
    const mapContainer = document.createElement('div')
    const mockMap = {
      getContainer: () => mapContainer,
      dragging: {
        enable: vi.fn(),
        disable: vi.fn(),
      },
    } as unknown as L.Map

    const noteItem = {
      id: 'note-1',
      type: 'note' as const,
      position: { lat: 41.0, lng: 28.9 },
      title: 'ReadOnly Note',
      text: 'Cannot resize',
      backgroundColor: '#fef9c3',
      textColor: '#422006',
      createdAt: 1,
    }

    const { container } = render(
      React.createElement(NoteOverlay, {
        item: noteItem,
        screenPos: { x: 100, y: 100 },
        isSelected: false,
        map: mockMap,
        readOnly: true,
        onSelect: vi.fn(),
        onUpdate: vi.fn(),
        onDelete: vi.fn(),
      }),
    )

    expect(container.querySelector('[data-tual-note-resize]')).toBeNull()
    const textarea = container.querySelector(
      '.rlc-note-textarea',
    ) as HTMLTextAreaElement
    expect(textarea.style.resize).toBe('none')
  })

  it('disables map.dragging on textarea pointerDown and mouseUp restores it and commits width and height', () => {
    const mapContainer = document.createElement('div')
    const mockMap = {
      getContainer: () => mapContainer,
      dragging: {
        enable: vi.fn(),
        disable: vi.fn(),
      },
    } as unknown as L.Map

    const noteItem = {
      id: 'note-1',
      type: 'note' as const,
      position: { lat: 41.0, lng: 28.9 },
      title: 'Note',
      text: 'Textarea resize test',
      backgroundColor: '#fef9c3',
      textColor: '#422006',
      createdAt: 1,
    }

    const onUpdate = vi.fn()
    const onComplete = vi.fn()

    const { container } = render(
      React.createElement(NoteOverlay, {
        item: noteItem,
        screenPos: { x: 100, y: 100 },
        isSelected: true,
        map: mockMap,
        readOnly: false,
        onSelect: vi.fn(),
        onUpdate,
        onDelete: vi.fn(),
        onComplete,
      }),
    )

    const textarea = container.querySelector(
      '.rlc-note-textarea',
    ) as HTMLTextAreaElement
    expect(textarea).toBeTruthy()

    // Press down on textarea
    fireEvent.pointerDown(textarea)
    expect(mockMap.dragging.disable).toHaveBeenCalled()

    // Mock resized width & height on textarea DOM
    Object.defineProperty(textarea, 'offsetWidth', {
      configurable: true,
      value: 290,
    })
    Object.defineProperty(textarea, 'offsetHeight', {
      configurable: true,
      value: 140,
    })

    // Release pointer on window
    window.dispatchEvent(new PointerEvent('pointerup'))
    expect(mockMap.dragging.enable).toHaveBeenCalled()
    expect(onUpdate).toHaveBeenCalledWith('note-1', { width: 290, height: 140 })
    expect(onComplete).toHaveBeenCalled()
  })

  it('applies height style to textarea when item.height is set', () => {
    const mapContainer = document.createElement('div')
    const mockMap = {
      getContainer: () => mapContainer,
      dragging: {
        enable: vi.fn(),
        disable: vi.fn(),
      },
    } as unknown as L.Map

    const noteItem = {
      id: 'note-1',
      type: 'note' as const,
      position: { lat: 41.0, lng: 28.9 },
      title: 'Note',
      text: 'Vertical resize',
      backgroundColor: '#fef9c3',
      textColor: '#422006',
      width: 230,
      height: 120,
      createdAt: 1,
    }

    const { container } = render(
      React.createElement(NoteOverlay, {
        item: noteItem,
        screenPos: { x: 100, y: 100 },
        isSelected: true,
        map: mockMap,
        readOnly: false,
        onSelect: vi.fn(),
        onUpdate: vi.fn(),
        onDelete: vi.fn(),
      }),
    )

    const textarea = container.querySelector(
      '.rlc-note-textarea',
    ) as HTMLTextAreaElement
    expect(textarea.style.height).toBe('120px')
    expect(textarea.style.resize).toBe('both')
  })

  it('clamps NoteOverlay to viewport bounds so note cards do not bleed off container edges', () => {
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

    const noteItem: NoteItem = {
      id: 'note-edge',
      type: 'note',
      position: { lat: 0, lng: 0 },
      title: 'Edge Note',
      text: 'Close to right screen edge',
      backgroundColor: '#fef9c3',
      textColor: '#000000',
      width: 230,
      createdAt: 0,
    }

    // Positioned near right edge (x = 780), which without clamping would extend to 1010px (outside 800px)
    const { container } = render(
      React.createElement(NoteOverlay, {
        item: noteItem,
        screenPos: { x: 780, y: 550 },
        isSelected: false,
        map: mockMap,
        clampToViewport: true,
        onSelect: vi.fn(),
        onUpdate: vi.fn(),
        onDelete: vi.fn(),
      }),
    )

    const card = container.querySelector('[data-tual-note="note-edge"]') as HTMLElement
    expect(card).toBeDefined()
    const leftVal = parseFloat(card.style.left)
    const topVal = parseFloat(card.style.top)
    // Clamped within 800 - 230 + 16 - 8 = 578px
    expect(leftVal).toBeLessThanOrEqual(580)
    expect(topVal).toBeLessThanOrEqual(520)
  })

  it('auto-collapses NoteOverlay when map zoom is below autoMinimizeZoomThreshold', () => {
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

    const noteItem: NoteItem = {
      id: 'note-auto-collapse',
      type: 'note',
      position: { lat: 0, lng: 0 },
      title: 'Regional Protocol',
      text: 'Should auto-collapse at zoom 10',
      backgroundColor: '#1e293b',
      textColor: '#f8fafc',
      width: 230,
      createdAt: 0,
    }

    const { container } = render(
      React.createElement(NoteOverlay, {
        item: noteItem,
        screenPos: { x: 200, y: 200 },
        isSelected: false,
        map: mockMap,
        autoMinimizeZoomThreshold: 12, // current zoom is 10 < 12
        onSelect: vi.fn(),
        onUpdate: vi.fn(),
        onDelete: vi.fn(),
      }),
    )

    const card = container.querySelector('[data-tual-note="note-auto-collapse"]') as HTMLElement
    expect(card).toBeDefined()
    expect(card.getAttribute('data-collapsed')).toBe('true')
  })

  it('renders NoteOverlay in 3rd compact pill state and supports toggling', () => {
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

    const compactNoteItem: NoteItem = {
      id: 'note-compact-1',
      type: 'note',
      position: { lat: 0, lng: 0 },
      title: 'Checkpoint Beta',
      text: 'Some detailed tactical directions',
      backgroundColor: '#fef08a',
      textColor: '#1e293b',
      collapseState: 'compact',
      createdAt: 0,
    }

    const onUpdate = vi.fn()

    const { container, getByTitle } = render(
      React.createElement(NoteOverlay, {
        item: compactNoteItem,
        screenPos: { x: 100, y: 100 },
        isSelected: false,
        map: mockMap,
        onSelect: vi.fn(),
        onUpdate,
        onDelete: vi.fn(),
      }),
    )

    const card = container.querySelector('[data-tual-note="note-compact-1"]') as HTMLElement
    expect(card).toBeDefined()
    expect(card.classList.contains('rlc-note-compact')).toBe(true)
    expect(card.getAttribute('data-compact')).toBe('true')
    expect(card.style.borderRadius).toBe('9999px')

    // Clicking expand on compact pill transitions to expanded
    const expandBtn = getByTitle('Expand note')
    expect(expandBtn).toBeDefined()
    fireEvent.click(expandBtn)
    expect(onUpdate).toHaveBeenCalledWith('note-compact-1', {
      minimized: false,
    })
  })

  it('does not render compact button in note header and toggles via collapse button', () => {
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

    const expandedNoteItem: NoteItem = {
      id: 'note-expanded-compact-test',
      type: 'note',
      position: { lat: 0, lng: 0 },
      title: 'HQ Memo',
      text: 'Full card body',
      backgroundColor: '#1e293b',
      textColor: '#f8fafc',
      createdAt: 0,
    }

    const onUpdate = vi.fn()

    const { queryByTitle, getByTitle } = render(
      React.createElement(NoteOverlay, {
        item: expandedNoteItem,
        screenPos: { x: 150, y: 150 },
        isSelected: false,
        map: mockMap,
        onSelect: vi.fn(),
        onUpdate,
        onDelete: vi.fn(),
      }),
    )

    // No manual compact button exists in header actions
    expect(queryByTitle('Compact note')).toBeNull()

    // Header has collapse button which collapses to small state
    const collapseBtn = getByTitle('Collapse note')
    expect(collapseBtn).toBeDefined()
    fireEvent.click(collapseBtn)
    expect(onUpdate).toHaveBeenCalledWith('note-expanded-compact-test', {
      minimized: true,
    })
  })

  it('preserves compact state when grabbing or moving a collapsed note', () => {
    const mockMap = {
      getSize: () => ({ x: 800, y: 600 }),
      getContainer: () => ({
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
      }),
      dragging: {
        disable: vi.fn(),
        enable: vi.fn(),
      },
      containerPointToLatLng: (pt: { x: number; y: number }) => ({
        lat: pt.y / 10,
        lng: pt.x / 10,
      }),
    } as unknown as L.Map

    const onUpdate = vi.fn()

    const compactNote: NoteItem = {
      id: 'note-move-compact',
      type: 'note',
      position: { lat: 10, lng: 10 },
      title: 'Move Me',
      text: 'Body of compact note',
      backgroundColor: '#fef08a',
      textColor: '#1e293b',
      collapseState: 'compact',
      createdAt: 0,
    }

    const { container } = render(
      React.createElement(NoteOverlay, {
        item: compactNote,
        screenPos: { x: 100, y: 100 },
        isSelected: false,
        map: mockMap,
        onSelect: vi.fn(),
        onUpdate,
        onDelete: vi.fn(),
      }),
    )

    const header = container.querySelector('.rlc-note-header') as HTMLElement
    expect(header).toBeTruthy()

    // Pointer down initiates drag and pointer move moves the note
    act(() => {
      fireEvent.pointerDown(header, { clientX: 100, clientY: 100 })
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: 140, clientY: 150 }))
      window.dispatchEvent(new PointerEvent('pointerup', { clientX: 140, clientY: 150 }))
    })

    // Note was compact and dragging must preserve compact state: position is updated, but NOT minimized: false
    expect(onUpdate).toHaveBeenCalledWith(
      'note-move-compact',
      expect.objectContaining({ position: expect.any(Object) }),
    )
    expect(onUpdate).not.toHaveBeenCalledWith(
      'note-move-compact',
      expect.objectContaining({ minimized: false }),
    )
    // Card still has compact attribute
    const card = container.querySelector('.rlc-note-card')
    expect(card?.getAttribute('data-compact')).toBe('true')
  })
})
