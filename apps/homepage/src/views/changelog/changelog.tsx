'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { Footer } from '../../components/footer'
import type { ChangelogProps } from './types'
import { parseReleaseGroups } from './parse-releases'
import { useChangelogFilters } from './use-changelog-filters'
import { ChangelogHero } from './changelog-hero'
import { ChangelogToolbar } from './changelog-toolbar'
import { ReleaseCard } from './release-card'
import { ChangelogEmptyState } from './empty-state'

export function Changelog({ contentNodes }: ChangelogProps) {
  const { introNodes, releases } = useMemo(() => {
    return parseReleaseGroups(contentNodes)
  }, [contentNodes])

  const {
    latestRelease,
    defaultVersionTag,
    versionFilter,
    setVersionFilter,
    typeFilter,
    setTypeFilter,
    searchQuery,
    setSearchQuery,
    versionTabs,
    filteredReleases,
    resetFilters,
  } = useChangelogFilters(releases)

  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Window-level TanStack Virtualizer
  const virtualizer = useWindowVirtualizer({
    count: filteredReleases.length,
    estimateSize: () => 240,
    overscan: 6,
    scrollMargin: listRef.current?.offsetTop ?? 0,
  })

  // Synchronize scrollMargin dynamically when layout mounts
  useEffect(() => {
    if (listRef.current) {
      virtualizer.options.scrollMargin = listRef.current.offsetTop
    }
  }, [virtualizer, filteredReleases])

  const scrollToRelease = (slug: string) => {
    const index = filteredReleases.findIndex((r) => r.slug === slug || r.version === slug)
    if (index !== -1) {
      virtualizer.scrollToIndex(index, { align: 'start', behavior: 'smooth' })
    }
  }

  // Handle URL hash on initial mount or hash change
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (!hash) return

    const matched = releases.find((r) => r.slug === hash || r.version === hash)
    if (matched) {
      const targetTag = `v${matched.major}`
      if (versionFilter !== targetTag && versionFilter !== 'all') {
        setVersionFilter(targetTag)
      }
      setTimeout(() => {
        scrollToRelease(matched.slug)
      }, 100)
    }
  }, [releases])

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${slug}`
    navigator.clipboard.writeText(url)
    setCopiedSlug(slug)
    setTimeout(() => {
      setCopiedSlug(null)
    }, 2000)
  }

  const virtualItems = virtualizer.getVirtualItems()

  return (
    <div className="flex flex-col min-h-screen bg-bg-app transition-colors duration-200">
      {/* Hero Header */}
      <ChangelogHero
        latestRelease={latestRelease}
        defaultVersionTag={defaultVersionTag}
        introNodes={introNodes}
        onSelectLatest={() => {
          setVersionFilter(defaultVersionTag)
          if (latestRelease) scrollToRelease(latestRelease.slug)
        }}
        onScrollToRelease={scrollToRelease}
      />

      {/* Sticky Filter & Search Toolbar */}
      <ChangelogToolbar
        versionTabs={versionTabs}
        versionFilter={versionFilter}
        onVersionFilterChange={setVersionFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />

      {/* Virtualized Timeline Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredReleases.length === 0 ? (
          <ChangelogEmptyState
            searchQuery={searchQuery}
            versionFilter={versionFilter}
            onReset={resetFilters}
          />
        ) : (
          <div
            ref={listRef}
            className="relative w-full"
            style={{
              height: `${virtualizer.getTotalSize()}px`,
            }}
          >
            {/* Continuous Timeline Rail — architectural hairline rail */}
            {filteredReleases.length > 1 && (
              <div
                className="absolute left-3 sm:left-4 -translate-x-1/2 w-px bg-border-secondary pointer-events-none"
                style={{
                  top: 28,
                  height: Math.max(0, virtualizer.getTotalSize() - 56),
                }}
              />
            )}

            {virtualItems.map((virtualItem) => {
              const release = filteredReleases[virtualItem.index]
              const idx = virtualItem.index
              const isFirst = idx === 0 && versionFilter === defaultVersionTag && !searchQuery

              return (
                <div
                  key={release.slug}
                  data-index={virtualItem.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualItem.start - virtualizer.options.scrollMargin}px)`,
                  }}
                  className="pb-6"
                >
                  <ReleaseCard
                    release={release}
                    isFirst={isFirst}
                    copiedSlug={copiedSlug}
                    onScrollToRelease={scrollToRelease}
                    onCopyLink={handleCopyLink}
                  />
                </div>
              )
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

