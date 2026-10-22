import React from 'react'
import type L from 'leaflet'
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, renderHook, act } from '@testing-library/react'
import {
  useLeafletCanvas,
  CanvasToolbar,
  NoteOverlay,
  TextOverlay,
} from '../index.js'
import './test-utils.js'

describe('readOnly mode', () => {
  it('prevents item mutations, history changes, and tool switching in useLeafletCanvas', () => {
    const initialItem = {
      id: 'arrow-1',
      type: 'arrow' as const,
      arrowStyle: 'linear' as const,
      start: { lat: 41.0, lng: 28.9 },
      end: { lat: 41.02, lng: 28.95 },
      color: '#2563eb',
      strokeWidth: 3,
      createdAt: 1,
    }

    const { result } = renderHook(() =>
      useLeafletCanvas({
        readOnly: true,
        initialItems: [initialItem],
      }),
    )

    expect(result.current.readOnly).toBe(true)
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)

    // Attempting to add an item is blocked
    act(() => {
      result.current.addItem({
        id: 'arrow-2',
        type: 'arrow',
        arrowStyle: 'curved',
        start: { lat: 40.0, lng: 29.0 },
        end: { lat: 40.5, lng: 29.5 },
        color: '#ff0000',
        strokeWidth: 2,
        createdAt: 2,
      })
    })
    expect(result.current.items).toHaveLength(1)

    // Attempting to delete or clear is blocked
    act(() => {
      result.current.removeItem('arrow-1')
      result.current.clearAll()
    })
    expect(result.current.items).toHaveLength(1)

    // Attempting to switch tools away from select is blocked
    act(() => {
      result.current.setActiveTool('freedraw')
    })
    expect(result.current.activeTool).toBe('select')

    // Attempting to import JSON is blocked
    act(() => {
      const success = result.current.importJSON('[]')
      expect(success).toBe(false)
    })
    expect(result.current.items).toHaveLength(1)

    // Toggling readOnly off allows editing again
    act(() => {
      result.current.setReadOnly(false)
    })
    expect(result.current.readOnly).toBe(false)

    act(() => {
      result.current.setActiveTool('freedraw')
    })
    expect(result.current.activeTool).toBe('freedraw')
  })

  it('renders CanvasToolbar with disabled tool buttons and hides delete/clear/settings in readOnly mode', () => {
    function ReadOnlyToolbar() {
      const controller = useLeafletCanvas({
        readOnly: true,
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
      return React.createElement(CanvasToolbar, { controller })
    }

    const { container, getByTitle } = render(React.createElement(ReadOnlyToolbar))

    const toolbar = container.querySelector('[data-rlc-toolbar]')
    expect(toolbar).toBeTruthy()
    expect(toolbar?.getAttribute('data-readonly')).toBe('true')
    expect(toolbar?.classList.contains('rlc-toolbar-readonly')).toBe(true)

    // Tool buttons for creating items are disabled
    const freedrawBtn = getByTitle(/Free Draw/i) as HTMLButtonElement
    expect(freedrawBtn.disabled).toBe(true)

    const arrowBtn = getByTitle(/Arrows/i) as HTMLButtonElement
    expect(arrowBtn.disabled).toBe(true)

    const shapeBtn = getByTitle(/Shapes/i) as HTMLButtonElement
    expect(shapeBtn.disabled).toBe(true)

    const noteBtn = getByTitle(/Note Card/i) as HTMLButtonElement
    expect(noteBtn.disabled).toBe(true)

    const textBtn = getByTitle(/Normal Text/i) as HTMLButtonElement
    expect(textBtn.disabled).toBe(true)

    // Secondary settings bar and delete/clear buttons are not rendered
    expect(container.querySelector('.rlc-toolbar-secondary')).toBeNull()
    expect(container.querySelector('.rlc-delete-btn')).toBeNull()
  })

  it('renders NoteOverlay in readOnly mode with readOnly inputs and no delete button', () => {
    const mockMap = {
      getContainer: () => ({
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
      }),
      dragging: {
        disable: vi.fn(),
        enable: vi.fn(),
      },
    } as unknown as L.Map

    const noteItem = {
      id: 'note-1',
      type: 'note' as const,
      position: { lat: 41.0, lng: 28.9 },
      title: 'Inspection Point',
      text: 'Do not modify',
      backgroundColor: '#fef9c3',
      textColor: '#422006',
      createdAt: 1,
    }

    const onSelect = vi.fn()
    const onUpdate = vi.fn()
    const onDelete = vi.fn()

    const { container, queryByTitle } = render(
      React.createElement(NoteOverlay, {
        item: noteItem,
        screenPos: { x: 100, y: 100 },
        isSelected: false,
        map: mockMap,
        readOnly: true,
        onSelect,
        onUpdate,
        onDelete,
      }),
    )

    // Delete button is hidden in readOnly mode
    expect(queryByTitle('Delete note')).toBeNull()

    // Title input and textarea have readOnly attribute
    const titleInput = container.querySelector('.rlc-note-title-input') as HTMLInputElement
    expect(titleInput.readOnly).toBe(true)

    const textarea = container.querySelector('.rlc-note-textarea') as HTMLTextAreaElement
    expect(textarea.readOnly).toBe(true)

    // Header dragging does not disable map dragging
    const header = container.querySelector('.rlc-note-header') as HTMLElement
    fireEvent.pointerDown(header)
    expect(mockMap.dragging.disable).not.toHaveBeenCalled()
  })

  it('renders NoteOverlay in collapsed state as a compact pill badge and handles expand/collapse', () => {
    const mockMap = {
      getContainer: () => ({
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
      }),
      dragging: {
        disable: vi.fn(),
        enable: vi.fn(),
      },
    } as unknown as L.Map

    const onUpdate = vi.fn()
    const onSelect = vi.fn()
    const onDelete = vi.fn()

    const collapsedNoteItem = {
      id: 'note-collapsed-1',
      type: 'note' as const,
      position: { lat: 41.0, lng: 28.9 },
      title: 'Maritime Memo',
      text: 'Radio channel 16 is active',
      backgroundColor: '#1e293b',
      textColor: '#f8fafc',
      width: 250,
      minimized: true,
      createdAt: 1,
    }

    const { container, getByTitle } = render(
      React.createElement(NoteOverlay, {
        item: collapsedNoteItem,
        screenPos: { x: 120, y: 160 },
        isSelected: false,
        map: mockMap,
        onSelect,
        onUpdate,
        onDelete,
        classNames: {
          noteCollapsed: 'custom-collapsed-slot',
        },
        styles: {
          noteCollapsed: {
            boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
          },
        },
      }),
    )

    const card = container.querySelector('.rlc-note-card') as HTMLElement
    expect(card).toBeTruthy()
    expect(card.classList.contains('rlc-note-collapsed')).toBe(true)
    expect(card.classList.contains('custom-collapsed-slot')).toBe(true)
    expect(card.getAttribute('data-collapsed')).toBe('true')
    expect(card.style.borderRadius).toBe('9999px')
    expect(card.style.width).toBe('auto')

    // Body textarea is not rendered when collapsed into small pill state
    expect(container.querySelector('.rlc-note-textarea')).toBeNull()

    // Document note icon is not rendered
    expect(container.querySelector('.rlc-note-collapsed-icon')).toBeNull()

    // Expand button is present and fires onUpdate with minimized: false
    const expandBtn = getByTitle('Expand note')
    expect(expandBtn).toBeTruthy()
    fireEvent.click(expandBtn)
    expect(onUpdate).toHaveBeenCalledWith('note-collapsed-1', { minimized: false })
  })

  it('collapses expanded NoteOverlay when clicking the collapse button', () => {
    const mockMap = {
      getContainer: () => ({
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
      }),
      dragging: {
        disable: vi.fn(),
        enable: vi.fn(),
      },
    } as unknown as L.Map

    const onUpdate = vi.fn()

    const expandedNote = {
      id: 'note-expanded-1',
      type: 'note' as const,
      position: { lat: 41.0, lng: 28.9 },
      title: 'Active Brief',
      text: 'Details here',
      backgroundColor: '#fef9c3',
      textColor: '#422006',
      width: 230,
      minimized: false,
      createdAt: 1,
    }

    const { getByTitle } = render(
      React.createElement(NoteOverlay, {
        item: expandedNote,
        screenPos: { x: 50, y: 50 },
        isSelected: false,
        map: mockMap,
        onSelect: vi.fn(),
        onUpdate,
        onDelete: vi.fn(),
      }),
    )

    const collapseBtn = getByTitle('Collapse note')
    expect(collapseBtn).toBeTruthy()
    fireEvent.click(collapseBtn)
    expect(onUpdate).toHaveBeenCalledWith('note-expanded-1', { minimized: true })
  })

  it('renders TextOverlay in readOnly mode without edit popup on double-click', () => {
    const mockMap = {
      getContainer: () => ({
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
      }),
      dragging: {
        disable: vi.fn(),
        enable: vi.fn(),
      },
    } as unknown as L.Map

    const textItem = {
      id: 'text-1',
      type: 'text' as const,
      position: { lat: 41.0, lng: 28.9 },
      text: 'Read-only label',
      color: '#000000',
      initialFontSize: 14,
      createdAt: 1,
    }

    const onSelect = vi.fn()
    const onUpdate = vi.fn()
    const onDelete = vi.fn()

    const { container, getByText } = render(
      React.createElement(TextOverlay, {
        item: textItem,
        screenPos: { x: 100, y: 100 },
        isSelected: true,
        map: mockMap,
        readOnly: true,
        onSelect,
        onUpdate,
        onDelete,
      }),
    )

    expect(getByText('Read-only label')).toBeTruthy()

    // Editing controls strip is not rendered even when isSelected is true
    expect(container.querySelector('.rlc-text-controls')).toBeNull()

    // Double-click does not switch to textarea edit mode
    fireEvent.doubleClick(container.firstChild as Element)
    expect(container.querySelector('.rlc-text-input')).toBeNull()
  })
})
