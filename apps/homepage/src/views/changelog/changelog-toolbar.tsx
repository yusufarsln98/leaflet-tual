'use client'

import { Search, X } from 'lucide-react'
import type { ReleaseType, VersionTab } from './types'

interface ChangelogToolbarProps {
  versionTabs: VersionTab[]
  versionFilter: string
  onVersionFilterChange: (id: string) => void
  typeFilter: ReleaseType
  onTypeFilterChange: (t: ReleaseType) => void
  searchQuery: string
  onSearchQueryChange: (q: string) => void
}

export function ChangelogToolbar({
  versionTabs,
  versionFilter,
  onVersionFilterChange,
  typeFilter,
  onTypeFilterChange,
  searchQuery,
  onSearchQueryChange,
}: ChangelogToolbarProps) {
  return (
    <div className="sticky top-14 z-20 backdrop-blur-md bg-bg-app/90 border-b border-border-primary transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Version major segment pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            {versionTabs.map((tab) => {
              const active = versionFilter === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => onVersionFilterChange(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[2px] text-xs font-mono transition-colors cursor-pointer ${
                    active
                      ? 'border border-accent/40 bg-accent/10 text-text-primary font-semibold'
                      : 'bg-bg-pane text-text-secondary hover:text-text-primary border border-border-secondary hover:border-text-muted'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1 rounded-[2px] font-mono border ${
                      active
                        ? 'border-accent/30 bg-accent/20 text-text-primary'
                        : 'border-border-primary bg-bg-pane-inner text-text-muted'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Right side: Type filter + Search bar */}
          <div className="flex items-center gap-2">
            {/* Type selector */}
            <div className="hidden lg:flex items-center border border-border-secondary rounded-[2px] bg-bg-pane p-0.5 text-xs font-mono">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'major', label: 'Major' },
                  { id: 'minor', label: 'Minor' },
                  { id: 'patch', label: 'Patch' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => onTypeFilterChange(t.id)}
                  className={`px-2 py-0.5 rounded-[2px] text-[11px] font-mono transition-colors cursor-pointer ${
                    typeFilter === t.id
                      ? 'bg-bg-pane-inner text-text-primary font-semibold border border-border-secondary'
                      : 'text-text-muted hover:text-text-primary border border-transparent'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Live search input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                placeholder="Filter versions or changes..."
                className="w-full pl-8 pr-7 py-1.5 bg-bg-pane border border-border-secondary rounded-[2px] text-xs font-mono text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-accent transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchQueryChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
                  aria-label="Clear filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

