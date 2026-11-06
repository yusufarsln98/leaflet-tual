'use client'

import { useEffect, useRef, useState } from 'react'
import { Info, X } from 'lucide-react'
import type { FreeTileLayer } from '../../../data/tiles'

interface WorkbenchMapInfoProps {
  tile: FreeTileLayer
}

export function WorkbenchMapInfo({ tile }: WorkbenchMapInfoProps) {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const attribution = `&copy; <a href="https://leafletjs.com" target="_blank" rel="noreferrer">Leaflet</a> · ${tile.attribution}`

  return (
    <div
      ref={rootRef}
      className="absolute bottom-3 right-3 z-[1000] flex flex-col items-end gap-2"
      onPointerDown={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
      onContextMenu={(event) => event.stopPropagation()}
    >
      {isOpen && (
        <div
          role="dialog"
          aria-label="Map information"
          className="w-[min(340px,calc(100vw-2rem))] rounded-lg border border-border-primary bg-bg-sidebar/95 p-3 text-[11px] font-mono text-text-secondary shadow-float backdrop-blur-md [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2"
        >
          <div className="mb-2 flex items-start justify-between gap-3">
            <span className="font-bold uppercase tracking-wider text-text-primary">
              Map information
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-text-muted transition-colors hover:bg-bg-pane hover:text-text-primary"
              title="Close map information"
              aria-label="Close map information"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            <dt className="text-text-muted">Basemap</dt>
            <dd className="text-text-primary">{tile.name}</dd>
            <dt className="text-text-muted">Source</dt>
            <dd className="text-text-primary">{tile.category}</dd>
            <dt className="text-text-muted">Attribution</dt>
            <dd dangerouslySetInnerHTML={{ __html: attribution }} />
          </dl>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-primary bg-bg-sidebar/95 text-text-secondary shadow-float backdrop-blur-md transition-colors hover:border-accent hover:text-accent"
        title="Map information"
        aria-label="Map information"
        aria-expanded={isOpen}
      >
        <Info className="h-4 w-4" />
      </button>
    </div>
  )
}
