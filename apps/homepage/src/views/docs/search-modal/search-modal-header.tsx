'use client'

import React, { type RefObject } from 'react'
import { Search, X } from 'lucide-react'

interface SearchModalHeaderProps {
  inputRef: RefObject<HTMLInputElement | null>
  query: string
  onQueryChange: (val: string) => void
  onKeyDown: (e: React.KeyboardEvent) => void
}

export function SearchModalHeader({
  inputRef,
  query,
  onQueryChange,
  onKeyDown,
}: SearchModalHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border-primary bg-bg-sidebar/90 shrink-0">
      <Search className="h-4 w-4 text-accent shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Search documentation, APIs, hooks, split topologies..."
        className="w-full bg-transparent border-none outline-hidden text-sm font-medium text-text-primary placeholder:text-text-muted"
      />
      {query && (
        <button
          onClick={() => onQueryChange('')}
          className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-sidebar transition-colors cursor-pointer"
          aria-label="Clear input"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      <kbd className="kbd shrink-0">ESC</kbd>
    </div>
  )
}

