import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, renderHook, act, within } from '@testing-library/react'
import { SecondaryTooltip } from '../widgets/SecondaryTooltip/SecondaryTooltip.js'
import { useLeafletTual } from '../features/use-leaflet-tual.js'
import type { NoteItem, TextItem } from '../../core/index.js'
import { emptyDoc } from '../../core/index.js'
import { createMockMap } from './test-utils.js'

describe('v2 SecondaryTooltip contextual toolbar', () => {
  it('renders contextual tooltip on selected square shape with single color, radius, dash, and no edit label', () => {
    const { result } = renderHook(() =>
      useLeafletTual({
        defaultValue: emptyDoc(),
      }),
    )

    act(() => {
      const s = result.current.add({
        type: 'shape',
        kind: 'square',
        at: { lat: 41.05, lng: 28.05 },
        width: 100,
        height: 100,
        label: 'Zone A',
      })
      result.current.select(s.id)
    })

    const map = createMockMap()
    render(<SecondaryTooltip map={map} controller={result.current} />)

    // Check single color picker exists (not 2 separate pickers)
    expect(screen.getByTitle('Color')).toBeDefined()
    expect(screen.queryByTitle('Stroke / Text Color')).toBeNull()
    expect(screen.queryByTitle('Fill / Background Color')).toBeNull()

    // Border and Label position buttons
    expect(screen.getByTitle('Border & Stroke')).toBeDefined()
    expect(screen.getByTitle('Label Position')).toBeDefined()
    expect(screen.queryByTitle('Edit Label')).toBeNull()
    expect(screen.getByTitle('More Options')).toBeDefined()

    // Bold, Italic, Underline, Bullets must not appear in secondary tooltip for shapes / labels
    expect(screen.queryByTitle('Bold')).toBeNull()
    expect(screen.queryByTitle('Italic')).toBeNull()
    expect(screen.queryByTitle('Underline')).toBeNull()
    expect(screen.queryByTitle('Bulleted List')).toBeNull()

    // Test updating fill to 'none' via Color dropdown
    const colorBtn = screen.getByTitle('Color')
    fireEvent.click(colorBtn)
    const noFillBtn = screen.getByText('No fill')
    fireEvent.click(noFillBtn)
    expect(result.current.selected[0].style?.fill).toBe('none')

    // Test Border Popover
    const borderBtn = screen.getByTitle('Border & Stroke')
    fireEvent.click(borderBtn)

    // Test updating border dash
    const dashedBtn = screen.getByTitle('Dashed')
    fireEvent.click(dashedBtn)
    expect(result.current.selected[0].style?.dash).toBe('dashed')

    // Test updating stroke width via the unified select control
    const widthSelect = screen.getByRole('combobox', { name: 'Stroke Width' })
    expect(widthSelect.className).toContain('tual-select')
    expect(widthSelect.parentElement?.className).toContain('tual-select-field')
    fireEvent.change(widthSelect, { target: { value: '4' } })
    expect(result.current.selected[0].style?.width).toBe(4)

    // Test updating corner radius via select
    const radiusSelect = screen.getByRole('combobox', { name: 'Corner Radius' })
    expect(radiusSelect.className).toContain('tual-select')
    fireEvent.change(radiusSelect, { target: { value: '16' } })
    expect(result.current.selected[0].style?.radius).toBe(16)

    // Test opening nested color flyout from border color pill
    const borderColPill = screen.getByTitle('Border Color')
    fireEvent.click(borderColPill)
    expect(screen.getByText('Colors')).toBeDefined()
    const purpleOption = screen.getByText('#8E4EC6')
    fireEvent.click(purpleOption)
    expect(result.current.selected[0].style?.strokeColor).toBe('purple')

    // Test updating label position
    const labelPositionBtn = screen.getByTitle('Label Position')
    fireEvent.click(labelPositionBtn)
    expect(screen.getByText('Label Position')).toBeDefined()
    const topBtn = screen.getByText('Top')
    fireEvent.click(topBtn)
    const sel = result.current.selected[0]
    expect(sel?.type === 'shape' ? sel.labelPosition : undefined).toBe('top')
  })

  it('applies the selected color to a shape fill and stroke', () => {
    const { result } = renderHook(() =>
      useLeafletTual({
        defaultValue: emptyDoc(),
      }),
    )

    act(() => {
      const s = result.current.add({
        type: 'shape',
        kind: 'square',
        at: { lat: 41.05, lng: 28.05 },
        width: 100,
        height: 100,
      })
      result.current.select(s.id)
    })

    const map = createMockMap()
    render(<SecondaryTooltip map={map} controller={result.current} />)

    fireEvent.click(screen.getByTitle('Color'))
    fireEvent.click(screen.getByTitle('Red'))

    expect(result.current.selected[0].style).toMatchObject({
      color: 'red',
      fillColor: 'red',
      strokeColor: 'red',
    })
  })

  it('keeps wheel events inside the color dropdown from reaching the map container', () => {
    const { result } = renderHook(() =>
      useLeafletTual({
        defaultValue: emptyDoc(),
      }),
    )

    act(() => {
      const s = result.current.add({
        type: 'shape',
        kind: 'square',
        at: { lat: 41.05, lng: 28.05 },
        width: 100,
        height: 100,
      })
      result.current.select(s.id)
    })

    const map = createMockMap()
    const { container } = render(<SecondaryTooltip map={map} controller={result.current} />)
    fireEvent.click(screen.getByTitle('Color'))

    const onMapWheel = vi.fn()
    container.addEventListener('wheel', onMapWheel)
    const colorList = container.querySelector('.tual-color-list')

    expect(colorList).not.toBeNull()
    fireEvent.wheel(colorList as Element, { deltaY: 120 })
    expect(onMapWheel).not.toHaveBeenCalled()

    container.removeEventListener('wheel', onMapWheel)
  })

  it('does not render corner radius button for non-square shapes (e.g. star)', () => {
    const { result } = renderHook(() =>
      useLeafletTual({
        defaultValue: emptyDoc(),
      }),
    )

    act(() => {
      const s = result.current.add({
        type: 'shape',
        kind: 'star',
        at: { lat: 41.05, lng: 28.05 },
        width: 100,
        height: 100,
      })
      result.current.select(s.id)
    })

    const map = createMockMap()
    render(<SecondaryTooltip map={map} controller={result.current} />)

    expect(screen.getByTitle('Color')).toBeDefined()
    expect(screen.queryByTitle('Corner Radius')).toBeNull()
  })

  it('renders contextual tooltip for note with typography and text alignment', () => {
    const { result } = renderHook(() =>
      useLeafletTual({
        defaultValue: emptyDoc(),
      }),
    )

    act(() => {
      const n = result.current.add({
        type: 'note',
        at: { lat: 41.05, lng: 28.05 },
        text: 'Meet at finish',
      })
      result.current.select(n.id)
    })

    const map = createMockMap()
    render(<SecondaryTooltip map={map} controller={result.current} />)

    expect(screen.getByTitle('Text Size & Style')).toBeDefined()
    expect(screen.getByTitle('Text Color')).toBeDefined()
    expect(screen.getByTitle('Background Color')).toBeDefined()
    expect(screen.getByTitle('Text Alignment')).toBeDefined()

    // Corner radius belongs to the border & stroke menu for notes, not a
    // standalone toolbar button.
    expect(screen.queryByTitle('Corner Radius')).toBeNull()
    fireEvent.click(screen.getByTitle('Border & Stroke'))
    const radiusSelect = screen.getByRole('combobox', { name: 'Corner Radius' })
    fireEvent.change(radiusSelect, { target: { value: '16' } })
    expect(result.current.selected[0].style?.radius).toBe(16)
  })

  it('updates typography size and custom font size on note and shape', () => {
    const { result } = renderHook(() =>
      useLeafletTual({
        defaultValue: emptyDoc(),
      }),
    )

    let noteId = ''
    act(() => {
      const n = result.current.add({
        type: 'note',
        at: { lat: 41.0, lng: 28.0 },
        width: 180,
        height: 180,
        text: 'Typography test',
      })
      noteId = n.id
      result.current.select(n.id)
    })

    const map = createMockMap()
    render(<SecondaryTooltip map={map} controller={result.current} />)

    const typoBtn = screen.getByTitle('Text Size & Style')
    expect(typoBtn).toBeDefined()

    act(() => {
      fireEvent.click(typoBtn)
    })

    const headingBtn = screen.getByText('Heading 1')
    expect(headingBtn).toBeDefined()

    act(() => {
      fireEvent.click(headingBtn)
    })

    const updatedNote = result.current.items.find((it): it is NoteItem => it.id === noteId)
    expect(updatedNote?.style?.size).toBe('xl')
  })

  it('allows custom font size number input and weight select', () => {
    const { result } = renderHook(() =>
      useLeafletTual({
        defaultValue: emptyDoc(),
      }),
    )

    let noteId = ''
    act(() => {
      const n = result.current.add({
        type: 'note',
        at: { lat: 41.0, lng: 28.0 },
        text: 'Custom typo test',
      })
      noteId = n.id
      result.current.select(n.id)
    })

    const map = createMockMap()
    render(<SecondaryTooltip map={map} controller={result.current} />)

    const typoBtn = screen.getByTitle('Text Size & Style')
    act(() => {
      fireEvent.click(typoBtn)
    })

    // Click Custom tab
    const customTab = screen.getByText('Custom')
    act(() => {
      fireEvent.click(customTab)
    })

    // Weight select uses the shared select field classes and custom menu
    const weightSelect = screen.getByLabelText('Font weight') as HTMLSelectElement
    expect(weightSelect).toBeDefined()
    const weightField = screen.getByTitle('Font weight')
    expect(weightField.className).toContain('tual-select-field')
    fireEvent.click(weightField)
    const weightMenu = screen.getByRole('listbox', { name: 'Font weight' })
    expect(within(weightMenu).getByText('Semibold')).toBeDefined()
    act(() => {
      fireEvent.change(weightSelect, { target: { value: 'semibold' } })
    })

    // Font size number input
    const sizeInput = screen.getByLabelText('Font size in pixels') as HTMLInputElement
    expect(sizeInput).toBeDefined()
    act(() => {
      fireEvent.change(sizeInput, { target: { value: '26' } })
    })

    const updatedNote = result.current.items.find((it): it is NoteItem => it.id === noteId)
    expect(updatedNote?.style?.weight).toBe('semibold')
    expect(updatedNote?.style?.fontSize).toBe(26)
  })

  it('toggles bold, italic, underline, and bullets on text fields', () => {
    const { result } = renderHook(() =>
      useLeafletTual({
        defaultValue: emptyDoc(),
      }),
    )

    let textId = ''
    act(() => {
      const t = result.current.add({
        type: 'text',
        at: { lat: 41.0, lng: 28.0 },
        text: 'Hello world',
      })
      textId = t.id
      result.current.select(t.id)
    })

    const map = createMockMap()
    render(<SecondaryTooltip map={map} controller={result.current} />)

    const boldBtn = screen.getByTitle('Bold')
    const italicBtn = screen.getByTitle('Italic')
    const underlineBtn = screen.getByTitle('Underline')
    const bulletsBtn = screen.getByTitle('Bulleted List')

    expect(boldBtn).toBeDefined()
    expect(italicBtn).toBeDefined()
    expect(underlineBtn).toBeDefined()
    expect(bulletsBtn).toBeDefined()

    // Test Bold toggle
    expect(boldBtn.getAttribute('data-active')).toBe('false')
    act(() => {
      fireEvent.click(boldBtn)
    })
    let item = result.current.items.find((it): it is TextItem => it.id === textId)
    expect(item?.style?.weight).toBe('bold')
    expect(boldBtn.getAttribute('data-active')).toBe('true')

    act(() => {
      fireEvent.click(boldBtn)
    })
    item = result.current.items.find((it): it is TextItem => it.id === textId)
    expect(item?.style?.weight).toBe('regular')
    expect(boldBtn.getAttribute('data-active')).toBe('false')

    // Test Italic toggle
    expect(italicBtn.getAttribute('data-active')).toBe('false')
    act(() => {
      fireEvent.click(italicBtn)
    })
    item = result.current.items.find((it): it is TextItem => it.id === textId)
    expect(item?.style?.fontStyle).toBe('italic')
    expect(italicBtn.getAttribute('data-active')).toBe('true')

    act(() => {
      fireEvent.click(italicBtn)
    })
    item = result.current.items.find((it): it is TextItem => it.id === textId)
    expect(item?.style?.fontStyle).toBe('normal')
    expect(italicBtn.getAttribute('data-active')).toBe('false')

    // Test Underline toggle
    expect(underlineBtn.getAttribute('data-active')).toBe('false')
    act(() => {
      fireEvent.click(underlineBtn)
    })
    item = result.current.items.find((it): it is TextItem => it.id === textId)
    expect(item?.style?.underline).toBe(true)
    expect(item?.style?.textDecoration).toBe('underline')
    expect(underlineBtn.getAttribute('data-active')).toBe('true')

    act(() => {
      fireEvent.click(underlineBtn)
    })
    item = result.current.items.find((it): it is TextItem => it.id === textId)
    expect(item?.style?.underline).toBe(false)
    expect(item?.style?.textDecoration).toBe('none')
    expect(underlineBtn.getAttribute('data-active')).toBe('false')

    // Test Bullets toggle
    expect(bulletsBtn.getAttribute('data-active')).toBe('false')
    act(() => {
      fireEvent.click(bulletsBtn)
    })
    item = result.current.items.find((it): it is TextItem => it.id === textId)
    expect(item?.text).toBe('• Hello world')
    expect(bulletsBtn.getAttribute('data-active')).toBe('true')

    act(() => {
      fireEvent.click(bulletsBtn)
    })
    item = result.current.items.find((it): it is TextItem => it.id === textId)
    expect(item?.text).toBe('Hello world')
    expect(bulletsBtn.getAttribute('data-active')).toBe('false')
  })

  it('renders Theme and Custom tabs in background color dropdown and allows custom color with opacity', () => {
    const { result } = renderHook(() =>
      useLeafletTual({
        defaultValue: emptyDoc(),
      }),
    )

    let noteId = ''
    act(() => {
      const n = result.current.add({
        type: 'note',
        at: { lat: 41.05, lng: 28.05 },
        text: 'Note for color test',
        style: { color: 'yellow' },
      })
      noteId = n.id
      result.current.select(n.id)
    })

    const map = createMockMap()
    render(<SecondaryTooltip map={map} controller={result.current} />)

    const bgBtn = screen.getByTitle('Background Color')
    expect(bgBtn).toBeDefined()

    // Open Background Color popover
    act(() => {
      fireEvent.click(bgBtn)
    })

    // Should have Theme and Custom tabs
    const themeTab = screen.getByRole('button', { name: 'Theme' })
    const customTab = screen.getByRole('button', { name: 'Custom' })
    expect(themeTab).toBeDefined()
    expect(customTab).toBeDefined()
    expect(themeTab.getAttribute('data-active')).toBe('true')

    // Click Custom tab
    act(() => {
      fireEvent.click(customTab)
    })
    expect(customTab.getAttribute('data-active')).toBe('true')

    // Should render custom color panel elements: hex field, opacity input, sliders
    const hexInput = screen.getByLabelText('Hex color') as HTMLInputElement
    const opacityInput = screen.getByLabelText('Opacity percentage') as HTMLInputElement
    expect(hexInput).toBeDefined()
    expect(opacityInput).toBeDefined()

    // Change hex color
    act(() => {
      fireEvent.change(hexInput, { target: { value: '#ff5500' } })
    })

    let noteItem = result.current.items.find((it): it is NoteItem => it.id === noteId)
    expect(noteItem?.style?.fillColor).toBe('#FF5500')

    // Change opacity percentage to 75%
    act(() => {
      fireEvent.change(opacityInput, { target: { value: '75' } })
    })

    noteItem = result.current.items.find((it): it is NoteItem => it.id === noteId)
    expect(noteItem?.style?.fillColor).toBe('rgba(255, 85, 0, 0.75)')
  })

  it('does not render inline bold, italic, underline, or bullets buttons for shape labels in secondary tooltip', () => {
    const { result } = renderHook(() =>
      useLeafletTual({
        defaultValue: emptyDoc(),
      }),
    )

    act(() => {
      const shape = result.current.add({
        type: 'shape',
        kind: 'square',
        at: { lat: 41.0, lng: 28.0 },
        width: 100,
        height: 100,
        label: 'Square Label',
      })
      result.current.select(shape.id)
    })

    const map = createMockMap()
    render(<SecondaryTooltip map={map} controller={result.current} />)

    // Secondary tooltip for shape has Typography pill button (which has Custom tab inside)
    expect(screen.getByTitle('Text Size & Style')).toBeDefined()

    // Must NOT have direct inline bold/italic/underline/bullets buttons
    expect(screen.queryByTitle('Bold')).toBeNull()
    expect(screen.queryByTitle('Italic')).toBeNull()
    expect(screen.queryByTitle('Underline')).toBeNull()
    expect(screen.queryByTitle('Bulleted List')).toBeNull()
  })
})
