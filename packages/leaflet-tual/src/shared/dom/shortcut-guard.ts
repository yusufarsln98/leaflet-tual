import { isTualUiTarget } from './ui-guard.js'

const EDITABLE_SELECTOR = [
  'input',
  'textarea',
  'select',
  '[contenteditable]:not([contenteditable="false"])',
  '[role="textbox"]',
  '[role="searchbox"]',
  '[role="combobox"]',
  '[role="listbox"]',
  '[role="slider"]',
  '[role="spinbutton"]',
].join(', ')

const INTERACTIVE_SELECTOR = [
  'button',
  'a[href]',
  'summary',
  '[role="button"]',
  '[role="menuitem"]',
  '[role="option"]',
  '[role="tab"]',
  '[role="tablist"]',
  '[role="switch"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="radiogroup"]',
  '[role="menu"]',
  '[role="menubar"]',
  '[role="toolbar"]',
  '[role="tree"]',
  '[role="treeitem"]',
  '[role="treegrid"]',
  '[role="grid"]',
].join(', ')

const DIALOG_SELECTOR = 'dialog[open], [role="dialog"], [aria-modal="true"]'

function isIgnoredElement(element: Element | null): boolean {
  if (!element) return false
  return Boolean(
    element.closest(EDITABLE_SELECTOR) ||
      element.closest(INTERACTIVE_SELECTOR) ||
      element.closest(DIALOG_SELECTOR) ||
      isTualUiTarget(element),
  )
}

/**
 * Returns true when a keydown belongs to an input, an interactive control, an
 * open dialog, or Tual's own chrome, and must not trigger global map shortcuts.
 */
export function shouldIgnoreShortcutEvent(event: KeyboardEvent): boolean {
  if (event.defaultPrevented || event.isComposing) return true
  if (typeof document !== 'undefined' && document.designMode === 'on') return true

  const target = event.target instanceof Element ? event.target : null
  if (isIgnoredElement(target)) return true

  const active = typeof document !== 'undefined' ? document.activeElement : null
  if (active instanceof Element && active !== target && isIgnoredElement(active)) return true

  return false
}
