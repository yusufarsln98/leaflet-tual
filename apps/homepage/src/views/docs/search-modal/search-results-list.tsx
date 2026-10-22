'use client'

import { Search, FileText, CornerDownLeft } from 'lucide-react'
import type { SearchResult } from '../search-utils'
import { HighlightedText } from './highlighted-text'
import { getCategoryLabel } from './constants'

interface SearchResultsListProps {
  query: string
  results: SearchResult[]
  selectedIndex: number
  onHoverIndex: (idx: number) => void
  onSelect: (targetId: string) => void
}

export function SearchResultsList({
  query,
  results,
  selectedIndex,
  onHoverIndex,
  onSelect,
}: SearchResultsListProps) {
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center text-text-muted">
        <Search className="h-7 w-7 text-text-muted/40 mb-3" />
        <p className="text-xs font-semibold text-text-primary">
          No documentation found for &quot;{query}&quot;
        </p>
        <p className="text-[11px] mt-1 text-text-muted max-w-xs">
          Try searching for &quot;tree&quot;, &quot;resizer&quot;, &quot;metadata&quot;, or
          &quot;popout&quot;.
        </p>
      </div>
    )
  }

  return (
    <>
      {results.map((result, idx) => {
        const isActive = idx === selectedIndex
        const isContentMatch = result.type === 'content'

        return (
          <button
            key={`${result.sectionId}-${result.subsectionId || ''}-${idx}`}
            data-active={isActive}
            onClick={() => onSelect(result.subsectionId || result.sectionId)}
            onMouseEnter={() => onHoverIndex(idx)}
            className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors cursor-pointer ${
              isActive
                ? 'bg-accent/15 border border-accent/35 shadow-xs'
                : 'border border-border-primary/40 bg-bg-pane-inner/30 hover:bg-bg-sidebar hover:border-border-primary'
            }`}
          >
            <div
              className={`p-2 rounded-lg mt-0.5 shrink-0 transition-colors ${
                isActive
                  ? 'bg-accent text-accent-fg'
                  : 'bg-bg-pane border border-border-primary text-text-muted'
              }`}
            >
              <FileText className="h-4 w-4" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-text-muted mb-0.5">
                <span>{getCategoryLabel(result.category)}</span>
                {result.subsectionTitle && (
                  <>
                    <span>•</span>
                    <span className="truncate">{result.sectionTitle}</span>
                  </>
                )}
              </div>

              <h4 className="text-xs font-bold text-text-primary leading-snug">
                <HighlightedText
                  text={result.subsectionTitle || result.sectionTitle}
                  highlight={query}
                />
              </h4>

              {isContentMatch && result.matchedText && (
                <p className="text-[11px] text-text-secondary mt-1 leading-relaxed line-clamp-2">
                  <HighlightedText text={result.matchedText} highlight={query} />
                </p>
              )}
            </div>

            {isActive && (
              <kbd className="self-center kbd shrink-0">
                <CornerDownLeft className="h-2.5 w-2.5" />
              </kbd>
            )}
          </button>
        )
      })}
    </>
  )
}

