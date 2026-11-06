import type { ToolId } from '../../../core/types.js'

export const KEY_TO_TOOL: Record<string, ToolId> = {
  V: 'select',
  T: 'text',
  N: 'note',
  F: 'freedraw',
  P: 'pen',
  L: 'arrow',
  S: 'shape',
  R: 'ruler',
  A: 'area',
  K: 'laser',
}

export const SHORTCUT_TOOL_ACTIONS: readonly ToolId[] = [
  'select',
  'text',
  'note',
  'freedraw',
  'pen',
  'arrow',
  'shape',
  'ruler',
  'area',
  'laser',
]

export type ShortcutCommandAction =
  | 'undo'
  | 'redo'
  | 'duplicate'
  | 'selectAll'
  | 'delete'
  | 'escape'
  | 'finish'
  | 'nudgeUp'
  | 'nudgeDown'
  | 'nudgeLeft'
  | 'nudgeRight'
  | 'bringForward'
  | 'bringToFront'
  | 'sendBackward'
  | 'sendToBack'

export type ShortcutAction = ToolId | ShortcutCommandAction

/**
 * A key binding using `KeyboardEvent.key` names. Optional modifier prefixes:
 * `Mod` (Cmd on macOS / Ctrl elsewhere), `Ctrl`, `Meta`/`Cmd`, `Shift`, `Alt`.
 * An array registers alternative bindings. `false` disables the action.
 */
export type ShortcutBinding = string | readonly string[] | false

export type KeyboardShortcutsOptions = {
  /** Set to false to disable every shortcut. Defaults to true. */
  enabled?: boolean
} & Partial<Record<ShortcutAction, ShortcutBinding>>

export type ResolvedKeyboardShortcuts = Record<ShortcutAction, readonly string[]>

const TOOL_BINDINGS = Object.fromEntries(
  Object.entries(KEY_TO_TOOL).map(([key, tool]) => [tool, key]),
) as Record<ToolId, string>

const COMMAND_BINDINGS: Record<ShortcutCommandAction, ShortcutBinding> = {
  undo: 'Mod+Z',
  redo: ['Mod+Shift+Z', 'Mod+Y'],
  duplicate: 'Mod+D',
  selectAll: 'Mod+A',
  delete: ['Delete', 'Backspace'],
  escape: 'Escape',
  finish: 'Enter',
  nudgeUp: ['ArrowUp', 'Shift+ArrowUp'],
  nudgeDown: ['ArrowDown', 'Shift+ArrowDown'],
  nudgeLeft: ['ArrowLeft', 'Shift+ArrowLeft'],
  nudgeRight: ['ArrowRight', 'Shift+ArrowRight'],
  bringForward: 'Alt+]',
  bringToFront: ']',
  sendBackward: 'Alt+[',
  sendToBack: '[',
}

export const DEFAULT_SHORTCUT_BINDINGS: Record<ShortcutAction, ShortcutBinding> = {
  ...TOOL_BINDINGS,
  ...COMMAND_BINDINGS,
}

function toBindings(binding: ShortcutBinding): readonly string[] {
  if (binding === false) return []
  return typeof binding === 'string' ? [binding] : [...binding]
}

/**
 * Resolves user shortcut options against the defaults. `false` (or
 * `{ enabled: false }`) disables every binding. Individual actions can be
 * disabled with `false`, and omitted actions keep their default binding.
 */
export function resolveKeyboardShortcuts(
  options?: boolean | KeyboardShortcutsOptions,
): ResolvedKeyboardShortcuts {
  const objectOptions = typeof options === 'object' && options !== null ? options : null
  const disabled = options === false || objectOptions?.enabled === false
  const resolved = {} as ResolvedKeyboardShortcuts

  for (const action of Object.keys(DEFAULT_SHORTCUT_BINDINGS) as ShortcutAction[]) {
    if (disabled) {
      resolved[action] = []
      continue
    }
    const override = objectOptions?.[action]
    resolved[action] = toBindings(
      override === undefined ? DEFAULT_SHORTCUT_BINDINGS[action] : override,
    )
  }

  return resolved
}

/** Returns the first display binding for an action, or `undefined` when disabled. */
export function getShortcutLabel(
  shortcuts: ResolvedKeyboardShortcuts,
  action: ShortcutAction,
): string | undefined {
  return shortcuts[action][0]
}
