'use client'

import { useState, useMemo } from 'react'
import type { ReleaseGroup, ReleaseType, VersionTab } from './types'

export function useChangelogFilters(releases: ReleaseGroup[]) {
  const latestRelease = releases[0]
  const latestMajor = latestRelease?.major ?? 0
  const defaultVersionTag = `v${latestMajor}`

  const [versionFilter, setVersionFilter] = useState<string>(defaultVersionTag)
  const [typeFilter, setTypeFilter] = useState<ReleaseType>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const counts = useMemo(() => {
    const res: Record<string, number> = {
      all: releases.length,
    }
    for (const r of releases) {
      const key = `v${r.major}`
      res[key] = (res[key] || 0) + 1
    }
    return res
  }, [releases])

  const versionTabs: VersionTab[] = useMemo(() => {
    return [
      {
        id: defaultVersionTag,
        label: `${defaultVersionTag}.x`,
        count: counts[defaultVersionTag] || 0,
      },
      { id: 'all', label: 'All Releases', count: counts.all },
    ]
  }, [defaultVersionTag, counts])

  const filteredReleases = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return releases.filter((r) => {
      if (versionFilter !== 'all') {
        if (versionFilter.startsWith('v')) {
          const majorNum = parseInt(versionFilter.slice(1), 10)
          if (!isNaN(majorNum) && r.major !== majorNum) return false
        }
      }
      if (typeFilter !== 'all' && r.type !== typeFilter) return false
      if (q && !r.fullText.toLowerCase().includes(q) && !r.version.includes(q)) {
        return false
      }
      return true
    })
  }, [releases, versionFilter, typeFilter, searchQuery])

  const resetFilters = () => {
    setSearchQuery('')
    setVersionFilter(defaultVersionTag)
    setTypeFilter('all')
  }

  return {
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
  }
}

