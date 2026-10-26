import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react'
import { SecondaryTooltip } from '../widgets/SecondaryTooltip/SecondaryTooltip.js'
import { useLeafletTual } from '../features/use-leaflet-tual.js'
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
        from: { lat: 41, lng: 28 },
        to: { lat: 41.1, lng: 28.1 },
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
    expect((result.current.selected[0] as any).labelPosition).toBe('top')
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
        from: { lat: 41, lng: 28 },
        to: { lat: 41.1, lng: 28.1 },
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
        from: { lat: 41, lng: 28 },
        to: { lat: 41.1, lng: 28.1 },
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
    expect(screen.getByTitle('Corner Radius')).toBeDefined()
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
        from: { lat: 41.0, lng: 28.0 },
        to: { lat: 41.01, lng: 28.01 },
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

    const updatedNote = result.current.items.find((it) => it.id === noteId) as any
    expect(updatedNote.style?.size).toBe('xl')
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

    // Weight select
    const weightSelect = screen.getByLabelText('Font weight') as HTMLSelectElement
    expect(weightSelect).toBeDefined()
    act(() => {
      fireEvent.change(weightSelect, { target: { value: 'semibold' } })
    })

    // Font size number input
    const sizeInput = screen.getByLabelText('Font size in pixels') as HTMLInputElement
    expect(sizeInput).toBeDefined()
    act(() => {
      fireEvent.change(sizeInput, { target: { value: '26' } })
    })

    const updatedNote = result.current.items.find((it) => it.id === noteId) as any
    expect(updatedNote.style?.weight).toBe('semibold')
    expect(updatedNote.style?.fontSize).toBe(26)
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
    let item = result.current.items.find((it) => it.id === textId) as any
    expect(item.style?.weight).toBe('bold')
    expect(boldBtn.getAttribute('data-active')).toBe('true')

    act(() => {
      fireEvent.click(boldBtn)
    })
    item = result.current.items.find((it) => it.id === textId) as any
    expect(item.style?.weight).toBe('regular')
    expect(boldBtn.getAttribute('data-active')).toBe('false')

    // Test Italic toggle
    expect(italicBtn.getAttribute('data-active')).toBe('false')
    act(() => {
      fireEvent.click(italicBtn)
    })
    item = result.current.items.find((it) => it.id === textId) as any
    expect(item.style?.fontStyle).toBe('italic')
    expect(italicBtn.getAttribute('data-active')).toBe('true')

    act(() => {
      fireEvent.click(italicBtn)
    })
    item = result.current.items.find((it) => it.id === textId) as any
    expect(item.style?.fontStyle).toBe('normal')
    expect(italicBtn.getAttribute('data-active')).toBe('false')

    // Test Underline toggle
    expect(underlineBtn.getAttribute('data-active')).toBe('false')
    act(() => {
      fireEvent.click(underlineBtn)
    })
    item = result.current.items.find((it) => it.id === textId) as any
    expect(item.style?.underline).toBe(true)
    expect(item.style?.textDecoration).toBe('underline')
    expect(underlineBtn.getAttribute('data-active')).toBe('true')

    act(() => {
      fireEvent.click(underlineBtn)
    })
    item = result.current.items.find((it) => it.id === textId) as any
    expect(item.style?.underline).toBe(false)
    expect(item.style?.textDecoration).toBe('none')
    expect(underlineBtn.getAttribute('data-active')).toBe('false')

    // Test Bullets toggle
    expect(bulletsBtn.getAttribute('data-active')).toBe('false')
    act(() => {
      fireEvent.click(bulletsBtn)
    })
    item = result.current.items.find((it) => it.id === textId) as any
    expect(item.text).toBe('• Hello world')
    expect(bulletsBtn.getAttribute('data-active')).toBe('true')

    act(() => {
      fireEvent.click(bulletsBtn)
    })
    item = result.current.items.find((it) => it.id === textId) as any
    expect(item.text).toBe('Hello world')
    expect(bulletsBtn.getAttribute('data-active')).toBe('false')
  })
})
