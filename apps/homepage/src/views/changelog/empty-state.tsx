'use client'

import { Filter } from 'lucide-react'

interface EmptyStateProps {
  searchQuery: string
  versionFilter: string
  onReset: () => void
}

export function ChangelogEmptyState({
  searchQuery,
  versionFilter,
  onReset,
}: EmptyStateProps) {
  return (
    <div className="text-center py-20 space-y-4 border border-border-secondary rounded-[3px] bg-bg-pane p-8">
      <div className="w-10 h-10 rounded-[2px] bg-accent/10 border border-accent/25 flex items-center justify-center mx-auto text-accent">
        <Filter className="w-4 h-4" />
      </div>
      <h3 className="font-display text-2xl text-text-primary">No releases found</h3>
      <p className="text-text-muted text-xs max-w-sm mx-auto font-mono">
        No changelog entries matched the active filters &apos;{searchQuery || versionFilter}&apos;.
      </p>
      <button
        onClick={onReset}
        className="px-4 py-1.5 rounded-[2px] bg-bg-inverse text-text-inverse text-xs font-mono font-semibold hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-1.5"
      >
        Reset Filters
      </button>
    </div>
  )
}

