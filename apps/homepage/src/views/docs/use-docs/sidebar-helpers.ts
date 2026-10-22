import type { DocSection } from '../../../config/docs-data'
import type { SidebarGroupData, SidebarItemData } from '../types'

export function buildSidebarGroups(allSections: DocSection[]): SidebarGroupData[] {
  const groups: Record<string, SidebarGroupData> = {
    overview: { key: 'overview', title: 'Overview & Guides', items: [] },
    core: { key: 'core', title: 'Core Architecture', items: [] },
    advanced: { key: 'advanced', title: 'Advanced Capabilities', items: [] },
    api: { key: 'api', title: 'API & Reference', items: [] },
  }

  allSections.forEach((s) => {
    const item: SidebarItemData = {
      id: s.id,
      title: s.title,
      category: s.category,
      subsections: s.subsections?.map((sub) => ({ id: sub.id, title: sub.title })),
    }
    if (groups[s.category]) {
      groups[s.category].items.push(item)
    }
  })

  return Object.values(groups).filter((g) => g.items.length > 0)
}

