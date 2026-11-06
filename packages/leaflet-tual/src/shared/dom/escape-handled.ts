/**
 * Tracks Escape keydown events that a Tual floating UI has already handled.
 *
 * `setupOutsideDismiss` marks the event when it closes a popover so the global
 * keyboard shortcuts do not also clear the selection or switch tools, while the
 * event is still allowed to reach host application listeners (e.g. modals).
 */
const handledEscapeEvents = new WeakSet<Event>()

export function markEscapeHandled(event: Event): void {
  handledEscapeEvents.add(event)
}

export function isEscapeHandled(event: Event): boolean {
  return handledEscapeEvents.has(event)
}
