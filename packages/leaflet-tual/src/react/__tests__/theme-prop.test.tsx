import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LeafletTual } from '../index.js'
import { emptyDoc } from '../../core/index.js'
import { createMockMap } from './test-utils.js'
import { BorderPopover } from '../widgets/SecondaryTooltip/popovers/BorderPopover.js'

describe('Theme prop & custom select dropdowns', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
  })

  it('sets data-theme on LeafletTual root container from theme prop or system preference', () => {
    const map = createMockMap()
    const { container, rerender } = render(
      <LeafletTual map={map} defaultValue={emptyDoc()} theme="dark" />,
    )
    const root = container.querySelector('.tual')
    expect(root?.getAttribute('data-theme')).toBe('dark')

    rerender(<LeafletTual map={map} defaultValue={emptyDoc()} theme="light" />)
    expect(root?.getAttribute('data-theme')).toBe('light')
  })

  it('renders custom select menu for stroke width and corner radius in BorderPopover', () => {
    const onSelectWidth = vi.fn()
    const onSelectRadius = vi.fn()

    const { container } = render(
      <BorderPopover
        currentWidth={2}
        currentRadius={8}
        isSquareShape={true}
        onSelectDash={vi.fn()}
        onSelectStrokeColor={vi.fn()}
        onSelectWidth={onSelectWidth}
        onSelectRadius={onSelectRadius}
        onClose={vi.fn()}
      />,
    )

    const values = container.querySelectorAll('.tual-select-value')
    expect(values[0]?.textContent).toBe('2')
    expect(values[1]?.textContent).toBe('8')

    const strokeWidthField = screen.getByTitle('Stroke Width')
    fireEvent.click(strokeWidthField)

    const option4 = screen.getByText('4 px')
    expect(option4).toBeDefined()
    fireEvent.click(option4)
    expect(onSelectWidth).toHaveBeenCalledWith(4)

    const cornerRadiusField = screen.getByTitle('Corner Radius')
    fireEvent.click(cornerRadiusField)

    const option16 = screen.getByText('16 px')
    expect(option16).toBeDefined()
    fireEvent.click(option16)
    expect(onSelectRadius).toHaveBeenCalledWith(16)
  })
})
