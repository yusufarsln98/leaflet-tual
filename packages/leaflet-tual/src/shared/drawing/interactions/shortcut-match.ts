const MODIFIER_ALIASES: Record<string, 'mod' | 'ctrl' | 'meta' | 'shift' | 'alt'> = {
  mod: 'mod',
  ctrl: 'ctrl',
  control: 'ctrl',
  meta: 'meta',
  cmd: 'meta',
  command: 'meta',
  shift: 'shift',
  alt: 'alt',
  option: 'alt',
}

const KEY_ALIASES: Record<string, string> = {
  esc: 'Escape',
  space: ' ',
  spacebar: ' ',
  del: 'Delete',
  return: 'Enter',
}

interface ParsedShortcut {
  key: string
  modifiers: Set<'mod' | 'ctrl' | 'meta' | 'shift' | 'alt'>
}

function normalizeKey(value: string): string {
  return (KEY_ALIASES[value.toLowerCase()] ?? value).toLowerCase()
}

function parseShortcut(binding: string): ParsedShortcut | null {
  const parts = binding.split('+').map((part) => part.trim())
  const key = parts.pop()
  if (!key) return null

  const modifiers: ParsedShortcut['modifiers'] = new Set()
  for (const part of parts) {
    const modifier = MODIFIER_ALIASES[part.toLowerCase()]
    if (!modifier) return null
    modifiers.add(modifier)
  }

  return { key, modifiers }
}

function matchesBinding(event: KeyboardEvent, binding: string): boolean {
  const parsed = parseShortcut(binding)
  if (!parsed || normalizeKey(event.key) !== normalizeKey(parsed.key)) return false

  const hasMod = parsed.modifiers.has('mod')
  if (hasMod) {
    if (!event.metaKey && !event.ctrlKey) return false
  } else {
    if (
      (!parsed.modifiers.has('ctrl') && event.ctrlKey) ||
      (!parsed.modifiers.has('meta') && event.metaKey)
    ) {
      return false
    }
  }

  if (parsed.modifiers.has('ctrl') && !event.ctrlKey) return false
  if (parsed.modifiers.has('meta') && !event.metaKey) return false
  if (parsed.modifiers.has('shift') !== event.shiftKey) return false
  if (parsed.modifiers.has('alt') !== event.altKey) return false

  return true
}

/** Checks whether a keydown event matches any of the resolved bindings. */
export function matchesShortcut(event: KeyboardEvent, bindings: readonly string[]): boolean {
  return bindings.some((binding) => matchesBinding(event, binding))
}
