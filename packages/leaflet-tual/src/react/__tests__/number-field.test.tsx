import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NumberField } from '../ui/index.js'

describe('NumberField component', () => {
  it('renders input with default step=1', () => {
    const onChange = vi.fn()
    render(<NumberField value={10} onChange={onChange} aria-label="Test Number" />)

    const input = screen.getByLabelText('Test Number') as HTMLInputElement
    expect(input.type).toBe('number')
    expect(input.value).toBe('10')
    expect(input.step).toBe('1')
  })

  it('renders custom step and supports float increments', () => {
    const onChange = vi.fn()
    render(
      <NumberField
        value={0.5}
        step={0.1}
        min={0}
        max={1}
        onChange={onChange}
        aria-label="Opacity"
      />,
    )

    const input = screen.getByLabelText('Opacity') as HTMLInputElement
    expect(input.step).toBe('0.1')

    fireEvent.change(input, { target: { value: '0.6' } })
    expect(onChange).toHaveBeenCalledWith(0.6)
  })

  it('handles integer steps correctly', () => {
    const onChange = vi.fn()
    render(
      <NumberField
        value={16}
        step={1}
        min={8}
        max={144}
        unit="px"
        onChange={onChange}
        aria-label="Font Size"
      />,
    )

    const input = screen.getByLabelText('Font Size') as HTMLInputElement
    expect(input.step).toBe('1')
    expect(screen.getByText('px')).toBeDefined()

    fireEvent.change(input, { target: { value: '24' } })
    expect(onChange).toHaveBeenCalledWith(24)
  })

  it('renders step icons and increments/decrements value on click', () => {
    const onChange = vi.fn()
    render(
      <NumberField
        value={16}
        step={2}
        min={8}
        max={20}
        onChange={onChange}
        aria-label="Font Size"
      />,
    )

    const incrementBtn = screen.getByRole('button', { name: 'Increment' })
    const decrementBtn = screen.getByRole('button', { name: 'Decrement' })
    expect(incrementBtn).toBeDefined()
    expect(decrementBtn).toBeDefined()

    fireEvent.click(incrementBtn)
    expect(onChange).toHaveBeenCalledWith(18)

    fireEvent.click(decrementBtn)
    expect(onChange).toHaveBeenCalledWith(14)
  })

  it('disables increment when at max and decrement when at min', () => {
    const { rerender } = render(
      <NumberField
        value={20}
        step={1}
        min={0}
        max={20}
        onChange={vi.fn()}
        aria-label="Max Val"
      />,
    )

    const incrementBtn = screen.getByRole('button', { name: 'Increment' }) as HTMLButtonElement
    expect(incrementBtn.disabled).toBe(true)

    rerender(
      <NumberField
        value={0}
        step={1}
        min={0}
        max={20}
        onChange={vi.fn()}
        aria-label="Min Val"
      />,
    )

    const decrementBtn = screen.getByRole('button', { name: 'Decrement' }) as HTMLButtonElement
    expect(decrementBtn.disabled).toBe(true)
  })

  it('hides step icons when stepIcons={false}', () => {
    render(
      <NumberField
        value={50}
        stepIcons={false}
        onChange={vi.fn()}
        aria-label="No Icons"
      />,
    )

    expect(screen.queryByRole('button', { name: 'Increment' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Decrement' })).toBeNull()
  })
})
