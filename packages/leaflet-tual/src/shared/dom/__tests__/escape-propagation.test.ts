import { afterEach, describe, expect, it, vi } from 'vitest'
import { createController } from '../../../core/controller.js'
import { setupKeyboardShortcuts } from '../../drawing/interactions/keyboard-shortcuts.js'
import { setupOutsideDismiss } from '../outside-dismiss.js'

const cleanups: Array<() => void> = []

function dispatchEscape() {
  document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
}

afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup()
  document.body.innerHTML = ''
})

describe('Escape event propagation', () => {
  it('lets host application listeners receive Escape while a Tual popover is open', () => {
    const popover = document.createElement('div')
    document.body.appendChild(popover)

    const onDismiss = vi.fn()
    cleanups.push(setupOutsideDismiss(popover, onDismiss))

    const onAppKeyDown = vi.fn()
    document.addEventListener('keydown', onAppKeyDown)
    cleanups.push(() => document.removeEventListener('keydown', onAppKeyDown))

    dispatchEscape()

    expect(onDismiss).toHaveBeenCalledTimes(1)
    expect(onAppKeyDown).toHaveBeenCalledTimes(1)
    expect((onAppKeyDown.mock.calls[0][0] as KeyboardEvent).key).toBe('Escape')
  })

  it('does not clear the selection or switch tools when Escape dismisses a Tual popover', () => {
    const controller = createController()
    const note = controller.add({
      type: 'note',
      at: { lat: 0, lng: 0 },
      text: 'Note',
    })
    controller.setTool('note')
    controller.select(note.id)

    const onEscape = vi.fn()
    cleanups.push(setupKeyboardShortcuts(controller, { onEscape }))
    cleanups.push(setupOutsideDismiss(document.body, vi.fn()))

    dispatchEscape()

    expect(onEscape).not.toHaveBeenCalled()
    expect(controller.selection).toEqual([note.id])
    expect(controller.tool).toBe('note')
  })

  it('still handles Escape globally when no Tual popover handled it', () => {
    const controller = createController()
    const note = controller.add({
      type: 'note',
      at: { lat: 0, lng: 0 },
      text: 'Note',
    })
    controller.setTool('note')
    controller.select(note.id)

    const onEscape = vi.fn()
    cleanups.push(setupKeyboardShortcuts(controller, { onEscape }))

    dispatchEscape()

    expect(onEscape).toHaveBeenCalledTimes(1)
    expect(controller.selection).toEqual([])
    expect(controller.tool).toBe('select')
  })
})
