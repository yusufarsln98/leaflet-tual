import { afterEach, describe, expect, it, vi } from 'vitest'
import { createController } from '../../../../core/controller.js'
import {
  DEFAULT_SHORTCUT_BINDINGS,
  getShortcutLabel,
  resolveKeyboardShortcuts,
  setupKeyboardShortcuts,
} from '../keyboard-shortcuts.js'

const cleanups: Array<() => void> = []

function press(key: string, target: EventTarget = document.body, init: KeyboardEventInit = {}) {
  target.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }),
  )
}

afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup()
  document.body.innerHTML = ''
})

describe('keyboard shortcut configuration', () => {
  it('resolves defaults and applies per-action overrides', () => {
    const defaults = resolveKeyboardShortcuts()
    expect(getShortcutLabel(defaults, 'select')).toBe('V')
    expect(getShortcutLabel(defaults, 'undo')).toBe('Mod+Z')
    expect(getShortcutLabel(defaults, 'redo')).toBe('Mod+Shift+Z')

    const custom = resolveKeyboardShortcuts({
      select: 'Q',
      redo: 'Mod+R',
      delete: false,
    })
    expect(getShortcutLabel(custom, 'select')).toBe('Q')
    expect(getShortcutLabel(custom, 'redo')).toBe('Mod+R')
    expect(getShortcutLabel(custom, 'delete')).toBeUndefined()
    expect(getShortcutLabel(custom, 'note')).toBe('N')
  })

  it('disables every binding with false or enabled: false', () => {
    for (const options of [false, { enabled: false }] as const) {
      const resolved = resolveKeyboardShortcuts(options)
      for (const action of Object.keys(DEFAULT_SHORTCUT_BINDINGS)) {
        expect(resolved[action as keyof typeof resolved]).toEqual([])
      }
    }
  })

  it('uses custom tool bindings and removes the replaced default', () => {
    const controller = createController()
    cleanups.push(setupKeyboardShortcuts(controller, {}, { note: 'Q' }))

    press('n')
    expect(controller.tool).toBe('select')

    press('q')
    expect(controller.tool).toBe('note')
  })

  it('matches modifier bindings exactly', () => {
    const controller = createController()
    cleanups.push(setupKeyboardShortcuts(controller, {}, { pen: 'Mod+P' }))

    press('p')
    expect(controller.tool).toBe('select')

    press('p', document.body, { ctrlKey: true })
    expect(controller.tool).toBe('pen')
  })

  it('does not treat Shift as part of an unmodified letter shortcut', () => {
    const controller = createController()
    cleanups.push(setupKeyboardShortcuts(controller))

    press('P', document.body, { shiftKey: true })
    expect(controller.tool).toBe('select')
  })

  it('disables all shortcuts when configured with false', () => {
    const controller = createController()
    const note = controller.add({ type: 'note', at: { lat: 0, lng: 0 }, text: 'Note' })
    controller.select(note.id)
    const onEscape = vi.fn()
    cleanups.push(setupKeyboardShortcuts(controller, { onEscape }, false))

    press('n')
    expect(controller.tool).toBe('select')

    press('Escape')
    expect(onEscape).not.toHaveBeenCalled()
    expect(controller.selection).toEqual([note.id])
  })

  it('can disable one action without affecting the others', () => {
    const controller = createController()
    const note = controller.add({ type: 'note', at: { lat: 0, lng: 0 }, text: 'Note' })
    controller.select(note.id)
    const onEscape = vi.fn()
    cleanups.push(setupKeyboardShortcuts(controller, { onEscape }, { escape: false }))

    press('Escape')
    expect(onEscape).not.toHaveBeenCalled()
    expect(controller.selection).toEqual([note.id])

    press('t')
    expect(controller.tool).toBe('text')
  })

  it('ignores shortcuts originating from editable and interactive elements', () => {
    const controller = createController()
    cleanups.push(setupKeyboardShortcuts(controller))

    const link = document.createElement('a')
    link.href = '#'
    const contentEditable = document.createElement('div')
    contentEditable.setAttribute('contenteditable', 'true')
    const textbox = document.createElement('div')
    textbox.setAttribute('role', 'textbox')
    const listbox = document.createElement('div')
    listbox.setAttribute('role', 'listbox')
    const dialog = document.createElement('div')
    dialog.setAttribute('role', 'dialog')
    const toolbar = document.createElement('div')
    toolbar.className = 'tual-toolbar'

    const elements = [
      document.createElement('input'),
      document.createElement('textarea'),
      document.createElement('select'),
      document.createElement('button'),
      link,
      contentEditable,
      textbox,
      listbox,
      dialog,
      toolbar,
    ]

    for (const element of elements) {
      document.body.appendChild(element)
      press('n', element)
      expect(controller.tool).toBe('select')
    }
  })

  it('ignores shortcuts inside a modal dialog', () => {
    const controller = createController()
    cleanups.push(setupKeyboardShortcuts(controller))

    const dialog = document.createElement('div')
    dialog.setAttribute('aria-modal', 'true')
    const content = document.createElement('div')
    dialog.appendChild(content)
    document.body.appendChild(dialog)

    press('n', content)
    expect(controller.tool).toBe('select')
  })
})
