'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import type { DocSection } from '../../../config/docs-data'
import { useScrollAnchor } from '../../../lib/use-scroll-anchor'
import { SKILL_MD_CONTENT } from '../../../config/docs-data/skill-md'
import type { SidebarGroupData, SidebarItemData, DocsProps } from '../types'
import { buildSidebarGroups } from './sidebar-helpers'
import { buildEnrichedSections } from './enrich-sections'
import { useDocsHashListener } from './use-docs-hash-listener'

export function useDocs({ skillMdContent }: DocsProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [manualExpanded, setManualExpanded] = useState<Record<string, boolean>>({})
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const [activeChapterId, setActiveChapterId] = useState<string>('introduction')

  const skillContent = skillMdContent || SKILL_MD_CONTENT

  const handleDownloadSkill = useCallback(() => {
    const element = document.createElement('a')
    const file = new Blob([skillContent], { type: 'text/markdown' })
    element.href = URL.createObjectURL(file)
    element.download = 'SKILL.md'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }, [skillContent])

  // Build full sections list, enriching skill-md with code block & download button
  const allSections: DocSection[] = useMemo(() => {
    return buildEnrichedSections({
      skillContent,
      onDownloadSkill: handleDownloadSkill,
    })
  }, [skillContent, handleDownloadSkill])

  // Active chapter resolution
  const currentChapterIndex = useMemo(() => {
    const idx = allSections.findIndex((s) => s.id === activeChapterId)
    return idx !== -1 ? idx : 0
  }, [allSections, activeChapterId])

  const currentChapter = allSections[currentChapterIndex] || allSections[0]
  const prevChapter = currentChapterIndex > 0 ? allSections[currentChapterIndex - 1] : null
  const nextChapter =
    currentChapterIndex < allSections.length - 1 ? allSections[currentChapterIndex + 1] : null

  // Build grouped sidebar items
  const sidebarGroups: SidebarGroupData[] = useMemo(() => {
    return buildSidebarGroups(allSections)
  }, [allSections])

  // In-page TOC scroll tracking
  const currentChapterSectionIds = useMemo(() => {
    const ids = [currentChapter.id]
    if (currentChapter.subsections) {
      currentChapter.subsections.forEach((sub) => ids.push(sub.id))
    }
    return ids
  }, [currentChapter])

  const { activeId: inPageActiveSection, scrollToSection: baseScrollToSection } = useScrollAnchor({
    sectionIds: currentChapterSectionIds,
    offset: () => (window.innerWidth < 1024 ? 120 : 80),
    clearHashAtTop: false,
    initialActiveId: currentChapter.id,
  })

  // Navigate directly to a chapter page
  const goToChapter = useCallback(
    (chapterId: string, subsectionId?: string) => {
      setMobileMenuOpen(false)
      setManualExpanded((prev) => ({
        ...prev,
        [chapterId]: true,
      }))

      if (chapterId === activeChapterId) {
        if (subsectionId) {
          baseScrollToSection(subsectionId)
        } else {
          baseScrollToSection(chapterId)
        }
        return
      }

      // Switching to a new chapter
      setActiveChapterId(chapterId)

      if (subsectionId) {
        window.history.replaceState(null, '', `#${subsectionId}`)
        window.scrollTo({ top: 0, behavior: 'instant' })
        setTimeout(() => {
          baseScrollToSection(subsectionId)
        }, 60)
      } else {
        window.history.replaceState(null, '', `#${chapterId}`)
        window.scrollTo({ top: 0, behavior: 'instant' })
      }
    },
    [activeChapterId, baseScrollToSection],
  )

  // Cross-chapter scroll / target resolution
  const scrollToSection = useCallback(
    (id: string) => {
      const directChapter = allSections.find((s) => s.id === id)
      if (directChapter) {
        goToChapter(directChapter.id)
        return
      }

      const parentChapter = allSections.find((s) => s.subsections?.some((sub) => sub.id === id))
      if (parentChapter) {
        if (parentChapter.id !== activeChapterId) {
          goToChapter(parentChapter.id, id)
        } else {
          baseScrollToSection(id)
        }
        return
      }

      baseScrollToSection(id)
    },
    [allSections, activeChapterId, goToChapter, baseScrollToSection],
  )

  const isSectionExpanded = useCallback(
    (item: SidebarItemData) => {
      if (manualExpanded[item.id] !== undefined) {
        return manualExpanded[item.id]
      }
      return item.id === activeChapterId
    },
    [manualExpanded, activeChapterId],
  )

  const toggleExpand = useCallback(
    (itemId: string) => {
      setManualExpanded((prev) => {
        const currentVal = prev[itemId] !== undefined ? prev[itemId] : itemId === activeChapterId
        return {
          ...prev,
          [itemId]: !currentVal,
        }
      })
    },
    [activeChapterId],
  )

  // Use refs for stable handlers to prevent re-binding listeners on every chapter change
  const allSectionsRef = useRef(allSections)
  allSectionsRef.current = allSections

  const scrollToSectionRef = useRef(scrollToSection)
  scrollToSectionRef.current = scrollToSection

  const goToChapterRef = useRef(goToChapter)
  goToChapterRef.current = goToChapter

  // Attach hash and custom scroll listeners
  useDocsHashListener({
    allSectionsRef,
    scrollToSectionRef,
    goToChapterRef,
    setActiveChapterId,
    setHighlightedId,
  })

  return {
    mobileMenuOpen,
    setMobileMenuOpen,
    allSections,
    currentChapter,
    prevChapter,
    nextChapter,
    activeChapterId,
    inPageActiveSection,
    goToChapter,
    sidebarGroups,
    scrollToSection,
    isSectionExpanded,
    toggleExpand,
    highlightedId,
  }
}

