import type { RootContent } from '../../lib/parse-mdx'
import { nodeText } from '../../components/mdx-renderer/ast-utils'
import type { ReleaseGroup } from './types'

export function parseReleaseGroups(nodes: RootContent[]): {
  introNodes: RootContent[]
  releases: ReleaseGroup[]
} {
  const introNodes: RootContent[] = []
  const releases: ReleaseGroup[] = []
  let currentGroup: ReleaseGroup | null = null

  for (const node of nodes) {
    if (node.type === 'heading' && (node as any).depth === 2) {
      if (currentGroup) {
        releases.push(currentGroup)
      }
      const rawTitle = nodeText(node).trim()
      const slug = rawTitle
        .toLowerCase()
        .replace(/[<>`]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      const cleanVersion = rawTitle.replace(/^v/, '')
      const parts = cleanVersion.split('.').map(Number)
      const major = Number.isFinite(parts[0]) ? parts[0] : 0
      const minor = Number.isFinite(parts[1]) ? parts[1] : 0
      const patch = Number.isFinite(parts[2]) ? parts[2] : 0

      currentGroup = {
        version: cleanVersion,
        slug,
        major,
        minor,
        patch,
        type: 'patch',
        nodes: [],
        summary: '',
        fullText: rawTitle,
      }
    } else if (currentGroup) {
      currentGroup.nodes.push(node)
      const text = nodeText(node)
      currentGroup.fullText += ' ' + text
      if (node.type === 'heading') {
        const hText = text.toLowerCase()
        if (hText.includes('major')) {
          currentGroup.type = 'major'
        } else if (hText.includes('minor') && currentGroup.type !== 'major') {
          currentGroup.type = 'minor'
        }
      }
      if (!currentGroup.summary && node.type === 'list') {
        currentGroup.summary = text.slice(0, 160)
      }
    } else {
      introNodes.push(node)
    }
  }

  if (currentGroup) {
    releases.push(currentGroup)
  }

  // Refine fallback type classification based on semver zeros
  for (const r of releases) {
    if (r.patch === 0 && r.minor === 0 && r.major > 0) {
      r.type = 'major'
    } else if (r.patch === 0 && r.minor > 0 && r.type !== 'major') {
      r.type = 'minor'
    }
  }

  return { introNodes, releases }
}

