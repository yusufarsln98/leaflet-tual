import type { RootContent } from '../../lib/parse-mdx'

export type ReleaseType = 'all' | 'major' | 'minor' | 'patch'

export interface ReleaseGroup {
  version: string
  slug: string
  major: number
  minor: number
  patch: number
  type: 'major' | 'minor' | 'patch'
  nodes: RootContent[]
  summary: string
  fullText: string
}

export interface ChangelogProps {
  contentNodes: RootContent[]
}

export interface VersionTab {
  id: string
  label: string
  count: number
}

