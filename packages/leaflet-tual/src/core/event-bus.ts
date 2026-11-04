export type EventListener<Args extends unknown[] = unknown[]> = (...args: Args) => void

type GenericListener = (...args: unknown[]) => void

export class EventBus<Events extends Record<string, unknown[]> = Record<string, unknown[]>> {
  private listeners: Map<keyof Events, Set<GenericListener>> = new Map()

  on<K extends keyof Events>(event: K, handler: (...args: Events[K]) => void): () => void {
    let set = this.listeners.get(event)
    if (!set) {
      set = new Set()
      this.listeners.set(event, set)
    }
    const genericHandler = handler as GenericListener
    set.add(genericHandler)
    return () => {
      set?.delete(genericHandler)
      if (set?.size === 0) {
        this.listeners.delete(event)
      }
    }
  }

  emit<K extends keyof Events>(event: K, ...args: Events[K]): void {
    const set = this.listeners.get(event)
    if (!set) return
    for (const handler of Array.from(set)) {
      handler(...(args as unknown[]))
    }
  }

  off<K extends keyof Events>(event: K, handler: (...args: Events[K]) => void): void {
    this.listeners.get(event)?.delete(handler as GenericListener)
  }

  clear(): void {
    this.listeners.clear()
  }
}
